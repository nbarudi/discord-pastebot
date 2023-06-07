const { Client, Events, GatewayIntentBits, Collection } = require('discord.js')
require("dotenv").config()

const fs = require('fs')
const path = require('path')

const commandsPath = path.join(__dirname, 'commands')

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] })


client.commands = new Collection()

function loadCommands(_path = ''){
    const _cPath = path.join(commandsPath, _path)
    const commandFiles = fs.readdirSync(_cPath)

    console.log(commandFiles)
    for(cFile of commandFiles){
        if(!cFile.endsWith('.js')){
            loadCommands(`${_path}/${cFile}`)
        }else{
            const cFilePath = path.join(_cPath, cFile)
            const command = require(cFilePath)
            if('data' in command && 'execute' in command){
                console.log(`Loading command ${command.data.name}!`)
                client.commands.set(command.data.name, command)
            }else{
                console.log(`[WARNING] Command at ${cFilePath} is missing 'Data' and 'Execute' attributes!`)
            }
        }
    }
}


client.once(Events.ClientReady, c=>{
    console.log(`Logged in as ${c.user.tag}` )

    loadCommands()
})


client.on(Events.InteractionCreate, async interaction =>{
    if(interaction.isChatInputCommand()){
        const command = interaction.client.commands.get(interaction.commandName)
        if(!command){
            console.error(`No command matching ${interaction.commandName} was found..`)
            return
        }
        if(command.intType != "cmd") return;

        try {
            await command.execute(interaction)
        } catch(error) {
            console.error(error)
            if(interaction.replied || interaction.deferred){
                await interaction.followUp({content: "There was an error while executing this command!", ephemeral: true})
            }else{
                await interaction.reply({content: "There was an error while executing this command!", ephemeral: true})
            }
        }
    }
    else if(interaction.isContextMenuCommand()){
        const command = interaction.client.commands.get(interaction.commandName)
        if(!command){
            console.error(`No command matching ${interaction.commandName} was found..`)
            return
        }
        if(command.intType != "ctx") return;
        try {
            await command.execute(interaction)
        } catch(error) {
            console.error(error)
            if(interaction.replied || interaction.deferred){
                await interaction.followUp({content: "There was an error while executing this command!", ephemeral: true})
            }else{
                await interaction.reply({content: "There was an error while executing this command!", ephemeral: true})
            }
        }
    }
})



client.login(process.env.BOTTOKEN)