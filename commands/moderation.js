const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../utils/logger');
const { checkPermissions } = require('../utils/permissions');

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('kick')
            .setDescription('👢 Expulsar usuario con algoritmos de moderación kawaii')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario a expulsar nya~')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('razon')
                    .setDescription('Razón de la expulsión kawaii')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
        
        async execute(interaction) {
            if (!checkPermissions(interaction, 'KICK_MEMBERS')) return;

            const targetUser = interaction.options.getUser('usuario');
            const reason = interaction.options.getString('razon') || 'No especificada nya~';
            const member = interaction.guild.members.cache.get(targetUser.id);

            if (!member) {
                return interaction.reply({
                    content: '❌ ¡Usuario no encontrado en el servidor uwu!',
                    ephemeral: true
                });
            }

            if (!member.kickable) {
                return interaction.reply({
                    content: '❌ ¡No puedo expulsar a este usuario nya~! (Permisos insuficientes)',
                    ephemeral: true
                });
            }

            if (member.id === interaction.user.id) {
                return interaction.reply({
                    content: '❌ ¡No puedes expulsarte a ti mismo nya~!',
                    ephemeral: true
                });
            }

            try {
                // Send DM before kicking
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('👢 Expulsión del Servidor')
                        .setDescription(`Has sido expulsado de **${interaction.guild.name}** nya~`)
                        .addFields(
                            { name: '📝 Razón', value: reason },
                            { name: '👮 Moderador', value: interaction.user.tag },
                            { name: '📅 Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
                        )
                        .setColor('#FF6B6B')
                        .setFooter({ text: '🔮 Sistema de moderación kawaii' });

                    await targetUser.send({ embeds: [dmEmbed] });
                } catch (error) {
                    logger.warn('⚠️ No se pudo enviar DM al usuario expulsado');
                }

                await member.kick(`${reason} | Moderador: ${interaction.user.tag}`);

                const embed = new EmbedBuilder()
                    .setTitle('🛡️ Algoritmo de Expulsión Ejecutado')
                    .setDescription(interaction.client.getKawaiiResponse('success'))
                    .addFields(
                        { name: '👤 Usuario', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                        { name: '📝 Razón', value: reason, inline: true },
                        { name: '👮 Moderador', value: interaction.user.tag, inline: true }
                    )
                    .setColor('#00FF00')
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: '🔮 Servidor más seguro gracias a la magia kawaii' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });

                interaction.client.database.incrementCommandCount();
                logger.info(`👢 Usuario ${targetUser.tag} expulsado por ${interaction.user.tag} nya~`);

            } catch (error) {
                logger.error('❌ Error executing kick command:', error);
                await interaction.reply({
                    content: '❌ ¡Error al ejecutar algoritmo de expulsión nya~!',
                    ephemeral: true
                });
            }
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('ban')
            .setDescription('🔨 Banear usuario con sistema de seguridad kawaii')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario a banear nya~')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('razon')
                    .setDescription('Razón del baneo kawaii')
                    .setRequired(false))
            .addIntegerOption(option =>
                option.setName('dias')
                    .setDescription('Días de mensajes a eliminar (0-7)')
                    .setMinValue(0)
                    .setMaxValue(7))
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        
        async execute(interaction) {
            if (!checkPermissions(interaction, 'BAN_MEMBERS')) return;

            const targetUser = interaction.options.getUser('usuario');
            const reason = interaction.options.getString('razon') || 'No especificada nya~';
            const deleteMessageDays = interaction.options.getInteger('dias') || 0;
            const member = interaction.guild.members.cache.get(targetUser.id);

            if (member && !member.bannable) {
                return interaction.reply({
                    content: '❌ ¡No puedo banear a este usuario nya~! (Permisos insuficientes)',
                    ephemeral: true
                });
            }

            if (targetUser.id === interaction.user.id) {
                return interaction.reply({
                    content: '❌ ¡No puedes banearte a ti mismo nya~!',
                    ephemeral: true
                });
            }

            try {
                // Send DM before banning
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle('🔨 Baneo del Servidor')
                        .setDescription(`Has sido baneado de **${interaction.guild.name}** nya~`)
                        .addFields(
                            { name: '📝 Razón', value: reason },
                            { name: '👮 Moderador', value: interaction.user.tag },
                            { name: '📅 Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
                        )
                        .setColor('#FF0000')
                        .setFooter({ text: '🔮 Sistema de moderación kawaii | Apela si consideras injusto' });

                    await targetUser.send({ embeds: [dmEmbed] });
                } catch (error) {
                    logger.warn('⚠️ No se pudo enviar DM al usuario baneado');
                }

                await interaction.guild.members.ban(targetUser.id, {
                    reason: `${reason} | Moderador: ${interaction.user.tag}`,
                    deleteMessageDays: deleteMessageDays
                });

                const embed = new EmbedBuilder()
                    .setTitle('🛡️ Algoritmo de Baneo Ejecutado')
                    .setDescription(interaction.client.getKawaiiResponse('success'))
                    .addFields(
                        { name: '👤 Usuario', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                        { name: '📝 Razón', value: reason, inline: true },
                        { name: '👮 Moderador', value: interaction.user.tag, inline: true },
                        { name: '🗑️ Mensajes eliminados', value: `${deleteMessageDays} días`, inline: true }
                    )
                    .setColor('#FF0000')
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: '🔮 Algoritmo de seguridad kawaii activado' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });

                interaction.client.database.incrementCommandCount();
                logger.info(`🔨 Usuario ${targetUser.tag} baneado por ${interaction.user.tag} nya~`);

            } catch (error) {
                logger.error('❌ Error executing ban command:', error);
                await interaction.reply({
                    content: '❌ ¡Error al ejecutar algoritmo de baneo nya~!',
                    ephemeral: true
                });
            }
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('clear')
            .setDescription('🧹 Limpiar mensajes con algoritmos de optimización kawaii')
            .addIntegerOption(option =>
                option.setName('cantidad')
                    .setDescription('Cantidad de mensajes a eliminar (1-100)')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(100))
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Filtrar mensajes de usuario específico')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        
        async execute(interaction) {
            if (!checkPermissions(interaction, 'MANAGE_MESSAGES')) return;

            const amount = interaction.options.getInteger('cantidad');
            const targetUser = interaction.options.getUser('usuario');

            await interaction.deferReply({ ephemeral: true });

            try {
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                
                let messagesToDelete = messages.first(amount);
                
                if (targetUser) {
                    messagesToDelete = messages.filter(msg => msg.author.id === targetUser.id).first(amount);
                }

                // Filter messages older than 14 days (Discord limitation)
                const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
                messagesToDelete = messagesToDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);

                if (messagesToDelete.size === 0) {
                    return interaction.editReply({
                        content: '❌ ¡No hay mensajes válidos para eliminar nya~! (Los mensajes deben ser menores a 14 días)'
                    });
                }

                await interaction.channel.bulkDelete(messagesToDelete, true);

                const embed = new EmbedBuilder()
                    .setTitle('🧹 Algoritmo de Limpieza Ejecutado')
                    .setDescription(interaction.client.getKawaiiResponse('success'))
                    .addFields(
                        { name: '🗑️ Mensajes eliminados', value: `${messagesToDelete.size}`, inline: true },
                        { name: '📝 Solicitados', value: `${amount}`, inline: true },
                        { name: '👤 Filtro de usuario', value: targetUser ? targetUser.tag : 'Ninguno', inline: true },
                        { name: '👮 Moderador', value: interaction.user.tag, inline: true }
                    )
                    .setColor('#00FF7F')
                    .setFooter({ text: '🔮 Canal optimizado con algoritmos kawaii' })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });

                interaction.client.database.incrementCommandCount();
                logger.info(`🧹 ${messagesToDelete.size} mensajes eliminados por ${interaction.user.tag} nya~`);

            } catch (error) {
                logger.error('❌ Error executing clear command:', error);
                await interaction.editReply({
                    content: '❌ ¡Error al ejecutar algoritmo de limpieza nya~!'
                });
            }
        }
    }
];
