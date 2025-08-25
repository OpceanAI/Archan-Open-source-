const logger = require('../utils/logger');

/**
 * Ready event handler - fires when the bot is fully initialized
 * Displays kawaii startup messages and bot statistics
 */
module.exports = (client) => {
    client.once('ready', async () => {
        logger.info('🔮💻 ¡Archan-chan está lista para compilar kawaii nya~! ✨');
        
        // Display bot statistics with kawaii formatting
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
        const commands = client.commands.size;

        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    🔮 ARCHAN-CHAN KAWAII BOT 🔮                ║
╠═══════════════════════════════════════════════════════════════╣
║  👤 Usuario: ${client.user.tag.padEnd(35)} ║
║  🆔 ID: ${client.user.id.padEnd(39)} ║
║  🏠 Servidores: ${String(guilds).padEnd(33)} ║
║  👥 Usuarios: ${String(users).padEnd(35)} ║
║  ⚡ Comandos: ${String(commands).padEnd(34)} ║
║  🔮 Estado: ¡Compilando algoritmos kawaii nya~!              ║
╚═══════════════════════════════════════════════════════════════╝
        `);

        // Set kawaii bot activity
        const activities = [
            '🔮 Compilando algoritmos kawaii',
            '💻 Programando con amor nya~',
            '✨ Optimizando código uwu',
            '🧠 Procesando datos kawaii',
            '💖 Ayudando programadores'
        ];

        let activityIndex = 0;
        
        const updateActivity = () => {
            client.user.setActivity(activities[activityIndex], { type: 'CUSTOM' });
            activityIndex = (activityIndex + 1) % activities.length;
        };

        // Initial activity
        updateActivity();
        
        // Update activity every 30 seconds
        setInterval(updateActivity, 30000);

        // Greet in all guilds (optional - can be commented out for production)
        if (process.env.NODE_ENV === 'development') {
            logger.info('🔮 Modo desarrollo - enviando saludo kawaii...');
            
            for (const guild of client.guilds.cache.values()) {
                // Find a suitable channel to send greeting (general, main, etc.)
                const channel = guild.channels.cache.find(ch => 
                    ch.type === 0 && // Text channel
                    ch.permissionsFor(guild.members.me).has(['SendMessages', 'ViewChannel']) &&
                    (ch.name.includes('general') || ch.name.includes('main') || ch.name.includes('chat'))
                );

                if (channel) {
                    setTimeout(() => {
                        channel.send(client.kawaiiGreeting + '\n✨ *Bot reiniciado con nuevos algoritmos kawaii* ✨')
                            .catch(err => logger.debug(`No se pudo enviar saludo en ${guild.name}: ${err.message}`));
                    }, 2000);
                }
            }
        }

        logger.info(`✅ Archan-chan conectada exitosamente en ${guilds} servidores con ${users} usuarios nya~! 🔮`);
    });
};
