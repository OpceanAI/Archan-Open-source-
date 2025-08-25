const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../utils/logger');

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('add-badword')
            .setDescription('➕ Compilar palabra al filtro kawaii de malas palabras')
            .addStringOption(option =>
                option.setName('palabra')
                    .setDescription('Palabra a añadir al filtro nya~')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de gestión de mensajes para compilar filtros nya~!',
                    ephemeral: true
                });
            }

            const word = interaction.options.getString('palabra').toLowerCase().trim();
            
            if (word.length < 2) {
                return interaction.reply({
                    content: '❌ ¡La palabra debe tener al menos 2 caracteres nya~!',
                    ephemeral: true
                });
            }

            const added = interaction.client.database.addBadWord(interaction.guild.id, word);

            if (!added) {
                return interaction.reply({
                    content: `❌ ¡La palabra "${word}" ya está compilada en el filtro kawaii!`,
                    ephemeral: true
                });
            }

            const guildData = interaction.client.database.getGuild(interaction.guild.id);
            const totalWords = guildData.badWords.words.length;

            const embed = new EmbedBuilder()
                .setTitle('🚫 Palabra Compilada al Filtro Kawaii')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '📝 Palabra añadida', value: `\`${word}\``, inline: true },
                    { name: '📊 Total en filtro', value: `${totalWords} palabras`, inline: true },
                    { name: '👮 Moderador', value: interaction.user.tag, inline: true },
                    { name: '⚙️ Estado del filtro', value: guildData.badWords.enabled ? '✅ Activo' : '❌ Desactivado', inline: true }
                )
                .setColor('#FF6B6B')
                .setFooter({ text: '🔮 Filtro optimizado con algoritmos kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🚫 Bad word added: "${word}" by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('remove-badword')
            .setDescription('➖ Descompilar palabra del filtro kawaii')
            .addStringOption(option =>
                option.setName('palabra')
                    .setDescription('Palabra a remover del filtro nya~')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de gestión de mensajes para descompilar filtros nya~!',
                    ephemeral: true
                });
            }

            const word = interaction.options.getString('palabra').toLowerCase().trim();
            const removed = interaction.client.database.removeBadWord(interaction.guild.id, word);

            if (!removed) {
                return interaction.reply({
                    content: `❌ ¡La palabra "${word}" no está en el filtro kawaii!`,
                    ephemeral: true
                });
            }

            const guildData = interaction.client.database.getGuild(interaction.guild.id);
            const totalWords = guildData.badWords.words.length;

            const embed = new EmbedBuilder()
                .setTitle('✅ Palabra Descompilada del Filtro')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '📝 Palabra removida', value: `\`${word}\``, inline: true },
                    { name: '📊 Restantes en filtro', value: `${totalWords} palabras`, inline: true },
                    { name: '👮 Moderador', value: interaction.user.tag, inline: true }
                )
                .setColor('#00FF7F')
                .setFooter({ text: '🔮 Filtro actualizado con algoritmos kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`✅ Bad word removed: "${word}" by ${interaction.user.tag} uwu`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('status-badwords')
            .setDescription('📋 Ver estado del filtro kawaii de palabras prohibidas')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de gestión de mensajes para ver el estado del filtro nya~!',
                    ephemeral: true
                });
            }

            const guildData = interaction.client.database.getGuild(interaction.guild.id);
            const { words, whitelistRoles, enabled } = guildData.badWords;

            // Get whitelist role names
            const whitelistRoleNames = whitelistRoles
                .map(roleId => {
                    const role = interaction.guild.roles.cache.get(roleId);
                    return role ? role.name : 'Rol Eliminado';
                })
                .join('\n') || 'Ninguno';

            // Format word list (show first 10 words)
            const wordList = words.length > 0 
                ? words.slice(0, 10).map(word => `\`${word}\``).join(', ') + 
                  (words.length > 10 ? `\n... y ${words.length - 10} más` : '')
                : 'Ninguna';

            const embed = new EmbedBuilder()
                .setTitle('🚫 Estado del Filtro Kawaii')
                .setDescription('✨ *Configuración compilada del sistema de filtros* ✨')
                .addFields(
                    { name: '⚙️ Estado', value: enabled ? '✅ Activo' : '❌ Desactivado', inline: true },
                    { name: '📊 Total palabras', value: `${words.length}`, inline: true },
                    { name: '🛡️ Roles en whitelist', value: `${whitelistRoles.length}`, inline: true },
                    { name: '📝 Palabras filtradas', value: wordList, inline: false },
                    { name: '👥 Roles con permisos', value: whitelistRoleNames, inline: false },
                    { name: '🔧 Configuración', value: '• Los mensajes con palabras prohibidas son eliminados\n• Los usuarios en whitelist pueden usarlas\n• Se envía notificación privada al usuario', inline: false }
                )
                .setColor('#9966FF')
                .setFooter({ text: '🔮 Sistema de filtros compilado con algoritmos kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`📋 Bad words status checked by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('add-whitelist-role')
            .setDescription('🛡️ Permitir a un rol usar palabras prohibidas')
            .addRoleOption(option =>
                option.setName('rol')
                    .setDescription('Rol a añadir a la whitelist kawaii')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de gestión de roles para compilar whitelist nya~!',
                    ephemeral: true
                });
            }

            const role = interaction.options.getRole('rol');
            const added = interaction.client.database.addWhitelistRole(interaction.guild.id, role.id);

            if (!added) {
                return interaction.reply({
                    content: `❌ ¡El rol ${role.name} ya está en la whitelist kawaii!`,
                    ephemeral: true
                });
            }

            const guildData = interaction.client.database.getGuild(interaction.guild.id);
            const totalRoles = guildData.badWords.whitelistRoles.length;

            const embed = new EmbedBuilder()
                .setTitle('🛡️ Rol Añadido a Whitelist Kawaii')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '🎭 Rol añadido', value: role.toString(), inline: true },
                    { name: '📊 Total en whitelist', value: `${totalRoles} roles`, inline: true },
                    { name: '👮 Moderador', value: interaction.user.tag, inline: true },
                    { name: '✨ Efecto', value: 'Los miembros con este rol pueden usar palabras del filtro', inline: false }
                )
                .setColor('#00FF7F')
                .setFooter({ text: '🔮 Whitelist compilada con algoritmos kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🛡️ Role ${role.name} added to whitelist by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('remove-whitelist-role')
            .setDescription('🚫 Quitar permisos kawaii de filtro a un rol')
            .addRoleOption(option =>
                option.setName('rol')
                    .setDescription('Rol a remover de la whitelist')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de gestión de roles para descompilar whitelist nya~!',
                    ephemeral: true
                });
            }

            const role = interaction.options.getRole('rol');
            const removed = interaction.client.database.removeWhitelistRole(interaction.guild.id, role.id);

            if (!removed) {
                return interaction.reply({
                    content: `❌ ¡El rol ${role.name} no está en la whitelist kawaii!`,
                    ephemeral: true
                });
            }

            const guildData = interaction.client.database.getGuild(interaction.guild.id);
            const totalRoles = guildData.badWords.whitelistRoles.length;

            const embed = new EmbedBuilder()
                .setTitle('🚫 Rol Removido de Whitelist')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '🎭 Rol removido', value: role.toString(), inline: true },
                    { name: '📊 Restantes en whitelist', value: `${totalRoles} roles`, inline: true },
                    { name: '👮 Moderador', value: interaction.user.tag, inline: true },
                    { name: '⚠️ Efecto', value: 'Los miembros con este rol ya no pueden usar palabras del filtro', inline: false }
                )
                .setColor('#FF6B6B')
                .setFooter({ text: '🔮 Whitelist actualizada con algoritmos kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🚫 Role ${role.name} removed from whitelist by ${interaction.user.tag} uwu`);
        }
    }
];
