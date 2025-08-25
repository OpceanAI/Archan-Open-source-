const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('🔮 Verifica la latencia del bot kawaii nya~'),
        
        async execute(interaction) {
            const sent = await interaction.reply({ 
                content: '🤔 *compilando latencia kawaii* 🤔', 
                fetchReply: true 
            });
            
            const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
            const wsLatency = interaction.client.ws.ping;

            const embed = new EmbedBuilder()
                .setTitle('🔮💻 Latencia Kawaii de Archan-chan')
                .setColor('#FF69B4')
                .addFields(
                    { name: '📡 Roundtrip', value: `${roundtrip}ms nya~`, inline: true },
                    { name: '🌐 WebSocket', value: `${wsLatency}ms uwu`, inline: true },
                    { name: '⚡ Estado', value: wsLatency < 100 ? '✨ Optimal kawaii!' : '⚠️ Compilando...', inline: true }
                )
                .setFooter({ text: '🔮 Algoritmos de latencia optimizados' })
                .setTimestamp();

            await interaction.editReply({
                content: interaction.client.getKawaiiResponse('success'),
                embeds: [embed]
            });

            interaction.client.database.incrementCommandCount();
            logger.info(`🔮 Ping command executed nya~ - Roundtrip: ${roundtrip}ms`);
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('info')
            .setDescription('📊 Información completa del bot kawaii con estadísticas'),
        
        async execute(interaction) {
            const client = interaction.client;
            const stats = client.database.getStats();
            
            // Calculate uptime with kawaii formatting
            const uptime = stats.uptime;
            const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
            const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));

            const embed = new EmbedBuilder()
                .setTitle('🔮💻 Archan-chan - Bot Kawaii Stats')
                .setDescription('✨ *Estadísticas compiladas con algoritmos kawaii* ✨')
                .setColor('#9966FF')
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '🤖 Bot Info', value: `👤 **${client.user.tag}**\n🆔 \`${client.user.id}\`\n📅 Creado: <t:${Math.floor(client.user.createdTimestamp / 1000)}:F>`, inline: true },
                    { name: '📊 Estadísticas Kawaii', value: `🏠 Servidores: **${client.guilds.cache.size}**\n👥 Usuarios: **${stats.totalUsers}**\n⚡ Comandos ejecutados: **${stats.commandsExecuted}**\n📝 Mensajes procesados: **${stats.messagesProcessed}**`, inline: true },
                    { name: '⏰ Uptime', value: `${days}d ${hours}h ${minutes}m\n🔮 Desde: <t:${Math.floor(stats.startTime / 1000)}:R>`, inline: true },
                    { name: '🧠 Sistema', value: `💾 RAM: **${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB**\n⚡ Node.js: **${process.version}**\n📚 Discord.js: **v14**`, inline: true },
                    { name: '🎯 Comandos Disponibles', value: `🔢 **${client.commands.size}** comandos kawaii\n🏆 Sistema de niveles\n🛡️ Moderación kawaii\n🎨 Utilidades y diversión`, inline: true },
                    { name: '💖 Personalidad', value: '🌸 Programadora kawaii\n🔮 Terminología técnica\n✨ Algoritmos optimizados\n💻 Compilación eficiente', inline: true }
                )
                .setFooter({ text: '🔮 Powered by kawaii algorithms | Made with 💖' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            
            client.database.incrementCommandCount();
            logger.info('📊 Info command executed nya~');
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName('help')
            .setDescription('📚 Lista completa de comandos kawaii organizados por categorías'),
        
        async execute(interaction) {
            const client = interaction.client;
            
            const embed = new EmbedBuilder()
                .setTitle('🔮💻 Archan-chan - Comandos Kawaii')
                .setDescription('✨ *Lista de algoritmos disponibles para compilar* ✨\n\n' + client.kawaiiGreeting)
                .setColor('#FF1493')
                .addFields(
                    { 
                        name: '⚙️ Comandos Básicos', 
                        value: '🔮 `/ping` - Latencia kawaii\n📊 `/info` - Estadísticas del bot\n📚 `/help` - Esta lista nya~', 
                        inline: false 
                    },
                    { 
                        name: '🛡️ Moderación Kawaii', 
                        value: '👢 `/kick` - Expulsar con algoritmos\n🔨 `/ban` - Banear kawaii\n🧹 `/clear` - Limpiar mensajes', 
                        inline: false 
                    },
                    { 
                        name: '🏆 Sistema de Niveles', 
                        value: '📈 `/rank` - Ver nivel kawaii\n🏅 `/ranking` - Leaderboard top\n⚙️ `/set-level` - Modificar nivel', 
                        inline: false 
                    },
                    { 
                        name: '🚫 Filtros Kawaii', 
                        value: '➕ `/add-badword` - Compilar filtro\n➖ `/remove-badword` - Descompilar\n📋 `/status-badwords` - Estado filtros', 
                        inline: false 
                    },
                    { 
                        name: '🎁 Sistema Recompensas', 
                        value: '🎉 `/add-reward` - Compilar recompensa\n🗑️ `/remove-reward` - Descompilar\n📊 `/rewards-status` - Estado rewards', 
                        inline: false 
                    },
                    { 
                        name: '🎨 Utilidades', 
                        value: '🖼️ `/embed` - Crear embeds kawaii\n👤 `/avatar` - Ver avatar\n🎲 `/roll` - Dados aleatorios\n💬 `/say` - Hablar kawaii', 
                        inline: false 
                    }
                )
                .setFooter({ text: '🔮 Usa los comandos con amor kawaii nya~ | Total: 26+ comandos' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            
            client.database.incrementCommandCount();
            logger.info('📚 Help command executed uwu');
        }
    }
];
