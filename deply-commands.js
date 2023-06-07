const { REST, Routes } = require('discord.js')
require('dotenv').config()

const fs = require('fs')
const path = require('path')

const commandsPath = path.join(__dirname, 'commands')

const commands = []

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
                commands.push(command.data.toJSON())
            }else{
                console.log(`[WARNING] Command at ${cFilePath} is missing 'Data' and 'Execute' attributes!`)
            }
        }
    }
}

const rest = new REST().setToken(process.env.BOTTOKEN);

(async () => {
    loadCommands()
    try{
        console.log(`Started refreshing ${commands.length} application (/) commands.`)

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.BOTCLIENTID, process.env.MAINSERVERID),
            {body: commands}
        )

        console.log(`Reloaded ${data.length} application (/) commands!`)
    } catch(error){
        console.log(error)
    }
})();