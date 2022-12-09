const mongoose = require('mongoose')
const moment = require('moment');
const keysModel = require("./Schema/Keys"), userModel = require('./Schema/Users')
const crypto = require('crypto');

function randomStr (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len).toUpperCase();   // return required number of characters
}

module.exports.checkTime = async function(name, discrim, id){
    let userDB = await userModel.findOne({ UserID: id });
    if(userDB){
        let formatted = moment(userDB.Time).format('LLL');
        let diff = moment().diff(userDB.Time);
        if(userDB.Time == undefined){
            return "No active subscription"
        }else{
            if(diff > 0){
                return "Expired"
            }else{
                return formatted
            }
        }
    }else{
        userDB = new userModel({
            Name: name,
            Discrim: discrim,
            UserID: id,
            Time: undefined
        })
        await userDB.save().catch(err => console.log(err));
        return "No active subscription";
    };
};

module.exports.fetchMember = async function(name, discrim, id){
    let userDB = await keysModel.findOne({ UserID: id });
    if(userDB){
        return userDB.Time;
    }else{
        userDB = new userModel({
            Name: name,
            Discrim: discrim,
            UserID: id,
            Time: undefined
        })
        await userDB.save().catch(err => console.log(err));
        return userDB.Time;
    };
};

module.exports.claimKey = async function(name, discrim, id, key){
    let userDB = await userModel.findOne({ UserID: id });
    let keysDB = await keysModel.findOne({ Key: key });

    if (userDB){
        let curTime = moment(userDB.Time)
        let futureCurTime = curTime.clone();
        let todayTime = moment();
        let todayCurTime = todayTime.clone();
        if(keysDB && keysDB.Claimed == false){
            let diff = moment().diff(userDB.Time);
        
            if(keysDB.Type == "hours"){
                futureCurTime.add(keysDB.Time, 'hours')
                todayCurTime.add(keysDB.Time, 'hours')
            }else if(keysDB.Type == "days"){
                futureCurTime.add(keysDB.Time, 'days')
                todayCurTime.add(keysDB.Time, 'days')
            }else if(keysDB.Type == "weeks"){
                futureCurTime.add(keysDB.Time, 'weeks')
                todayCurTime.add(keysDB.Time, 'weeks')
            }else if(keysDB.Type == "months"){
                futureCurTime.add(keysDB.Time, 'months')
                todayCurTime.add(keysDB.Time, 'months')
            }

            if(diff > 0){
                await userModel.findOneAndUpdate({UserID: id}, {
                    Time: futureCurTime
                })

                await keysModel.findOneAndUpdate({Key: key}, {
                    Claimed: true,
                    ClaimedBy: id
                })

                return 'Key redeemed!'
            }else{
                await userModel.findOneAndUpdate({UserID: id}, {
                    Time: todayCurTime
                })

                await keysModel.findOneAndUpdate({Key: key}, {
                    Claimed: true,
                    ClaimedBy: id
                })
                return 'Key redeemed!'
            }
        }else{
            return 'Key does not exist!'
        }
    }else{
        let todayTime = moment();
        let todayCurTime = todayTime.clone();
        if(keysDB && keysDB.Claimed == false){
            if(keysDB.Type == "hours"){
                todayCurTime.add(keysDB.Time, 'hours')
            }else if(keysDB.Type == "days"){
                todayCurTime.add(keysDB.Time, 'days')
            }else if(keysDB.Type == "weeks"){
                todayCurTime.add(keysDB.Time, 'weeks')
            }else if(keysDB.Type == "months"){
                todayCurTime.add(keysDB.Time, 'months')
            }
            userDB = new userModel({
                Name: name,
                Discrim: discrim,
                UserID: id,
                Time: todayCurTime
            })
            await userDB.save().catch(err => console.log(err));
            await keysModel.findOneAndUpdate({Key: key}, {
                    Claimed: true,
                    ClaimedBy: id
            })

            return 'Key redeemed!'
        }else{
            return 'Key does not exist!'
        }
    }
};

module.exports.generateKeys = async function(time, amount, type, createdby){
    var keys = [];

    for(var i =0; i < amount; i++){
        var key = randomStr(5)+"-"+randomStr(5)+"-"+randomStr(5);
        let keysDB = await keysModel.findOne({ Key: key});
        keys[i] = key

        keysDB = new keysModel({
            Key: keys[i],
            Time: time,
            Type: type,
            CreatedByID: createdby
        })
        await keysDB.save().catch(err => console.log(err));
    }
    return keys.join(", ");
};