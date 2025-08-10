const { Events } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            logger.error(`Команда "${interaction.commandName}" не найдена.`);
            await interaction.reply({ content: 'Произошла ошибка при выполнении этой команды!', ephemeral: true });
            return;
        }

        try {
            await command.execute(interaction, client);
        } catch (error) {
            logger.error(`Ошибка при выполнении команды "${interaction.commandName}":`, error);
            
            try {
                const owner = await client.users.fetch(process.env.OWNER_ID);
                if (owner) {
                    const errorMessage = '```' + '\nОшибка в команде: ' + interaction.commandName + '\n' +
                        'Пользователь: ' + interaction.user.tag + ' (' + interaction.user.id + ')\n' +
                        'Сервер: ' + (interaction.guild ? `${interaction.guild.name} (${interaction.guild.id})` : 'ЛС') + '\n' +
                        '---------------------------------\n' +
                        error.stack + '\n' +
                        '```';
                    const messageChunks = errorMessage.match(/[\s\S]{1,1990}/g) || [];
                    for (const chunk of messageChunks) {
                        await owner.send(chunk);
                    }
                }
            } catch (e) {
                logger.error('Не удалось отправить сообщение об ошибке владельцу:', e);
            }

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Произошла ошибка при выполнении этой команды!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Произошла ошибка при выполнении этой команды!', ephemeral: true });
            }
        }
    },
};
