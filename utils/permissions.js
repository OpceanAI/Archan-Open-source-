const { PermissionFlagsBits } = require('discord.js');
const logger = require('./logger');

/**
 * Permission utility functions for kawaii bot commands
 */

/**
 * Check if user has required permissions with kawaii error messages
 */
function checkPermissions(interaction, permission) {
    if (!interaction.member.permissions.has(PermissionFlagsBits[permission])) {
        const permissionNames = {
            'KICK_MEMBERS': 'expulsar miembros',
            'BAN_MEMBERS': 'banear miembros',
            'MANAGE_MESSAGES': 'gestionar mensajes',
            'MANAGE_ROLES': 'gestionar roles',
            'MANAGE_GUILD': 'administrar servidor',
            'ADMINISTRATOR': 'administrador'
        };

        const kawaiiErrors = [
            `❌ ¡Necesitas permisos para ${permissionNames[permission] || permission} nya~!`,
            `🚫 ¡Sin autorización para compilar este comando uwu! (${permissionNames[permission] || permission})`,
            `⚠️ ¡Permisos insuficientes kawaii! Se requiere: ${permissionNames[permission] || permission}`,
            `🔒 ¡Acceso denegado nya~! Falta permiso: ${permissionNames[permission] || permission}`
        ];

        const errorMessage = kawaiiErrors[Math.floor(Math.random() * kawaiiErrors.length)];

        interaction.reply({
            content: errorMessage,
            ephemeral: true
        });

        logger.warn(`🚫 Permission denied: ${interaction.user.tag} tried to use ${interaction.commandName} without ${permission}`);
        return false;
    }
    return true;
}

/**
 * Check if bot has required permissions
 */
function checkBotPermissions(interaction, permission) {
    const botMember = interaction.guild.members.me;
    
    if (!botMember.permissions.has(PermissionFlagsBits[permission])) {
        const kawaiiErrors = [
            `❌ ¡No tengo permisos para compilar este comando nya~! Necesito: ${permission}`,
            `🤖 ¡Mi algoritmo necesita más permisos uwu! Falta: ${permission}`,
            `⚠️ ¡Permisos de bot insuficientes kawaii! Se requiere: ${permission}`,
            `🔧 ¡Configura mis permisos nya~! Necesito: ${permission}`
        ];

        const errorMessage = kawaiiErrors[Math.floor(Math.random() * kawaiiErrors.length)];

        interaction.reply({
            content: errorMessage,
            ephemeral: true
        });

        logger.warn(`🤖 Bot permission missing: ${permission} for command ${interaction.commandName}`);
        return false;
    }
    return true;
}

/**
 * Check if target user can be moderated (hierarchy check)
 */
function canModerate(interaction, targetMember) {
    const executor = interaction.member;
    const bot = interaction.guild.members.me;

    // Check if executor can moderate target
    if (targetMember.roles.highest.position >= executor.roles.highest.position && 
        !executor.permissions.has(PermissionFlagsBits.Administrator)) {
        
        interaction.reply({
            content: '❌ ¡No puedes moderar a alguien con rol igual o superior nya~!',
            ephemeral: true
        });
        return false;
    }

    // Check if bot can moderate target
    if (targetMember.roles.highest.position >= bot.roles.highest.position) {
        interaction.reply({
            content: '❌ ¡No puedo moderar a alguien con rol igual o superior al mío uwu!',
            ephemeral: true
        });
        return false;
    }

    return true;
}

/**
 * Get user permission level for display
 */
function getUserPermissionLevel(member) {
    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
        return '👑 Administrador Kawaii';
    } else if (member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return '⚙️ Manager Kawaii';
    } else if (member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return '🛡️ Moderador Kawaii';
    } else if (member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return '📝 Helper Kawaii';
    } else {
        return '👤 Miembro Kawaii';
    }
}

/**
 * Format permissions list for display
 */
function formatPermissions(permissions) {
    const permissionMap = {
        [PermissionFlagsBits.Administrator]: '👑 Administrador',
        [PermissionFlagsBits.ManageGuild]: '⚙️ Gestionar Servidor',
        [PermissionFlagsBits.ManageRoles]: '🎭 Gestionar Roles',
        [PermissionFlagsBits.ManageChannels]: '📺 Gestionar Canales',
        [PermissionFlagsBits.KickMembers]: '👢 Expulsar Miembros',
        [PermissionFlagsBits.BanMembers]: '🔨 Banear Miembros',
        [PermissionFlagsBits.ModerateMembers]: '🛡️ Moderar Miembros',
        [PermissionFlagsBits.ManageMessages]: '📝 Gestionar Mensajes',
        [PermissionFlagsBits.ManageNicknames]: '✏️ Gestionar Apodos',
        [PermissionFlagsBits.MentionEveryone]: '📢 Mencionar Everyone'
    };

    const permissionList = [];
    
    for (const [flag, name] of Object.entries(permissionMap)) {
        if (permissions.has(BigInt(flag))) {
            permissionList.push(name);
        }
    }

    return permissionList.length > 0 ? permissionList.join('\n') : 'Sin permisos especiales nya~';
}

module.exports = {
    checkPermissions,
    checkBotPermissions,
    canModerate,
    getUserPermissionLevel,
    formatPermissions
};
