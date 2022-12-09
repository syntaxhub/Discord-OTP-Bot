// Requires
require('dotenv').config()
const config = process.env
const token = config.bottoken
const fs = require('node:fs');
const moment = require('moment');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection, ActivityType, EmbedBuilder } = require('discord.js');
const { default: mongoose } = require('mongoose');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences] });
const callsModel = require("./Database/Schema/Calls")
client.Database = require('./Database/mongoose')
client.commands = new Collection();

process.title = "Syntax OTP | Discord Bot | Online";

// Get all Commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Connect to the database
mongoose.connect(config.mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB')
}).catch((err) => {
    console.log('Unable to connect to MongoDB.\nError: ' + err)
})

// Interaction Create
client.on(Events.InteractionCreate, interaction => {
	if (!interaction.isChatInputCommand()) 
		return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		command.execute(interaction);
	} catch (error) {
		console.error(error);
		interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


// Guild Member Join
client.on(Events.GuildMemberAdd, c => {
	if(!c.user.bot){
		let role = c.guild.roles.cache.find(role => role.name === "OTP")
		let db = Database.fetchMember(c.user.username, c.user.discriminator, c.user.id)
		if(db != undefined){
			let diff = moment().diff(db);
			if(diff > 0){
				c.roles.add(role)
			}
		}
	}
})


// Status Update
client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
	/*const member = newPresence.member
	const user = newPresence.user
	const status = '.gg/SyntaxOTP';
	const customStatus = newPresence.activities.find( (activity) => activity.type === ActivityType.Custom)?.state;
	if(member){
		if (customStatus) {
			if (customStatus.includes(status)) {
				
				const embedstatus = new EmbedBuilder()
				.setColor(5763719)
				.setTitle('Status Update')
				.setDescription(`**${user.username}#${user.discriminator}**(**${user.id}**) to **${customStatus}**`)
				.setTimestamp(Date.now())

			  	const logchannel = newPresence.guild.channels.cache.find(c => c.id === config.adminlogchan)
				await logchannel.send({embeds:[embedstatus]})
			}
		}
	}*/
	
})

// Client Ready
client.once(Events.ClientReady, async c => {
	
    let i = 0;
    setInterval(async () => {
		
		const callNum = await callsModel.estimatedDocumentCount().exec()
		var Statuses = [
			`Total Calls ${callNum}`,
			`OTP`,
			`Use /help`,
			`Free trials open ticket for more information`,
			`Cheapest OTP Bot on Market`,
		];
        client.user.setActivity(`${Statuses[i++ % Statuses.length]}`)
    }, 10000);
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);