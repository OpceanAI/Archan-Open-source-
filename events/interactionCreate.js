const { Collection } = require('discord.js');
const logger = require('../utils/logger');

/**
 * Interaction Create event handler
 * Handles slash commands with kawaii responses and cooldown system
 */
module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        // Only handle slash commands
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            logger.warn(`❌ Comando no encontrado: ${interaction.commandName} nya~`);
            return interaction.reply({
                content: '❌ ¡Comando no compilado en mi base de datos nya~!',
                ephemeral: true
            });
        }

        // Cooldown system with kawaii messages
        if (!client.cooldowns) {
            client.cooldowns = new Collection();
        }

        if (!client.cooldowns.has(command.data.name)) {
            client.cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = client.cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3; // 3 seconds default
        
        // Command-specific cooldowns
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                const kawaiiCooldownMessages = [
                    `⏰ ¡Espera un poco nya~! Podrás usar este comando <t:${expiredTimestamp}:R> uwu`,
                    `🔄 ¡Algoritmo en proceso! Intenta de nuevo <t:${expiredTimestamp}:R> kawaii`,
                    `⚡ ¡CPU sobrecargada! Cooldown hasta <t:${expiredTimestamp}:R> nya~`,
                    `🧮 ¡Compilando respuesta! Disponible <t:${expiredTimestamp}:R> uwu`
                ];

                const randomMessage = kawaiiCooldownMessages[Math.floor(Math.random() * kawaiiCooldownMessages.length)];
                
                return interaction.reply({
                    content: randomMessage,
                    ephemeral: true
                });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        // Execute command with error handling
        try {
            logger.info(`🔮 Ejecutando comando: ${command.data.name} por ${interaction.user.tag} en ${interaction.guild?.name || 'DM'}`);
            
            await command.execute(interaction);
            
            // Log successful command execution
            client.database.incrementCommandCount();

        } catch (error) {
            logger.error(`❌ Error ejecutando comando ${command.data.name}:`, error);

            const errorMessages = [
                '❌ ¡Error en compilación nya~! Inténtalo de nuevo uwu',
                '💥 ¡Exception no controlada! Los algoritmos kawaii fallan a veces nya~',
                '🔴 ¡Error 500! Mi código necesita debug uwu',
                '⚠️ ¡Stack overflow kawaii! Algo salió mal nya~'
            ];

            const errorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];

            const replyPayload = {
                content: errorMessage,
                ephemeral: true
            };

            // Handle both replied and non-replied interactions
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(replyPayload).catch(console.error);
            } else {
                await interaction.reply(replyPayload).catch(console.error);
            }
        }
    });
};
