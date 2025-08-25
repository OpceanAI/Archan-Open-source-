const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');

// Load environment variables
require('dotenv').config();

/**
 * Sync slash commands with Discord API
 * This script registers all kawaii commands to Discord
 */
async function syncCommands() {
    const commands = [];
    
    logger.info('🔮 Compilando comandos para sincronización kawaii...');

    // Load all command files
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const commandArray = require(filePath);
        
        if (Array.isArray(commandArray)) {
            for (const command of commandArray) {
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                    logger.debug(`📝 Comando añadido: ${command.data.name} from ${file}`);
                } else {
                    logger.warn(`⚠️ Comando en ${file} no tiene propiedades requeridas nya~`);
                }
            }
        }
    }

    // Construct and prepare an instance of the REST module
    const rest = new REST({ version: '10' }).setToken(process.env.ARCHAN_BOT_TOKEN || process.env.TOKEN);

    // Deploy commands
    try {
        logger.info(`🚀 Iniciando sincronización de ${commands.length} comandos kawaii...`);

        const clientId = process.env.ARCHAN_CLIENT_ID || process.env.CLIENT_ID;
        
        if (!clientId) {
            throw new Error('❌ CLIENT_ID no encontrado en variables de entorno nya~!');
        }

        // Register global commands
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );

        logger.success(`✅ ${data.length} comandos kawaii sincronizados exitosamente nya~! 🔮`);
        
        // Display registered commands
        console.log(logger.formatMessage('info', '📋 Comandos registrados:'));
        data.forEach((command, index) => {
            console.log(`   ${index + 1}. /${command.name} - ${command.description}`);
        });

        console.log('\n🎉 ¡Sincronización completa! Archan-chan está lista para compilar kawaii nya~ ✨\n');

    } catch (error) {
        logger.error('❌ Error sincronizando comandos kawaii:', error);
        process.exit(1);
    }
}

// Run the sync if this file is executed directly
if (require.main === module) {
    syncCommands().catch(error => {
        logger.error('❌ Error fatal en sincronización:', error);
        process.exit(1);
    });
}

module.exports = syncCommands;
