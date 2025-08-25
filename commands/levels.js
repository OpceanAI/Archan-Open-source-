const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { createRankCard } = require('../utils/canvas');
const logger = require('../utils/logger');

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('rank')
            .setDescription('📈 Ver nivel y XP kawaii de un usuario')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario a consultar (tú por defecto)')
                    .setRequired(false)),
        
        async execute(interaction) {
            const targetUser = interaction.options.getUser('usuario') || interaction.user;
            const userData = interaction.client.database.getUserLevel(interaction.guild.id, targetUser.id);
            const guildData = interaction.client.database.getGuild(interaction.guild.id);
            const { baseXP, difficulty } = guildData.levels;

            // Calculate XP for current and next level
            const currentLevelXP = interaction.client.database.getXPForLevel(userData.level, baseXP, difficulty);
            const nextLevelXP = interaction.client.database.getXPForLevel(userData.level + 1, baseXP, difficulty);
            const progressXP = userData.xp - currentLevelXP;
            const neededXP = nextLevelXP - currentLevelXP;
            const progress = Math.round((progressXP / neededXP) * 100);

            // Get user's rank position
            const leaderboard = interaction.client.database.getLeaderboard(interaction.guild.id, 100);
            const rank = leaderboard.findIndex(user => user.userId === targetUser.id) + 1;

            try {
                await interaction.deferReply();

                // Create rank card with Canvas
                const rankCard = await createRankCard({
                    user: targetUser,
                    level: userData.level,
                    currentXP: userData.xp,
                    nextLevelXP: nextLevelXP,
                    progress: progress,
                    rank: rank || 'N/A',
                    messages: userData.messages
                });

                const embed = new EmbedBuilder()
                    .setTitle('🔮💻 Nivel Kawaii de ' + targetUser.displayName)
                    .setDescription('✨ *Estadísticas compiladas con algoritmos kawaii* ✨')
                    .addFields(
                        { name: '🏆 Nivel', value: `**${userData.level}**`, inline: true },
                        { name: '⚡ XP Total', value: `**${userData.xp.toLocaleString()}**`, inline: true },
                        { name: '📊 Ranking', value: `**#${rank}**`, inline: true },
                        { name: '📈 Progreso', value: `${progressXP.toLocaleString()} / ${neededXP.toLocaleString()} XP (${progress}%)`, inline: false },
                        { name: '💬 Mensajes', value: `**${userData.messages.toLocaleString()}** mensajes nya~`, inline: true },
                        { name: '⏰ Última actividad', value: userData.lastMessage ? `<t:${Math.floor(userData.lastMessage / 1000)}:R>` : 'Nunca', inline: true }
                    )
                    .setColor('#9966FF')
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: '🔮 Sistema de niveles compilado con amor kawaii' })
                    .setTimestamp();

                await interaction.editReply({ 
                    embeds: [embed],
                    files: [{ attachment: rankCard, name: 'rank-card.png' }]
                });

                interaction.client.database.incrementCommandCount();
                logger.info(`📈 Rank command executed for ${targetUser.tag} nya~`);

            } catch (error) {
                logger.error('❌ Error creating rank card:', error);
                
                // Fallback embed without image
                const embed = new EmbedBuilder()
                    .setTitle('🔮💻 Nivel Kawaii de ' + targetUser.displayName)
                    .setDescription('✨ *Estadísticas compiladas con algoritmos kawaii* ✨')
                    .addFields(
                        { name: '🏆 Nivel', value: `**${userData.level}**`, inline: true },
                        { name: '⚡ XP Total', value: `**${userData.xp.toLocaleString()}**`, inline: true },
                        { name: '📊 Ranking', value: `**#${rank}**`, inline: true },
                        { name: '📈 Progreso', value: `${progressXP.toLocaleString()} / ${neededXP.toLocaleString()} XP (${progress}%)`, inline: false },
                        { name: '💬 Mensajes', value: `**${userData.messages.toLocaleString()}** mensajes nya~`, inline: true }
                    )
                    .setColor('#9966FF')
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: '🔮 Sistema de niveles compilado con amor kawaii' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('ranking')
            .setDescription('🏅 Ver leaderboard de programadores top kawaii del servidor')
            .addIntegerOption(option =>
                option.setName('limite')
                    .setDescription('Cantidad de usuarios a mostrar (1-20)')
                    .setMinValue(1)
                    .setMaxValue(20)),
        
        async execute(interaction) {
            const limit = interaction.options.getInteger('limite') || 10;
            const leaderboard = interaction.client.database.getLeaderboard(interaction.guild.id, limit);

            if (leaderboard.length === 0) {
                return interaction.reply({
                    content: '📊 ¡No hay datos de niveles en este servidor nya~! Empiecen a chatear para generar XP kawaii ✨',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('🏆 Ranking Kawaii de Programadores')
                .setDescription('✨ *Top usuarios compilados con algoritmos kawaii* ✨\n\n')
                .setColor('#FFD700')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: `🔮 Top ${leaderboard.length} usuarios | Sistema compilado con amor` })
                .setTimestamp();

            let description = '';
            const medals = ['🥇', '🥈', '🥉'];

            for (let i = 0; i < leaderboard.length; i++) {
                const user = leaderboard[i];
                const member = interaction.guild.members.cache.get(user.userId);
                const displayName = member ? member.displayName : 'Usuario Desconocido';
                const medal = medals[i] || '🏅';
                
                description += `${medal} **#${i + 1}** ${displayName}\n`;
                description += `    🏆 Nivel **${user.level}** | ⚡ **${user.xp.toLocaleString()}** XP | 💬 **${user.messages}** msgs\n\n`;
            }

            embed.setDescription(embed.data.description + description);

            // Add server statistics
            const guildData = interaction.client.database.getGuild(interaction.guild.id);
            const totalUsers = guildData.users.size;
            const totalMessages = Array.from(guildData.users.values()).reduce((sum, user) => sum + user.messages, 0);
            const avgLevel = Array.from(guildData.users.values()).reduce((sum, user) => sum + user.level, 0) / totalUsers;

            embed.addFields({
                name: '📊 Estadísticas del Servidor',
                value: `👥 **${totalUsers}** usuarios activos\n💬 **${totalMessages.toLocaleString()}** mensajes totales\n📈 Nivel promedio: **${avgLevel.toFixed(1)}**`,
                inline: false
            });

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🏅 Ranking command executed - showing top ${limit} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('set-level')
            .setDescription('⚙️ Modificar nivel de usuario con algoritmos kawaii (Admin)')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario a modificar')
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('nivel')
                    .setDescription('Nuevo nivel (1-1000)')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(1000))
            .addBooleanOption(option =>
                option.setName('afecta-roles')
                    .setDescription('¿Dar roles de recompensa correspondientes?')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de administrador para compilar niveles nya~!',
                    ephemeral: true
                });
            }

            const targetUser = interaction.options.getUser('usuario');
            const newLevel = interaction.options.getInteger('nivel');
            const affectRoles = interaction.options.getBoolean('afecta-roles') ?? true;

            const guildData = interaction.client.database.getGuild(interaction.guild.id);
            const { baseXP, difficulty } = guildData.levels;
            
            // Calculate XP for the new level
            const newXP = interaction.client.database.getXPForLevel(newLevel, baseXP, difficulty);
            
            // Get current user data
            const userData = interaction.client.database.getUserLevel(interaction.guild.id, targetUser.id);
            const oldLevel = userData.level;
            
            // Update user level and XP
            userData.level = newLevel;
            userData.xp = newXP;

            try {
                // Handle role rewards if enabled
                let roleChanges = '';
                if (affectRoles) {
                    const member = interaction.guild.members.cache.get(targetUser.id);
                    if (member) {
                        // Remove old level rewards
                        for (let level = 1; level <= oldLevel; level++) {
                            if (guildData.rewards.has(level)) {
                                const roleId = guildData.rewards.get(level);
                                const role = interaction.guild.roles.cache.get(roleId);
                                if (role && member.roles.cache.has(roleId)) {
                                    await member.roles.remove(role);
                                    roleChanges += `➖ Removido: ${role.name}\n`;
                                }
                            }
                        }

                        // Add new level rewards
                        for (let level = 1; level <= newLevel; level++) {
                            if (guildData.rewards.has(level)) {
                                const roleId = guildData.rewards.get(level);
                                const role = interaction.guild.roles.cache.get(roleId);
                                if (role && !member.roles.cache.has(roleId)) {
                                    await member.roles.add(role);
                                    roleChanges += `➕ Añadido: ${role.name}\n`;
                                }
                            }
                        }
                    }
                }

                const embed = new EmbedBuilder()
                    .setTitle('⚙️ Nivel Modificado con Algoritmos Kawaii')
                    .setDescription(interaction.client.getKawaiiResponse('success'))
                    .addFields(
                        { name: '👤 Usuario', value: targetUser.tag, inline: true },
                        { name: '📊 Nivel Anterior', value: `${oldLevel}`, inline: true },
                        { name: '🆕 Nivel Nuevo', value: `${newLevel}`, inline: true },
                        { name: '⚡ XP Asignado', value: `${newXP.toLocaleString()}`, inline: true },
                        { name: '👮 Administrador', value: interaction.user.tag, inline: true },
                        { name: '🎭 Roles Afectados', value: affectRoles ? 'Sí' : 'No', inline: true }
                    )
                    .setColor('#00CED1')
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: '🔮 Nivel compilado con algoritmos administrativos kawaii' })
                    .setTimestamp();

                if (roleChanges) {
                    embed.addFields({ name: '🎭 Cambios de Roles', value: roleChanges || 'Ninguno', inline: false });
                }

                await interaction.reply({ embeds: [embed] });

                interaction.client.database.incrementCommandCount();
                logger.info(`⚙️ Level set for ${targetUser.tag}: ${oldLevel} -> ${newLevel} by ${interaction.user.tag} nya~`);

            } catch (error) {
                logger.error('❌ Error setting user level:', error);
                await interaction.reply({
                    content: '❌ ¡Error al compilar nuevo nivel nya~! Verifica permisos de roles.',
                    ephemeral: true
                });
            }
        }
    }
];
