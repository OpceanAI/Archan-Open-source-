const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Load all slash commands from the commands directory
 * Each command file exports an array of command objects with data and execute properties
 */
async function loadCommands(client) {
    logger.info('🔮 Compilando comandos kawaii nya~');
    
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    let totalCommands = 0;

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const commands = require(filePath);
        
        // Each command file exports an array of commands
        if (Array.isArray(commands)) {
            for (const command of commands) {
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    totalCommands++;
                    logger.debug(`📝 Comando compilado: ${command.data.name} from ${file}`);
                } else {
                    logger.warn(`⚠️ Comando en ${file} no tiene propiedades requeridas nya~`);
                }
            }
        } else {
            logger.warn(`⚠️ Archivo ${file} no exporta array de comandos uwu`);
        }
    }

    logger.info(`✅ ${totalCommands} comandos kawaii compilados exitosamente nya~! 🔮`);
}

module.exports = { loadCommands };
