const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('../utils/logger');

module.exports = (client) => {
    client.commands = new Collection();
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            logger.info(`Загружена команда: ${command.data.name}`);
        } else {
            logger.warn(`Команда в файле ${filePath} не имеет обязательных свойств 'data' или 'execute'.`);
        }
    }
};
