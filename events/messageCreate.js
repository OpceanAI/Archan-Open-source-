const logger = require('../utils/logger');
const { EmbedBuilder } = require('discord.js');
const geminiService = require('../ai/geminiService');

/**
 * Message Create event handler
 * Handles XP gain, bad word filtering, and general message processing
 */
module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        // Ignore bots and system messages
        if (message.author.bot || message.system) return;
        
        // Ignore DMs
        if (!message.guild) return;

        try {
            const guildData = client.database.getGuild(message.guild.id);
            
            // Process message for statistics
            client.database.incrementMessageCount();

            // Check if Archan should respond with AI
            if (geminiService.shouldRespond(message)) {
                await handleAIResponse(message, client);
                return; // Don't process XP for AI trigger messages
            }

            // Bad word filtering with kawaii responses
            await handleBadWords(message, guildData, client);

            // XP gain system with cooldown (prevent spam)
            await handleXPGain(message, guildData, client);

        } catch (error) {
            logger.error('❌ Error processing message:', error);
        }
    });

    /**
     * Handle bad word filtering with kawaii messages
     */
    async function handleBadWords(message, guildData, client) {
        const { badWords } = guildData;
        
        if (!badWords.enabled || badWords.words.length === 0) return;

        // Check if user has whitelist role
        const hasWhitelistRole = message.member.roles.cache.some(role => 
            badWords.whitelistRoles.includes(role.id)
        );

        if (hasWhitelistRole) return;

        // Check message content for bad words
        const messageContent = message.content.toLowerCase();
        const foundBadWords = badWords.words.filter(word => 
            messageContent.includes(word.toLowerCase())
        );

        if (foundBadWords.length > 0) {
            try {
                // Delete the message
                await message.delete();

                // Send kawaii warning to user via DM
                const warningEmbed = new EmbedBuilder()
                    .setTitle('🚫 Filtro Kawaii Activado')
                    .setDescription('Tu mensaje fue eliminado por contener palabras prohibidas nya~')
                    .addFields(
                        { name: '📝 Servidor', value: message.guild.name, inline: true },
                        { name: '📺 Canal', value: `#${message.channel.name}`, inline: true },
                        { name: '⚠️ Palabras detectadas', value: foundBadWords.length.toString(), inline: true },
                        { name: '💡 Consejo Kawaii', value: 'Usa un lenguaje más apropiado para mantener el servidor seguro uwu', inline: false }
                    )
                    .setColor('#FF6B6B')
                    .setFooter({ text: '🔮 Sistema de filtros compilado con algoritmos kawaii' })
                    .setTimestamp();

                await message.author.send({ embeds: [warningEmbed] }).catch(() => {
                    // If DM fails, send ephemeral message in channel
                    logger.debug(`No se pudo enviar DM a ${message.author.tag} sobre filtro`);
                });

                logger.info(`🚫 Mensaje filtrado de ${message.author.tag} en ${message.guild.name}: ${foundBadWords.join(', ')}`);

            } catch (error) {
                logger.error('❌ Error handling bad word filter:', error);
            }
        }
    }

    /**
     * Handle XP gain with kawaii level up messages
     */
    async function handleXPGain(message, guildData, client) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        
        // Cooldown to prevent XP farming (60 seconds between XP gains)
        const userData = client.database.getUserLevel(guildId, userId);
        const now = Date.now();
        const cooldown = 60000; // 1 minute
        
        if (userData.lastMessage && (now - userData.lastMessage) < cooldown) {
            return; // Still in cooldown
        }

        // Add XP with kawaii calculation
        const result = client.database.addUserXP(guildId, userId);
        
        if (result.leveledUp) {
            await handleLevelUp(message, userData, guildData, result.newLevel, client);
        }
    }

    /**
     * Handle level up with kawaii celebrations and rewards
     */
    async function handleLevelUp(message, userData, guildData, newLevel, client) {
        const { levels, rewards } = guildData;
        const user = message.author;
        const guild = message.guild;

        try {
            // Check for role rewards
            let rewardRole = null;
            if (rewards.has(newLevel)) {
                const roleId = rewards.get(newLevel);
                rewardRole = guild.roles.cache.get(roleId);
                
                if (rewardRole) {
                    try {
                        await message.member.roles.add(rewardRole);
                        logger.info(`🎁 Role reward given: ${rewardRole.name} to ${user.tag} for level ${newLevel}`);
                    } catch (error) {
                        logger.error(`❌ Error giving reward role: ${error.message}`);
                    }
                }
            }

            // Create level up embed
            const levelUpEmbed = new EmbedBuilder()
                .setTitle(levels.levelUpTitle)
                .setDescription(
                    levels.levelUpMessage
                        .replace('{user}', user.toString())
                        .replace('{level}', newLevel.toString())
                        .replace('{oldLevel}', (newLevel - 1).toString())
                )
                .addFields(
                    { name: '🏆 Nuevo Nivel', value: `${newLevel}`, inline: true },
                    { name: '⚡ XP Total', value: `${userData.xp.toLocaleString()}`, inline: true },
                    { name: '💬 Mensajes', value: `${userData.messages}`, inline: true }
                )
                .setColor('#FFD700')
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: '🔮 ¡Sigue programando kawaii para subir más niveles!' })
                .setTimestamp();

            // Add reward information if applicable
            if (rewardRole) {
                const rewardEmbed = new EmbedBuilder()
                    .setTitle(levels.rewardTitle)
                    .setDescription(
                        levels.rewardMessage
                            .replace('{user}', user.toString())
                            .replace('{role}', rewardRole.toString())
                            .replace('{level}', newLevel.toString())
                    )
                    .setColor('#FF69B4')
                    .setFooter({ text: '🔮 ¡Nueva recompensa compilada con algoritmos kawaii!' })
                    .setTimestamp();

                const embeds = [levelUpEmbed, rewardEmbed];
                
                // Send to designated channel or current channel
                const targetChannel = levels.levelUpChannel ? 
                    guild.channels.cache.get(levels.levelUpChannel) : 
                    message.channel;

                if (targetChannel && targetChannel.permissionsFor(guild.members.me).has(['SendMessages', 'EmbedLinks'])) {
                    await targetChannel.send({ embeds });
                }
            } else {
                // Send level up message only
                const targetChannel = levels.levelUpChannel ? 
                    guild.channels.cache.get(levels.levelUpChannel) : 
                    message.channel;

                if (targetChannel && targetChannel.permissionsFor(guild.members.me).has(['SendMessages', 'EmbedLinks'])) {
                    await targetChannel.send({ embeds: [levelUpEmbed] });
                }
            }

            logger.info(`🎉 Level up: ${user.tag} reached level ${newLevel} in ${guild.name} nya~`);

        } catch (error) {
            logger.error('❌ Error handling level up:', error);
        }
    }

    /**
     * Handle AI responses with Gemini kawaii programmer personality
     */
    async function handleAIResponse(message, client) {
        try {
            // Show typing indicator
            await message.channel.sendTyping();

            // Get user's message without the trigger
            const userMessage = message.content
                .replace(/archan/gi, '')
                .trim();

            if (!userMessage) {
                await message.reply("¡Nya~! Me mencionaste pero no veo ninguna pregunta. ¿En qué puedo ayudarte con programación? >w< 💻✨");
                return;
            }

            logger.info(`🤖 AI request from ${message.author.tag}: ${userMessage.substring(0, 100)}...`);

            // Generate AI response with kawaii programmer personality
            const aiResponse = await geminiService.generateKawaiiProgrammerResponse(userMessage);

            // Split long messages to respect Discord's 2000 character limit
            const messageParts = geminiService.splitLongMessage(aiResponse);

            // Send all message parts
            for (let i = 0; i < messageParts.length; i++) {
                const part = messageParts[i];
                
                if (i === 0) {
                    // Reply to the original message for the first part
                    await message.reply(part);
                } else {
                    // Send follow-up messages
                    await message.channel.send(part);
                }

                // Small delay between messages to ensure proper order
                if (i < messageParts.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            logger.info(`✅ AI response sent to ${message.author.tag} in ${messageParts.length} parts`);

        } catch (error) {
            logger.error(`❌ Error handling AI response: ${error.message}`);
            await message.reply("Nyaa~ parece que mi cerebro kawaii tuvo un error de compilación! Intenta de nuevo más tarde uwu 💻💔").catch(() => {});
        }
    }
};
