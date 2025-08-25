const logger = require('./utils/logger');

/**
 * In-memory database system for Archan-chan kawaii bot
 * Replaces Redis with JavaScript objects for data persistence
 */
class ArchanDatabase {
    constructor() {
        // Main data storage with kawaii structure
        this.data = {
            // Guild-specific settings
            guilds: new Map(),
            // User levels across all guilds
            userLevels: new Map(),
            // Global statistics
            stats: {
                commandsExecuted: 0,
                messagesProcessed: 0,
                levelsGained: 0,
                startTime: Date.now()
            }
        };

        logger.info('🔮 Base de datos kawaii inicializada nya~!');
    }

    // Guild management with kawaii logging
    getGuild(guildId) {
        if (!this.data.guilds.has(guildId)) {
            this.data.guilds.set(guildId, this.createDefaultGuildData());
            logger.debug(`💻 Nueva guild compilada: ${guildId} uwu`);
        }
        return this.data.guilds.get(guildId);
    }

    createDefaultGuildData() {
        return {
            // Level system configuration
            levels: {
                baseXP: 100,
                difficulty: 1.2,
                messageXP: 15,
                levelUpChannel: null,
                levelUpMessage: '🎉 ¡{user} subió al nivel {level} nya~! ✨',
                levelUpTitle: '🔮 ¡Level Up Kawaii! 🔮',
                rewardMessage: '🎁 ¡{user} recibió {role} por alcanzar nivel {level} uwu! 💖',
                rewardTitle: '✨ ¡Nueva Recompensa Kawaii! ✨'
            },
            // Bad words filter system
            badWords: {
                words: [],
                whitelistRoles: [],
                enabled: true
            },
            // Level rewards system
            rewards: new Map(),
            // User data for this guild
            users: new Map()
        };
    }

    // User level management with kawaii algorithms
    getUserLevel(guildId, userId) {
        const guild = this.getGuild(guildId);
        if (!guild.users.has(userId)) {
            guild.users.set(userId, {
                xp: 0,
                level: 1,
                messages: 0,
                lastMessage: 0
            });
        }
        return guild.users.get(userId);
    }

    // Add XP with kawaii calculations
    addUserXP(guildId, userId, amount = null) {
        const guild = this.getGuild(guildId);
        const user = this.getUserLevel(guildId, userId);
        const settings = guild.levels;

        // Kawaii XP calculation algorithm
        const xpToAdd = amount || Math.floor(Math.random() * settings.messageXP) + 5;
        user.xp += xpToAdd;
        user.messages++;
        user.lastMessage = Date.now();

        // Check for level up with kawaii math
        const newLevel = this.calculateLevel(user.xp, settings.baseXP, settings.difficulty);
        const leveledUp = newLevel > user.level;
        
        if (leveledUp) {
            user.level = newLevel;
            this.data.stats.levelsGained++;
            logger.info(`✨ Usuario ${userId} subió al nivel ${newLevel} nya~!`);
        }

        return { leveledUp, newLevel, xpGained: xpToAdd };
    }

    // Kawaii level calculation algorithm
    calculateLevel(xp, baseXP, difficulty) {
        return Math.floor(Math.pow(xp / baseXP, 1 / difficulty)) + 1;
    }

    // Calculate XP required for next level
    getXPForLevel(level, baseXP, difficulty) {
        return Math.floor(baseXP * Math.pow(level - 1, difficulty));
    }

    // Get leaderboard with kawaii ranking
    getLeaderboard(guildId, limit = 10) {
        const guild = this.getGuild(guildId);
        const users = Array.from(guild.users.entries())
            .map(([userId, data]) => ({ userId, ...data }))
            .sort((a, b) => {
                if (b.level !== a.level) return b.level - a.level;
                return b.xp - a.xp;
            })
            .slice(0, limit);

        logger.debug(`🏆 Leaderboard compilado para guild ${guildId} nya~`);
        return users;
    }

    // Bad words management with kawaii filtering
    addBadWord(guildId, word) {
        const guild = this.getGuild(guildId);
        const normalizedWord = word.toLowerCase().trim();
        
        if (!guild.badWords.words.includes(normalizedWord)) {
            guild.badWords.words.push(normalizedWord);
            logger.info(`🚫 Palabra "${word}" compilada al filtro kawaii nya~`);
            return true;
        }
        return false;
    }

    removeBadWord(guildId, word) {
        const guild = this.getGuild(guildId);
        const normalizedWord = word.toLowerCase().trim();
        const index = guild.badWords.words.indexOf(normalizedWord);
        
        if (index > -1) {
            guild.badWords.words.splice(index, 1);
            logger.info(`✅ Palabra "${word}" descompilada del filtro kawaii uwu`);
            return true;
        }
        return false;
    }

    // Role whitelist management
    addWhitelistRole(guildId, roleId) {
        const guild = this.getGuild(guildId);
        if (!guild.badWords.whitelistRoles.includes(roleId)) {
            guild.badWords.whitelistRoles.push(roleId);
            return true;
        }
        return false;
    }

    removeWhitelistRole(guildId, roleId) {
        const guild = this.getGuild(guildId);
        const index = guild.badWords.whitelistRoles.indexOf(roleId);
        if (index > -1) {
            guild.badWords.whitelistRoles.splice(index, 1);
            return true;
        }
        return false;
    }

    // Rewards management with kawaii system
    addReward(guildId, level, roleId) {
        const guild = this.getGuild(guildId);
        guild.rewards.set(level, roleId);
        logger.info(`🎁 Recompensa compilada para nivel ${level} nya~`);
    }

    removeReward(guildId, level) {
        const guild = this.getGuild(guildId);
        const removed = guild.rewards.delete(level);
        if (removed) {
            logger.info(`🗑️ Recompensa descompilada del nivel ${level} uwu`);
        }
        return removed;
    }

    // Configuration updates with kawaii validation
    updateLevelConfig(guildId, setting, value) {
        const guild = this.getGuild(guildId);
        const validSettings = ['baseXP', 'difficulty', 'messageXP', 'levelUpChannel', 'levelUpMessage', 'levelUpTitle', 'rewardMessage', 'rewardTitle'];
        
        if (validSettings.includes(setting)) {
            guild.levels[setting] = value;
            logger.info(`⚙️ Configuración ${setting} actualizada kawaii nya~`);
            return true;
        }
        return false;
    }

    // Statistics with kawaii analytics
    getStats() {
        return {
            ...this.data.stats,
            guilds: this.data.guilds.size,
            totalUsers: Array.from(this.data.guilds.values())
                .reduce((total, guild) => total + guild.users.size, 0),
            uptime: Date.now() - this.data.stats.startTime
        };
    }

    // Increment command counter
    incrementCommandCount() {
        this.data.stats.commandsExecuted++;
    }

    // Increment message counter
    incrementMessageCount() {
        this.data.stats.messagesProcessed++;
    }

    // Backup system for persistence (optional)
    exportData() {
        const exportData = {
            guilds: Object.fromEntries(this.data.guilds),
            stats: this.data.stats,
            timestamp: Date.now()
        };
        
        logger.info('💾 Datos exportados con algoritmos kawaii nya~');
        return JSON.stringify(exportData, null, 2);
    }

    // Import backup data
    importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            if (imported.guilds) {
                this.data.guilds = new Map(Object.entries(imported.guilds));
            }
            if (imported.stats) {
                this.data.stats = { ...this.data.stats, ...imported.stats };
            }
            logger.info('📥 Datos importados con éxito kawaii uwu');
            return true;
        } catch (error) {
            logger.error('❌ Error importing data nya~:', error);
            return false;
        }
    }
}

// Create and export singleton instance
const database = new ArchanDatabase();
module.exports = database;
