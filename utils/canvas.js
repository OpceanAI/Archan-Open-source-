const { createCanvas, loadImage, registerFont } = require('canvas');
const logger = require('./logger');

/**
 * Canvas utility for creating kawaii rank cards and other graphics
 */

/**
 * Create a kawaii rank card with user information
 */
async function createRankCard(options) {
    try {
        const {
            user,
            level,
            currentXP,
            nextLevelXP,
            progress,
            rank,
            messages
        } = options;

        // Card dimensions
        const width = 800;
        const height = 250;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Kawaii gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#FF69B4'); // Kawaii pink
        gradient.addColorStop(0.5, '#9966FF'); // Purple
        gradient.addColorStop(1, '#00CED1'); // Cyan

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Semi-transparent overlay for readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, width, height);

        // Load user avatar
        let avatar;
        try {
            avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
        } catch (error) {
            logger.warn('Could not load user avatar, using default');
            // Create a default avatar placeholder
            ctx.fillStyle = '#36393f';
            ctx.beginPath();
            ctx.arc(90, 90, 50, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(user.displayName.charAt(0).toUpperCase(), 90, 100);
        }

        // Draw avatar with kawaii border
        if (avatar) {
            // Avatar border (kawaii glow effect)
            ctx.shadowColor = '#FF69B4';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(90, 90, 52, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.shadowBlur = 0;

            // Clip avatar to circle
            ctx.save();
            ctx.beginPath();
            ctx.arc(90, 90, 50, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, 40, 40, 100, 100);
            ctx.restore();
        }

        // User information text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(user.displayName, 160, 60);

        // Kawaii subtitle
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#FFB6C1';
        ctx.fillText('✨ Programador Kawaii ✨', 160, 85);

        // Level information
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`Nivel ${level}`, 160, 120);

        // Rank information
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`Rank #${rank}`, 300, 120);

        // Messages count
        ctx.fillStyle = '#87CEEB';
        ctx.fillText(`${messages} mensajes nya~`, 160, 150);

        // XP Progress Bar
        const progressBarWidth = 400;
        const progressBarHeight = 25;
        const progressBarX = 160;
        const progressBarY = 170;

        // Progress bar background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 12);
        ctx.fill();

        // Progress bar fill (kawaii gradient)
        const progressWidth = (progress / 100) * progressBarWidth;
        const progressGradient = ctx.createLinearGradient(progressBarX, progressBarY, progressBarX + progressWidth, progressBarY);
        progressGradient.addColorStop(0, '#FF69B4');
        progressGradient.addColorStop(1, '#FFD700');

        ctx.fillStyle = progressGradient;
        ctx.roundRect(progressBarX, progressBarY, progressWidth, progressBarHeight, 12);
        ctx.fill();

        // Progress text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        const progressText = `${currentXP.toLocaleString()} / ${nextLevelXP.toLocaleString()} XP (${progress}%)`;
        ctx.fillText(progressText, progressBarX + progressBarWidth / 2, progressBarY + 18);

        // Kawaii decorations
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#FFB6C1';
        ctx.textAlign = 'right';
        ctx.fillText('🔮💻', width - 20, 40);
        ctx.fillText('✨🧠', width - 20, 220);

        // Add rounded corners helper if not available
        if (!ctx.roundRect) {
            ctx.roundRect = function(x, y, width, height, radius) {
                this.beginPath();
                this.moveTo(x + radius, y);
                this.lineTo(x + width - radius, y);
                this.quadraticCurveTo(x + width, y, x + width, y + radius);
                this.lineTo(x + width, y + height - radius);
                this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                this.lineTo(x + radius, y + height);
                this.quadraticCurveTo(x, y + height, x, y + height - radius);
                this.lineTo(x, y + radius);
                this.quadraticCurveTo(x, y, x + radius, y);
                this.closePath();
            };
        }

        return canvas.toBuffer('image/png');

    } catch (error) {
        logger.error('❌ Error creating rank card:', error);
        throw error;
    }
}

/**
 * Create a simple kawaii server banner
 */
async function createServerBanner(guild, stats) {
    try {
        const width = 800;
        const height = 200;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Kawaii background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#9966FF');
        gradient.addColorStop(1, '#00CED1');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Server name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(guild.name, width / 2, 60);

        // Stats
        ctx.font = '20px sans-serif';
        ctx.fillText(`👥 ${guild.memberCount} miembros • 📊 ${stats.totalUsers} activos`, width / 2, 100);
        ctx.fillText(`💬 ${stats.totalMessages} mensajes • ⚡ ${stats.commandsExecuted} comandos`, width / 2, 130);

        // Kawaii decoration
        ctx.font = '24px sans-serif';
        ctx.fillText('✨ Servidor Kawaii ✨', width / 2, 170);

        return canvas.toBuffer('image/png');

    } catch (error) {
        logger.error('❌ Error creating server banner:', error);
        throw error;
    }
}

module.exports = {
    createRankCard,
    createServerBanner
};
