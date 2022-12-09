/**
 * Intégrations des dépendences 
 */
 const express = require('express');
 const config = require('./config');
 
 /**
  * Intégration des routes stockées dans /routes
  */
 const voice = require('./routes/voice');
 const status = require('./routes/status');
 const gather = require('./routes/gather')
 const call = require('./routes/call');
 const get = require('./routes/get');
 const stream = require('./routes/stream');
 /**
  * Ajout du middleware d'authentification => vérifie si l'on utilise bien l'API avec un mot de passe
  */
 const auth = require('./middleware/authentification');
 const { default: mongoose } = require('mongoose');
 
 process.title = "Syntax OTP | API | Online";

 if (config.setupdone == 'false') setup();
 
 /**
  * Web server side express part
  */
 var app = express();
 app.use(express.urlencoded({
     extended: true
 }));
 
 /*
 *   Connect to DB
 */
 mongoose.connect(config.mongodb, {
     useNewUrlParser: true,
     useUnifiedTopology: true
 }).then(() => {
     console.log('Connected to MongoDB')
 }).catch((err) => {
     console.log('Unable to connect to MongoDB Database.\nError: ' + err)
 })
 
 app.post('/voice/:apipassword', auth, voice);
 app.post('/status/:apipassword', auth, status);
 app.post('/gatherotp/:apipassword', auth, gather);
 app.post('/call', auth, call);
 app.post('/get', auth, get);
 app.get('/stream/:service', stream);
 
 app.use(express.json())
 app.use(function(req, res) {
     res.status(404).json({
         error: 'Not found, or bad request method.'
     });
 });
 
 module.exports = app;