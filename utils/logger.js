const chalk = require('chalk');

/**
 * Kawaii logger with colorful output using chalk
 * Provides different log levels with emoji indicators
 */

class KawaiiLogger {
    constructor() {
        this.logLevel = process.env.LOG_LEVEL || 'info';
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }

    /**
     * Get current timestamp with kawaii formatting
     */
    getTimestamp() {
        return new Date().toLocaleTimeString('es-ES', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    /**
     * Check if log level should be displayed
     */
    shouldLog(level) {
        return this.levels[level] <= this.levels[this.logLevel];
    }

    /**
     * Format log message with kawaii styling
     */
    formatMessage(level, message, ...args) {
        const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
        const levelColors = {
            error: chalk.red.bold,
            warn: chalk.yellow.bold,
            info: chalk.cyan.bold,
            debug: chalk.magenta.bold
        };

        const levelEmojis = {
            error: '❌',
            warn: '⚠️',
            info: '🔮',
            debug: '🐛'
        };

        const levelText = levelColors[level](`${levelEmojis[level]} ${level.toUpperCase()}`);
        const formattedMessage = typeof message === 'string' ? message : JSON.stringify(message);

        return `${timestamp} ${levelText} ${formattedMessage}`;
    }

    /**
     * Log error messages with kawaii styling
     */
    error(message, ...args) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message), ...args);
        }
    }

    /**
     * Log warning messages with kawaii styling
     */
    warn(message, ...args) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message), ...args);
        }
    }

    /**
     * Log info messages with kawaii styling
     */
    info(message, ...args) {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage('info', message), ...args);
        }
    }

    /**
     * Log debug messages with kawaii styling
     */
    debug(message, ...args) {
        if (this.shouldLog('debug')) {
            console.log(this.formatMessage('debug', message), ...args);
        }
    }

    /**
     * Log kawaii success messages
     */
    success(message, ...args) {
        if (this.shouldLog('info')) {
            const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
            const successText = chalk.green.bold('✅ SUCCESS');
            console.log(`${timestamp} ${successText} ${message}`, ...args);
        }
    }

    /**
     * Log kawaii startup banner
     */
    banner() {
        console.log(chalk.magenta(`
╔═══════════════════════════════════════════════════════════════╗
║             🔮💻 ARCHAN-CHAN KAWAII LOGGER 💻🔮             ║
║                     ✨ Compilando logs nya~ ✨                ║
╚═══════════════════════════════════════════════════════════════╝
        `));
    }
}

// Create singleton instance
const logger = new KawaiiLogger();

// Display banner on first import
logger.banner();

module.exports = logger;
