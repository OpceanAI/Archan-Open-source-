const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const logger = require('./utils/logger');
const database = require('./database');

// Initialize the Discord client with kawaii personality
class ArchanBot extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildModeration
            ]
        });

        // Kawaii bot properties
        this.commands = new Collection();
        this.cooldowns = new Collection();
        this.database = database;
        
        // Kawaii greeting message
        this.kawaiiGreeting = "¡Konnichiwa! Soy Archan, la bot kawaii más inteligente! 🔮💻";
        
        // Bot configuration
        this.config = {
            token: process.env.ARCHAN_BOT_TOKEN || process.env.TOKEN,
            clientId: process.env.ARCHAN_CLIENT_ID || process.env.CLIENT_ID,
            ownerId: process.env.ARCHAN_OWNER_ID || process.env.OWNER_ID
        };
    }

    async start() {
        try {
            logger.info('🔮 Iniciando Archan-chan kawaii bot nya~!');
            
            // Load commands and events
            await loadCommands(this);
            await loadEvents(this);
            
            // Login to Discord
            await this.login(this.config.token);
            
        } catch (error) {
            logger.error('❌ Error starting Archan-chan:', error);
            process.exit(1);
        }
    }

    // Kawaii response helper
    getKawaiiResponse(type = 'success') {
        const responses = {
            success: [
                '✨ ¡Compilación exitosa nya~! ✨',
                '🔮 ¡Algoritmo ejecutado con éxito uwu! 🔮',
                '💻 ¡Proceso completado kawaii! 💻',
                '🧠 ¡Operación optimizada nya~! 🧠'
            ],
            error: [
                '❌ ¡Error en compilación nya~! ❌',
                '🔴 ¡Algoritmo falló uwu! 🔴',
                '💥 ¡Exception no controlada nya~! 💥',
                '⚠️ ¡Debug requerido uwu! ⚠️'
            ],
            thinking: [
                '🤔 *compilando respuesta kawaii* 🤔',
                '⚡ *ejecutando algoritmos nya~* ⚡',
                '🔄 *procesando datos uwu* 🔄',
                '🧮 *calculando con magia kawaii* 🧮'
            ]
        };
        
        const messages = responses[type] || responses.success;
        return messages[Math.floor(Math.random() * messages.length)];
    }
}

// Error handling with kawaii messages
process.on('unhandledRejection', (error) => {
    logger.error('💥 Unhandled Rejection nya~:', error);
});

process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught Exception uwu:', error);
    process.exit(1);
});

// Start the kawaii bot
const archan = new ArchanBot();
archan.start();

module.exports = ArchanBot;
