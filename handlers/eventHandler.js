const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Load all event handlers from the events directory
 * Each event file exports a function that sets up the event listener
 */
async function loadEvents(client) {
    logger.info('🔮 Compilando eventos kawaii nya~');
    
    const eventsPath = path.join(__dirname, '..', 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    let totalEvents = 0;

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (typeof event === 'function') {
            event(client);
            totalEvents++;
            logger.debug(`🎉 Evento compilado: ${file.replace('.js', '')} nya~`);
        } else {
            logger.warn(`⚠️ Evento en ${file} no exporta función uwu`);
        }
    }

    logger.info(`✅ ${totalEvents} eventos kawaii compilados exitosamente nya~! 🔮`);
}

module.exports = { loadEvents };
