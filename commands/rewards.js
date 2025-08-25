const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../utils/logger');

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('add-reward')
            .setDescription('🎁 Compilar recompensa kawaii para un nivel específico')
            .addIntegerOption(option =>
                option.setName('nivel')
                    .setDescription('Nivel que otorgará la recompensa')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(1000))
            .addRoleOption(option =>
                option.setName('rol')
                    .setDescription('Rol a otorgar como recompensa kawaii')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de gestión de roles para compilar recompensas nya~!',
                    ephemeral: true
                });
            }

            const level = interaction.options.getInteger('nivel');
            const role = interaction.options.getRole('rol');

            // Check if bot can manage the role
            if (role.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.reply({
                    content: `❌ ¡No puedo gestionar el rol ${role.name} porque está por encima de mi rol más alto nya~!`,
                    ephemeral: true
                });
            }

            // Check if role is higher than user's highest role (unless user is admin)
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                if (role.position >= interaction.member.roles.highest.position) {
                    return interaction.reply({
                        content: `❌ ¡No puedes asignar un rol que está por encima de tu rol más alto nya~!`,
                        ephemeral: true
                    });
                }
            }

            const guildData = interaction.client.database.getGuild(interaction.guild.id);
            const existingReward = guildData.rewards.get(level);

            // Add the reward
            interaction.client.database.addReward(interaction.guild.id, level, role.id);

            const embed = new EmbedBuilder()
                .setTitle('🎁 Recompensa Compilada con Éxito')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '🏆 Nivel', value: `${level}`, inline: true },
                    { name: '🎭 Rol Recompensa', value: role.toString(), inline: true },
                    { name: '👮 Configurado por', value: interaction.user.tag, inline: true },
                    { name: '⚙️ Estado', value: existingReward ? `Reemplazó recompensa anterior` : 'Nueva recompensa', inline: false },
                    { name: '✨ Efecto', value: `Los usuarios que alcancen el nivel ${level} recibirán automáticamente este rol kawaii`, inline: false }
                )
                .setColor('#FFD700')
                .setFooter({ text: '🔮 Sistema de recompensas compilado con algoritmos kawaii' })
                .setTimestamp();

            if (existingReward) {
                const oldRole = interaction.guild.roles.cache.get(existingReward);
                if (oldRole) {
                    embed.addFields({
                        name: '🔄 Recompensa Anterior',
                        value: `${oldRole.name} (reemplazada)`,
                        inline: true
                    });
                }
            }

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🎁 Reward added for level ${level}: ${role.name} by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('remove-reward')
            .setDescription('🗑️ Descompilar recompensa kawaii de un nivel')
            .addIntegerOption(option =>
                option.setName('nivel')
                    .setDescription('Nivel del cual remover la recompensa')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(1000))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de gestión de roles para descompilar recompensas nya~!',
                    ephemeral: true
                });
            }

            const level = interaction.options.getInteger('nivel');
            const guildData = interaction.client.database.getGuild(interaction.guild.id);
            const existingReward = guildData.rewards.get(level);

            if (!existingReward) {
                return interaction.reply({
                    content: `❌ ¡No hay recompensa configurada para el nivel ${level} nya~!`,
                    ephemeral: true
                });
            }

            const role = interaction.guild.roles.cache.get(existingReward);
            const roleName = role ? role.name : 'Rol Eliminado';

            const removed = interaction.client.database.removeReward(interaction.guild.id, level);

            if (!removed) {
                return interaction.reply({
                    content: `❌ ¡Error al descompilar recompensa del nivel ${level} nya~!`,
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('🗑️ Recompensa Descompilada')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '🏆 Nivel', value: `${level}`, inline: true },
                    { name: '🎭 Rol Removido', value: roleName, inline: true },
                    { name: '👮 Removido por', value: interaction.user.tag, inline: true },
                    { name: '⚠️ Efecto', value: `Los usuarios que alcancen el nivel ${level} ya no recibirán recompensas automáticas`, inline: false },
                    { name: '📝 Nota', value: 'Los usuarios que ya tenían este rol lo conservan', inline: false }
                )
                .setColor('#FF6B6B')
                .setFooter({ text: '🔮 Sistema de recompensas actualizado con algoritmos kawaii' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🗑️ Reward removed for level ${level}: ${roleName} by ${interaction.user.tag} uwu`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('rewards-status')
            .setDescription('📊 Ver estado de todas las recompensas kawaii del servidor'),
        
        async execute(interaction) {
            const guildData = interaction.client.database.getGuild(interaction.guild.id);
            const rewards = guildData.rewards;

            if (rewards.size === 0) {
                return interaction.reply({
                    content: '📊 ¡No hay recompensas configuradas en este servidor nya~! Usa `/add-reward` para compilar algunas ✨',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('🎁 Sistema de Recompensas Kawaii')
                .setDescription('✨ *Recompensas compiladas con algoritmos kawaii* ✨\n\n')
                .setColor('#FFD700')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: `🔮 ${rewards.size} recompensas configuradas | Sistema optimizado` })
                .setTimestamp();

            // Sort rewards by level
            const sortedRewards = Array.from(rewards.entries()).sort((a, b) => a[0] - b[0]);
            
            let rewardsList = '';
            let invalidRoles = 0;

            for (const [level, roleId] of sortedRewards) {
                const role = interaction.guild.roles.cache.get(roleId);
                if (role) {
                    rewardsList += `🏆 **Nivel ${level}** → ${role.toString()}\n`;
                } else {
                    rewardsList += `🏆 **Nivel ${level}** → ⚠️ *Rol eliminado*\n`;
                    invalidRoles++;
                }
            }

            embed.addFields({
                name: '🎭 Recompensas Configuradas',
                value: rewardsList || 'Ninguna',
                inline: false
            });

            // Add statistics
            const totalLevels = Math.max(...sortedRewards.map(([level]) => level));
            const coverage = Math.round((rewards.size / totalLevels) * 100);

            embed.addFields(
                { name: '📊 Estadísticas', value: `📈 Nivel más alto: **${totalLevels}**\n🎯 Cobertura: **${coverage}%**\n🎭 Roles válidos: **${rewards.size - invalidRoles}**`, inline: true },
                { name: '⚙️ Configuración', value: '• Roles otorgados automáticamente\n• Al alcanzar el nivel correspondiente\n• Acumulativo (se conservan roles anteriores)', inline: true }
            );

            if (invalidRoles > 0) {
                embed.addFields({
                    name: '⚠️ Advertencias',
                    value: `${invalidRoles} recompensa(s) tienen roles eliminados. Considera usar \`/remove-reward\` para limpiarlas.`,
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`📊 Rewards status checked by ${interaction.user.tag} - ${rewards.size} rewards nya~`);
        }
    }
];
