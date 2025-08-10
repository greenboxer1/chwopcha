require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const sequelize = require('./database');
const logger = require('./utils/logger');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();

const sendErrorToOwner = async (error) => {
    try {
        const owner = await client.users.fetch(process.env.OWNER_ID);
        if (owner) {
            const errorMessage = '```\n' +
    'Произошла непредвиденная ошибка:\n' +
    '---------------------------------\n' +
    'Имя: ' + error.name + '\n' +
    'Сообщение: ' + error.message + '\n' +
    'Стек: ' + error.stack + '\n' +
    '```';
            const messageChunks = errorMessage.match(/[\s\S]{1,1990}/g) || [];
            for (const chunk of messageChunks) {
                await owner.send(chunk);
            }
        }
    } catch (e) {
        logger.error('Не удалось отправить сообщение об ошибке владельцу:', e);
    }
};

process.on('uncaughtException', (error) => {
    logger.error('Неперехваченное исключение:', error);
    sendErrorToOwner(error);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Неперехваченный отклоненный промис:', reason);
    const error = reason instanceof Error ? reason : new Error(JSON.stringify(reason));
    sendErrorToOwner(error);
});

const startBot = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Соединение с базой данных успешно установлено.');
        await sequelize.sync({ alter: true });
        logger.info('Модели базы данных синхронизированы.');

        const handlersDir = path.join(__dirname, 'handlers');
        const handlerFiles = fs.readdirSync(handlersDir).filter(file => file.endsWith('.js'));

        for (const file of handlerFiles) {
            require(path.join(handlersDir, file))(client);
        }

        client.login(process.env.TOKEN);

    } catch (error) {
        logger.error('Ошибка при запуске бота:', error);
        await sendErrorToOwner(error);
        process.exit(1);
    }
};

startBot();
