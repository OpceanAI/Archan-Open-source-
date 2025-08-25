const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const logger = require('../utils/logger');

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('set-base-xp')
            .setDescription('⚙️ Configurar XP base kawaii para el sistema de niveles')
            .addIntegerOption(option =>
                option.setName('cantidad')
                    .setDescription('XP base para nivel 1 (100-10000)')
                    .setRequired(true)
                    .setMinValue(100)
                    .setMaxValue(10000))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de administrador para compilar configuraciones nya~!',
                    ephemeral: true
                });
            }

            const baseXP = interaction.options.getInteger('cantidad');
            const updated = interaction.client.database.updateLevelConfig(interaction.guild.id, 'baseXP', baseXP);

            if (!updated) {
                return interaction.reply({
                    content: '❌ ¡Error al compilar configuración nya~!',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('⚙️ XP Base Configurado')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '⚡ XP Base Nuevo', value: `${baseXP.toLocaleString()}`, inline: true },
                    { name: '📊 Efecto', value: 'Afecta cálculo de todos los niveles', inline: true },
                    { name: '👮 Configurado por', value: interaction.user.tag, inline: true },
                    { name: '🧮 Algoritmo', value: `Nivel = (XP / ${baseXP}) ^ (1 / dificultad)`, inline: false },
                    { name: '⚠️ Nota', value: 'Los usuarios existentes mantendrán su progreso actual', inline: false }
                )
                .setColor('#00CED1')
                .setFooter({ text: '🔮 Configuración compilada con algoritmos kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`⚙️ Base XP set to ${baseXP} by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('set-difficulty')
            .setDescription('🎯 Configurar dificultad kawaii del sistema de niveles')
            .addNumberOption(option =>
                option.setName('multiplicador')
                    .setDescription('Multiplicador de dificultad (1.0-3.0)')
                    .setRequired(true)
                    .setMinValue(1.0)
                    .setMaxValue(3.0))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de administrador para compilar dificultad nya~!',
                    ephemeral: true
                });
            }

            const difficulty = interaction.options.getNumber('multiplicador');
            const updated = interaction.client.database.updateLevelConfig(interaction.guild.id, 'difficulty', difficulty);

            if (!updated) {
                return interaction.reply({
                    content: '❌ ¡Error al compilar dificultad nya~!',
                    ephemeral: true
                });
            }

            let difficultyText = '';
            if (difficulty <= 1.2) difficultyText = '🟢 Fácil';
            else if (difficulty <= 1.8) difficultyText = '🟡 Normal';
            else if (difficulty <= 2.5) difficultyText = '🟠 Difícil';
            else difficultyText = '🔴 Muy Difícil';

            const embed = new EmbedBuilder()
                .setTitle('🎯 Dificultad Configurada')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '📊 Multiplicador', value: `${difficulty}x`, inline: true },
                    { name: '🎯 Dificultad', value: difficultyText, inline: true },
                    { name: '👮 Configurado por', value: interaction.user.tag, inline: true },
                    { name: '🧮 Algoritmo', value: `XP necesario = baseXP * (nivel - 1) ^ ${difficulty}`, inline: false },
                    { name: '📈 Efecto', value: `${difficulty > 1.5 ? 'Más difícil subir de nivel' : 'Progresión más rápida'} kawaii`, inline: false }
                )
                .setColor('#FF69B4')
                .setFooter({ text: '🔮 Balance compilado con algoritmos kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🎯 Difficulty set to ${difficulty} by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('set-message-xp')
            .setDescription('💬 Configurar XP kawaii por mensaje')
            .addIntegerOption(option =>
                option.setName('cantidad')
                    .setDescription('XP por mensaje (5-100)')
                    .setRequired(true)
                    .setMinValue(5)
                    .setMaxValue(100))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de administrador para compilar XP por mensaje nya~!',
                    ephemeral: true
                });
            }

            const messageXP = interaction.options.getInteger('cantidad');
            const updated = interaction.client.database.updateLevelConfig(interaction.guild.id, 'messageXP', messageXP);

            if (!updated) {
                return interaction.reply({
                    content: '❌ ¡Error al compilar XP por mensaje nya~!',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('💬 XP por Mensaje Configurado')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '⚡ XP por Mensaje', value: `${messageXP} XP`, inline: true },
                    { name: '🎲 Variación', value: `5-${messageXP} XP aleatorio`, inline: true },
                    { name: '👮 Configurado por', value: interaction.user.tag, inline: true },
                    { name: '🧮 Algoritmo', value: `XP ganado = Random(5, ${messageXP})`, inline: false },
                    { name: '📊 Estimación', value: `~${Math.round(messageXP / 2)} XP promedio por mensaje kawaii`, inline: false }
                )
                .setColor('#32CD32')
                .setFooter({ text: '🔮 Sistema de recompensas compilado con amor kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`💬 Message XP set to ${messageXP} by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('set-level-channel')
            .setDescription('📢 Configurar canal kawaii para anuncios de level up')
            .addChannelOption(option =>
                option.setName('canal')
                    .setDescription('Canal para anuncios (vacío para desactivar)')
                    .addChannelTypes(ChannelType.GuildText)
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de administrador para compilar canal nya~!',
                    ephemeral: true
                });
            }

            const channel = interaction.options.getChannel('canal');
            const channelId = channel ? channel.id : null;
            
            const updated = interaction.client.database.updateLevelConfig(interaction.guild.id, 'levelUpChannel', channelId);

            if (!updated) {
                return interaction.reply({
                    content: '❌ ¡Error al compilar canal nya~!',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('📢 Canal de Level Up Configurado')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '📺 Canal', value: channel ? channel.toString() : 'Desactivado', inline: true },
                    { name: '⚙️ Estado', value: channel ? '✅ Activo' : '❌ Sin anuncios', inline: true },
                    { name: '👮 Configurado por', value: interaction.user.tag, inline: true },
                    { name: '✨ Efecto', value: channel ? 'Los level ups se anunciarán en este canal kawaii' : 'No se enviarán anuncios de level up', inline: false }
                )
                .setColor(channel ? '#00FF7F' : '#FF6B6B')
                .setFooter({ text: '🔮 Canal compilado con algoritmos kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`📢 Level channel set to ${channel ? channel.name : 'disabled'} by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('set-level-up-message')
            .setDescription('💬 Personalizar mensaje kawaii de level up')
            .addStringOption(option =>
                option.setName('mensaje')
                    .setDescription('Mensaje personalizado. Variables: {user}, {level}, {oldLevel}')
                    .setRequired(true)
                    .setMaxLength(500))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de administrador para compilar mensajes nya~!',
                    ephemeral: true
                });
            }

            const message = interaction.options.getString('mensaje');
            const updated = interaction.client.database.updateLevelConfig(interaction.guild.id, 'levelUpMessage', message);

            if (!updated) {
                return interaction.reply({
                    content: '❌ ¡Error al compilar mensaje nya~!',
                    ephemeral: true
                });
            }

            // Show preview with example variables
            const preview = message
                .replace('{user}', interaction.user.toString())
                .replace('{level}', '10')
                .replace('{oldLevel}', '9');

            const embed = new EmbedBuilder()
                .setTitle('💬 Mensaje de Level Up Configurado')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '📝 Mensaje configurado', value: `\`\`\`${message}\`\`\``, inline: false },
                    { name: '👀 Vista previa', value: preview, inline: false },
                    { name: '🔧 Variables disponibles', value: '• `{user}` - Mención del usuario\n• `{level}` - Nuevo nivel\n• `{oldLevel}` - Nivel anterior', inline: false },
                    { name: '👮 Configurado por', value: interaction.user.tag, inline: true }
                )
                .setColor('#FF1493')
                .setFooter({ text: '🔮 Mensaje compilado con algoritmos kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`💬 Level up message configured by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('set-level-up-title')
            .setDescription('🏷️ Personalizar título kawaii de embeds de level up')
            .addStringOption(option =>
                option.setName('titulo')
                    .setDescription('Título personalizado para embeds de level up')
                    .setRequired(true)
                    .setMaxLength(100))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de administrador para compilar títulos nya~!',
                    ephemeral: true
                });
            }

            const title = interaction.options.getString('titulo');
            const updated = interaction.client.database.updateLevelConfig(interaction.guild.id, 'levelUpTitle', title);

            if (!updated) {
                return interaction.reply({
                    content: '❌ ¡Error al compilar título nya~!',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('🏷️ Título de Level Up Configurado')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '📝 Título configurado', value: `\`${title}\``, inline: false },
                    { name: '👮 Configurado por', value: interaction.user.tag, inline: true },
                    { name: '✨ Uso', value: 'Este título aparecerá en todos los embeds de level up kawaii', inline: false }
                )
                .setColor('#9966FF')
                .setFooter({ text: '🔮 Título compilado con algoritmos kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🏷️ Level up title configured by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('set-reward-message')
            .setDescription('🎁 Personalizar mensaje kawaii de recompensas')
            .addStringOption(option =>
                option.setName('mensaje')
                    .setDescription('Mensaje de recompensas. Variables: {user}, {role}, {level}')
                    .setRequired(true)
                    .setMaxLength(500))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de administrador para compilar mensajes de recompensa nya~!',
                    ephemeral: true
                });
            }

            const message = interaction.options.getString('mensaje');
            const updated = interaction.client.database.updateLevelConfig(interaction.guild.id, 'rewardMessage', message);

            if (!updated) {
                return interaction.reply({
                    content: '❌ ¡Error al compilar mensaje de recompensa nya~!',
                    ephemeral: true
                });
            }

            // Show preview
            const preview = message
                .replace('{user}', interaction.user.toString())
                .replace('{role}', '@Ejemplo Rol')
                .replace('{level}', '15');

            const embed = new EmbedBuilder()
                .setTitle('🎁 Mensaje de Recompensa Configurado')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '📝 Mensaje configurado', value: `\`\`\`${message}\`\`\``, inline: false },
                    { name: '👀 Vista previa', value: preview, inline: false },
                    { name: '🔧 Variables disponibles', value: '• `{user}` - Mención del usuario\n• `{role}` - Rol otorgado\n• `{level}` - Nivel alcanzado', inline: false },
                    { name: '👮 Configurado por', value: interaction.user.tag, inline: true }
                )
                .setColor('#FFD700')
                .setFooter({ text: '🔮 Recompensas compiladas con algoritmos kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🎁 Reward message configured by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('set-reward-title')
            .setDescription('🏆 Personalizar título kawaii de embeds de recompensas')
            .addStringOption(option =>
                option.setName('titulo')
                    .setDescription('Título para embeds de recompensas')
                    .setRequired(true)
                    .setMaxLength(100))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de administrador para compilar títulos de recompensa nya~!',
                    ephemeral: true
                });
            }

            const title = interaction.options.getString('titulo');
            const updated = interaction.client.database.updateLevelConfig(interaction.guild.id, 'rewardTitle', title);

            if (!updated) {
                return interaction.reply({
                    content: '❌ ¡Error al compilar título de recompensa nya~!',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('🏆 Título de Recompensa Configurado')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '📝 Título configurado', value: `\`${title}\``, inline: false },
                    { name: '👮 Configurado por', value: interaction.user.tag, inline: true },
                    { name: '✨ Uso', value: 'Este título aparecerá en todos los embeds de recompensas kawaii', inline: false }
                )
                .setColor('#FF6347')
                .setFooter({ text: '🔮 Recompensas compiladas con algoritmos kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🏆 Reward title configured by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('levels-config')
            .setDescription('⚙️ Ver toda la configuración kawaii del sistema de niveles'),
        
        async execute(interaction) {
            const guildData = interaction.client.database.getGuild(interaction.guild.id);
            const config = guildData.levels;
            
            const levelChannel = config.levelUpChannel ? 
                interaction.guild.channels.cache.get(config.levelUpChannel)?.toString() || '❌ Canal eliminado' : 
                '❌ Desactivado';

            const embed = new EmbedBuilder()
                .setTitle('⚙️ Configuración del Sistema de Niveles')
                .setDescription('✨ *Configuración compilada con algoritmos kawaii* ✨')
                .addFields(
                    { name: '📊 Configuración Base', value: `⚡ **XP Base:** ${config.baseXP.toLocaleString()}\n🎯 **Dificultad:** ${config.difficulty}x\n💬 **XP por mensaje:** ${config.messageXP}`, inline: true },
                    { name: '📢 Canal de Anuncios', value: levelChannel, inline: true },
                    { name: '🎭 Recompensas', value: `${guildData.rewards.size} niveles configurados`, inline: true },
                    { name: '💬 Mensaje de Level Up', value: `\`\`\`${config.levelUpMessage}\`\`\``, inline: false },
                    { name: '🏷️ Título de Level Up', value: `\`${config.levelUpTitle}\``, inline: true },
                    { name: '🎁 Mensaje de Recompensa', value: `\`\`\`${config.rewardMessage}\`\`\``, inline: false },
                    { name: '🏆 Título de Recompensa', value: `\`${config.rewardTitle}\``, inline: true }
                )
                .setColor('#9966FF')
                .setFooter({ text: '🔮 Sistema compilado con algoritmos kawaii | Usa los comandos set- para modificar' })
                .setTimestamp();

            // Add statistics
            const totalUsers = guildData.users.size;
            const totalXP = Array.from(guildData.users.values()).reduce((sum, user) => sum + user.xp, 0);
            const totalMessages = Array.from(guildData.users.values()).reduce((sum, user) => sum + user.messages, 0);

            if (totalUsers > 0) {
                embed.addFields({
                    name: '📈 Estadísticas del Servidor',
                    value: `👥 **${totalUsers}** usuarios activos\n⚡ **${totalXP.toLocaleString()}** XP total\n💬 **${totalMessages.toLocaleString()}** mensajes procesados`,
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`⚙️ Levels config viewed by ${interaction.user.tag} nya~`);
        }
    }
];
