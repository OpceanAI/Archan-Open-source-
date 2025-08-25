const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../utils/logger');

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('embed')
            .setDescription('🖼️ Crear embed kawaii con algoritmos de diseño')
            .addStringOption(option =>
                option.setName('titulo')
                    .setDescription('Título del embed kawaii')
                    .setRequired(true)
                    .setMaxLength(256))
            .addStringOption(option =>
                option.setName('descripcion')
                    .setDescription('Descripción del embed')
                    .setRequired(true)
                    .setMaxLength(2048))
            .addStringOption(option =>
                option.setName('color')
                    .setDescription('Color en hexadecimal (#FF69B4) o nombre')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de gestión de mensajes para compilar embeds nya~!',
                    ephemeral: true
                });
            }

            const title = interaction.options.getString('titulo');
            const description = interaction.options.getString('descripcion');
            const colorInput = interaction.options.getString('color') || '#FF69B4';

            // Color validation and parsing
            let color = '#FF69B4'; // Default kawaii pink
            
            if (colorInput.startsWith('#')) {
                if (/^#[0-9A-F]{6}$/i.test(colorInput)) {
                    color = colorInput;
                }
            } else {
                // Named colors
                const namedColors = {
                    'rosa': '#FF69B4', 'pink': '#FF69B4',
                    'azul': '#0099FF', 'blue': '#0099FF',
                    'verde': '#00FF7F', 'green': '#00FF7F',
                    'rojo': '#FF6B6B', 'red': '#FF6B6B',
                    'morado': '#9966FF', 'purple': '#9966FF',
                    'amarillo': '#FFD700', 'yellow': '#FFD700',
                    'naranja': '#FF6347', 'orange': '#FF6347',
                    'cian': '#00CED1', 'cyan': '#00CED1'
                };
                color = namedColors[colorInput.toLowerCase()] || color;
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setFooter({ text: `🔮 Embed compilado por ${interaction.user.tag} con algoritmos kawaii` })
                .setTimestamp();

            // Confirmation embed for the user
            const confirmEmbed = new EmbedBuilder()
                .setTitle('🖼️ Embed Compilado con Éxito')
                .setDescription(interaction.client.getKawaiiResponse('success'))
                .addFields(
                    { name: '📝 Título', value: title, inline: true },
                    { name: '🎨 Color', value: color, inline: true },
                    { name: '👮 Creado por', value: interaction.user.tag, inline: true }
                )
                .setColor('#00FF7F')
                .setFooter({ text: '🔮 Algoritmos de diseño kawaii ejecutados' })
                .setTimestamp();

            await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
            await interaction.followUp({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🖼️ Embed created by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('avatar')
            .setDescription('👤 Ver avatar kawaii en alta resolución con marco')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario del cual ver el avatar (tú por defecto)')
                    .setRequired(false)),
        
        async execute(interaction) {
            const targetUser = interaction.options.getUser('usuario') || interaction.user;
            const member = interaction.guild.members.cache.get(targetUser.id);

            const avatarURL = targetUser.displayAvatarURL({ 
                dynamic: true, 
                size: 1024,
                format: 'png'
            });

            const guildAvatarURL = member?.avatarURL({ 
                dynamic: true, 
                size: 1024,
                format: 'png'
            });

            const embed = new EmbedBuilder()
                .setTitle(`👤 Avatar Kawaii de ${targetUser.displayName}`)
                .setDescription('✨ *Avatar compilado con algoritmos de belleza kawaii* ✨')
                .setImage(avatarURL)
                .addFields(
                    { name: '👤 Usuario', value: targetUser.tag, inline: true },
                    { name: '🆔 ID', value: targetUser.id, inline: true },
                    { name: '📅 Cuenta creada', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true }
                )
                .setColor('#FF1493')
                .setFooter({ text: '🔮 Avatar compilado con resolución máxima kawaii' })
                .setTimestamp();

            const components = [];
            const linkButtons = [
                `[🖼️ Avatar Global](${avatarURL.replace('?size=1024', '?size=4096')})`
            ];

            if (guildAvatarURL && guildAvatarURL !== avatarURL) {
                linkButtons.push(`[🏠 Avatar del Servidor](${guildAvatarURL.replace('?size=1024', '?size=4096')})`);
                embed.addFields({
                    name: '🏠 Avatar del Servidor',
                    value: 'Este usuario tiene un avatar diferente en este servidor nya~',
                    inline: false
                });
            }

            embed.addFields({
                name: '🔗 Enlaces de Descarga',
                value: linkButtons.join(' • '),
                inline: false
            });

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`👤 Avatar command executed for ${targetUser.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('userinfo')
            .setDescription('🔍 Analizar perfil kawaii con algoritmos avanzados')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario a analizar (tú por defecto)')
                    .setRequired(false)),
        
        async execute(interaction) {
            const targetUser = interaction.options.getUser('usuario') || interaction.user;
            const member = interaction.guild.members.cache.get(targetUser.id);

            if (!member) {
                return interaction.reply({
                    content: '❌ ¡Usuario no encontrado en este servidor nya~!',
                    ephemeral: true
                });
            }

            // Get user level data
            const userData = interaction.client.database.getUserLevel(interaction.guild.id, targetUser.id);

            // Calculate account age
            const accountAge = Date.now() - targetUser.createdTimestamp;
            const joinAge = Date.now() - member.joinedTimestamp;

            // Get user's roles (excluding @everyone)
            const roles = member.roles.cache
                .filter(role => role.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString())
                .slice(0, 10); // Limit to 10 roles

            const embed = new EmbedBuilder()
                .setTitle(`🔍 Análisis Kawaii de ${member.displayName}`)
                .setDescription('✨ *Perfil compilado con algoritmos de análisis avanzados* ✨')
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Información Básica', value: `**Tag:** ${targetUser.tag}\n**ID:** ${targetUser.id}\n**Mención:** ${targetUser.toString()}`, inline: true },
                    { name: '📅 Fechas Importantes', value: `**Cuenta creada:** <t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>\n**Se unió:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>\n**Edad cuenta:** ${Math.floor(accountAge / (24 * 60 * 60 * 1000))} días`, inline: true },
                    { name: '🏆 Progreso Kawaii', value: `**Nivel:** ${userData.level}\n**XP:** ${userData.xp.toLocaleString()}\n**Mensajes:** ${userData.messages}`, inline: true }
                )
                .setColor('#9966FF')
                .setFooter({ text: '🔮 Análisis compilado con algoritmos kawaii avanzados' })
                .setTimestamp();

            // Add roles if any
            if (roles.length > 0) {
                embed.addFields({
                    name: `🎭 Roles (${member.roles.cache.size - 1})`,
                    value: roles.join(' ') + (member.roles.cache.size > 11 ? '\n*...y más*' : ''),
                    inline: false
                });
            }

            // Add permissions analysis
            const keyPermissions = [];
            if (member.permissions.has(PermissionFlagsBits.Administrator)) keyPermissions.push('👑 Administrador');
            if (member.permissions.has(PermissionFlagsBits.ManageGuild)) keyPermissions.push('⚙️ Gestionar Servidor');
            if (member.permissions.has(PermissionFlagsBits.ModerateMembers)) keyPermissions.push('🛡️ Moderar Miembros');
            if (member.permissions.has(PermissionFlagsBits.ManageMessages)) keyPermissions.push('📝 Gestionar Mensajes');
            if (member.permissions.has(PermissionFlagsBits.ManageRoles)) keyPermissions.push('🎭 Gestionar Roles');

            if (keyPermissions.length > 0) {
                embed.addFields({
                    name: '🔐 Permisos Clave',
                    value: keyPermissions.join('\n'),
                    inline: true
                });
            }

            // Add status and activity
            const presence = member.presence;
            let statusInfo = '❓ Desconocido';
            
            if (presence) {
                const statusEmojis = {
                    'online': '🟢 En línea',
                    'idle': '🟡 Ausente',
                    'dnd': '🔴 No molestar',
                    'offline': '⚫ Desconectado'
                };
                statusInfo = statusEmojis[presence.status] || '❓ Desconocido';

                if (presence.activities.length > 0) {
                    const activity = presence.activities[0];
                    statusInfo += `\n🎮 ${activity.name}`;
                }
            }

            embed.addFields({
                name: '📊 Estado',
                value: statusInfo,
                inline: true
            });

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🔍 User info analyzed for ${targetUser.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('serverinfo')
            .setDescription('🏠 Información del servidor con análisis kawaii completo'),
        
        async execute(interaction) {
            const guild = interaction.guild;
            
            // Calculate member statistics
            const totalMembers = guild.memberCount;
            const botCount = guild.members.cache.filter(member => member.user.bot).size;
            const humanCount = totalMembers - botCount;

            // Channel statistics
            const channels = guild.channels.cache;
            const textChannels = channels.filter(channel => channel.type === 0).size;
            const voiceChannels = channels.filter(channel => channel.type === 2).size;
            const categories = channels.filter(channel => channel.type === 4).size;

            // Server features
            const features = guild.features.map(feature => {
                const featureMap = {
                    'ANIMATED_BANNER': '🎬 Banner Animado',
                    'ANIMATED_ICON': '🎭 Icono Animado',
                    'BANNER': '🖼️ Banner',
                    'COMMUNITY': '🌟 Comunidad',
                    'DISCOVERABLE': '🔍 Descubrible',
                    'INVITE_SPLASH': '🎨 Splash de Invitación',
                    'MEMBER_VERIFICATION_GATE_ENABLED': '✅ Verificación',
                    'MONETIZATION_ENABLED': '💰 Monetización',
                    'NEWS': '📰 Noticias',
                    'PARTNERED': '🤝 Partner',
                    'PREVIEW_ENABLED': '👁️ Vista Previa',
                    'ROLE_ICONS': '🎭 Iconos de Rol',
                    'TICKETED_EVENTS_ENABLED': '🎫 Eventos',
                    'VANITY_URL': '🔗 URL Personalizada',
                    'VERIFIED': '✅ Verificado',
                    'VIP_REGIONS': '⭐ Regiones VIP'
                };
                return featureMap[feature] || feature;
            }).slice(0, 10);

            const embed = new EmbedBuilder()
                .setTitle(`🏠 Análisis Kawaii de ${guild.name}`)
                .setDescription('✨ *Servidor compilado con algoritmos de análisis avanzados* ✨')
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: '📊 Información Básica', value: `**Nombre:** ${guild.name}\n**ID:** ${guild.id}\n**Propietario:** <@${guild.ownerId}>\n**Región:** ${guild.preferredLocale}`, inline: true },
                    { name: '👥 Miembros', value: `**Total:** ${totalMembers.toLocaleString()}\n**Humanos:** ${humanCount.toLocaleString()}\n**Bots:** ${botCount.toLocaleString()}`, inline: true },
                    { name: '📺 Canales', value: `**Total:** ${channels.size}\n**Texto:** ${textChannels}\n**Voz:** ${voiceChannels}\n**Categorías:** ${categories}`, inline: true },
                    { name: '📅 Fechas', value: `**Creado:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>\n**Hace:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: '🛡️ Configuración', value: `**Verificación:** ${guild.verificationLevel}\n**Filtro contenido:** ${guild.explicitContentFilter}\n**MFA:** ${guild.mfaLevel === 1 ? 'Requerido' : 'No requerido'}`, inline: true },
                    { name: '🎭 Roles', value: `**Total:** ${guild.roles.cache.size}\n**Más alto:** ${guild.roles.highest.name}\n**Color más alto:** ${guild.roles.highest.hexColor}`, inline: true }
                )
                .setColor('#00CED1')
                .setFooter({ text: '🔮 Análisis de servidor compilado con algoritmos kawaii' })
                .setTimestamp();

            // Add server features if any
            if (features.length > 0) {
                embed.addFields({
                    name: '✨ Características Kawaii',
                    value: features.join('\n') + (guild.features.length > 10 ? '\n*...y más*' : ''),
                    inline: false
                });
            }

            // Add boost information
            const boostInfo = `**Nivel:** ${guild.premiumTier}\n**Boosts:** ${guild.premiumSubscriptionCount || 0}\n**Boosters:** ${guild.members.cache.filter(member => member.premiumSince).size}`;
            embed.addFields({
                name: '🚀 Nitro Boost',
                value: boostInfo,
                inline: true
            });

            // Add server banner or icon
            if (guild.bannerURL()) {
                embed.setImage(guild.bannerURL({ dynamic: true, size: 1024 }));
            }

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🏠 Server info analyzed by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('say')
            .setDescription('💬 Hacer que Archan-chan diga algo kawaii')
            .addStringOption(option =>
                option.setName('mensaje')
                    .setDescription('Mensaje para que diga el bot')
                    .setRequired(true)
                    .setMaxLength(2000))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({
                    content: '❌ ¡Necesitas permisos de gestión de mensajes para compilar mensajes nya~!',
                    ephemeral: true
                });
            }

            const message = interaction.options.getString('mensaje');

            // Filter inappropriate content (basic check)
            const inappropriate = ['@everyone', '@here', 'discord.gg/', 'https://', 'http://'];
            if (inappropriate.some(word => message.toLowerCase().includes(word))) {
                return interaction.reply({
                    content: '❌ ¡El mensaje contiene contenido no permitido nya~! (menciones masivas o enlaces)',
                    ephemeral: true
                });
            }

            await interaction.reply({
                content: '✅ ¡Mensaje compilado y enviado kawaii!',
                ephemeral: true
            });

            await interaction.followUp({
                content: `${message}\n\n*~Mensaje compilado por ${interaction.user.tag} nya~* 🔮`
            });

            interaction.client.database.incrementCommandCount();
            logger.info(`💬 Say command executed by ${interaction.user.tag} nya~`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('roll')
            .setDescription('🎲 Algoritmo de números aleatorios kawaii')
            .addIntegerOption(option =>
                option.setName('lados')
                    .setDescription('Número de lados del dado (2-100)')
                    .setRequired(false)
                    .setMinValue(2)
                    .setMaxValue(100)),
        
        async execute(interaction) {
            const sides = interaction.options.getInteger('lados') || 6;
            const result = Math.floor(Math.random() * sides) + 1;

            // Kawaii result messages based on result
            let resultMessage = '';
            if (result === 1) {
                resultMessage = '¡Ay no nya~! 😅';
            } else if (result === sides) {
                resultMessage = '¡JACKPOT KAWAII! ✨🎉';
            } else if (result > sides * 0.8) {
                resultMessage = '¡Muy bueno uwu! 😊';
            } else if (result < sides * 0.2) {
                resultMessage = 'Aww, mejor suerte la próxima nya~ 🥺';
            } else {
                resultMessage = '¡Resultado compilado! 🔮';
            }

            const embed = new EmbedBuilder()
                .setTitle('🎲 Algoritmo de Dados Kawaii')
                .setDescription(`✨ *Número aleatorio compilado con algoritmos kawaii* ✨`)
                .addFields(
                    { name: '🎯 Resultado', value: `**${result}**`, inline: true },
                    { name: '🎲 Dado', value: `D${sides}`, inline: true },
                    { name: '📊 Probabilidad', value: `${(100/sides).toFixed(1)}%`, inline: true },
                    { name: '💬 Reacción Kawaii', value: resultMessage, inline: false }
                )
                .setColor(result === sides ? '#FFD700' : result === 1 ? '#FF6B6B' : '#9966FF')
                .setFooter({ text: `🔮 Dado lanzado por ${interaction.user.tag} | RNG compilado con amor` })
                .setTimestamp();

            // Add dice emoji based on result (for d6)
            if (sides === 6) {
                const diceEmojis = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
                embed.setDescription(embed.data.description + `\n\n${diceEmojis[result]} **${result}**`);
            }

            await interaction.reply({ embeds: [embed] });

            interaction.client.database.incrementCommandCount();
            logger.info(`🎲 Roll command: d${sides} = ${result} by ${interaction.user.tag} nya~`);
        }
    }
];
