const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js")
const fs = require("fs")
const fetch = require('node-fetch')


/*
let format = {
    "content": "string", //What I'm Pasting
    "expire_dt": "2023-06-07T20:31:23.535Z", //UTC Expected
    "lexer_name": "string", //What format its in (prob sticking to string fornow)
    "title": "string"  //The title of the paste. Might do just the time it was created?
}*/

let service = process.env.PASTEURL + "api/pastes"

module.exports = {
    intType: "ctx",
    data: new ContextMenuCommandBuilder()
    .setName("Paste File")
    .setType(ApplicationCommandType.Message),
    async execute(interaction){
        let message = interaction.targetMessage

        let attachments = message.attachments
        let firstAttachment = attachments.first()
        if(firstAttachment != undefined){
            if(!firstAttachment.name.endsWith('log') && !firstAttachment.name.endsWith('txt')){
                await interaction.reply("Sorry! I could not find a valid file type! Please only send one .log or .txt file!")
                return
            }
            const resp = await fetch(firstAttachment.url)
            if(!resp.ok){
                await interaction.reply("Sorry.. Something went wrong when requesting the attachment!")
                return
            }
            const text = await resp.text()

            let pasteObject = {}
            pasteObject["content"] = text
            pasteObject["title"] = firstAttachment.name
            
            let d = new Date();
            d.setDate(d.getDate() + 2)
            let utcDay = d.toJSON()
            
            pasteObject["expire_dt"] = utcDay

            const paste = await fetch(service, {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(pasteObject)
            })
            if(!paste.ok){
                await interaction.reply("Sorry.. Something went wrong when creating the paste!")
                return
            }
            const result = await paste.json()
            let pasteID = result["paste_id"]
            if(!pasteID){
                await interaction.reply("Sorry.. Something went wrong when creating the paste!")
                return
            }

            let pasteFirst = pasteID.substr(0, pasteID.length/2)
            let pasteEnd = pasteID.substr(pasteID.length/2)
            
            interaction.reply(`Your paste has been created! Here is the link: ${process.env.PASTEURL}${pasteFirst}-${pasteEnd}/raw`)
            return
        }
    }
}