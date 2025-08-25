const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const geminiService = require('../ai/geminiService');
const logger = require('../utils/logger');

const aiCommand = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('🤖 Habla con Archan-chan AI kawaii programadora!')
        .addStringOption(option =>
            option.setName('pregunta')
                .setDescription('¿Qué quieres preguntarle a Archan-chan sobre programación?')
                .setRequired(true)
        ),

    category: 'basic',

    async execute(interaction) {
        try {
            const pregunta = interaction.options.getString('pregunta');
            
            // Defer reply for longer processing time
            await interaction.deferReply();

            logger.info(`🤖 AI command used by ${interaction.user.tag}: ${pregunta.substring(0, 100)}...`);

            // Generate AI response
            const aiResponse = await geminiService.generateKawaiiProgrammerResponse(pregunta);

            // Split message if needed
            const messageParts = geminiService.splitLongMessage(aiResponse);

            // Send the first part as reply
            await interaction.editReply(messageParts[0]);

            // Send additional parts as follow-ups if needed
            for (let i = 1; i < messageParts.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
                await interaction.followUp(messageParts[i]);
            }

            logger.info(`✅ AI command response sent to ${interaction.user.tag} in ${messageParts.length} parts`);

        } catch (error) {
            logger.error(`❌ Error in AI command: ${error.message}`);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error Kawaii')
                .setDescription('Nyaa~ mi cerebro kawaii tuvo un error de compilación! Intenta de nuevo más tarde uwu 💻💔')
                .setColor('#FF0000')
                .setFooter({ text: '🔮 Error compilado con tristeza kawaii' })
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] }).catch(() => {});
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
            }
        }
    }
};

// Comando para análisis de imágenes y texto
const analyzeCommand = {
    data: new SlashCommandBuilder()
        .setName('analyze')
        .setDescription('🔍 Analiza imágenes y texto para programación kawaii!')
        .addAttachmentOption(option =>
            option.setName('imagen')
                .setDescription('Imagen de código, interfaz, error o documentación nya~')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('texto')
                .setDescription('Texto adicional o pregunta específica sobre la imagen uwu')
                .setRequired(false)),

    category: 'basic',

    async execute(interaction) {
        try {
            const imagen = interaction.options.getAttachment('imagen');
            const texto = interaction.options.getString('texto');
            
            // Validar que al menos uno esté presente
            if (!imagen && !texto) {
                await interaction.reply({
                    content: '❌ Nyaa~ necesito al menos una imagen o texto para analizar! Súbeme una imagen de código o escríbeme algo uwu 💻✨',
                    ephemeral: true
                });
                return;
            }
            
            // Defer reply for longer processing time
            await interaction.deferReply();

            logger.info(`🔍 Analyze command used by ${interaction.user.tag}: ${imagen ? 'with image' : 'text only'}`);

            let imageUrl = null;
            if (imagen) {
                // Validar que sea una imagen
                if (!imagen.contentType?.startsWith('image/')) {
                    await interaction.editReply('❌ Nyaa~ solo puedo analizar imágenes! Sube un archivo .png, .jpg, .gif o similar uwu 💻');
                    return;
                }
                imageUrl = imagen.url;
                logger.info(`🖼️ Imagen recibida: ${imagen.name} (${imagen.size} bytes)`);
            }

            // Generate AI response
            const aiResponse = await geminiService.analyzeImageAndText(texto, imageUrl);

            // Split message if needed
            const messageParts = geminiService.splitLongMessage(aiResponse);

            // Send the first part as reply
            await interaction.editReply(messageParts[0]);

            // Send additional parts as follow-ups if needed
            for (let i = 1; i < messageParts.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
                await interaction.followUp(messageParts[i]);
            }

            logger.info(`✅ Analyze command response sent to ${interaction.user.tag} in ${messageParts.length} parts`);

        } catch (error) {
            logger.error(`❌ Error in Analyze command: ${error.message}`);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error de Análisis Kawaii')
                .setDescription('Nyaa~ mi cerebro kawaii tuvo un error analizando tu imagen! Verifica que el archivo sea una imagen válida e intenta de nuevo uwu 💻💔')
                .setColor('#FF0000')
                .setFooter({ text: '🔮 Error de análisis compilado con tristeza kawaii' })
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] }).catch(() => {});
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
            }
        }
    }
};

module.exports = [aiCommand, analyzeCommand];