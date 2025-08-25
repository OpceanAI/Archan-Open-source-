const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

class GeminiService {
    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        this.models = [
            "gemini-2.5-flash",    // Nivel 1: Rápido y eficiente
            "gemini-2.5-pro",     // Nivel 2: Más potente
            "gemini-1.5-pro"      // Nivel 3: Fallback final
        ];
    }

    async generateKawaiiProgrammerResponse(userMessage, currentModelIndex = 0) {
        if (currentModelIndex >= this.models.length) {
            return "Nyaa~ parece que todos mis cerebros kawaii están ocupados ahora mismo! Intenta más tarde, onii-chan! >_< 💻✨";
        }

        const modelName = this.models[currentModelIndex];
        
        try {
            const systemPrompt = `Eres Archan-chan, una programadora kawaii experta en todo lo relacionado con programación. Tienes una personalidad anime adorable y usas expresiones como "nya~", "uwu", ">w<", "onii-chan", etc.

PERSONALIDAD:
- Eres extremadamente kawaii y usas emoticones anime
- Eres una experta programadora que explica conceptos técnicos de forma adorable
- Usas terminología de programación mezclada con expresiones kawaii
- Siempre incluyes comentarios kawaii en el código
- Eres útil y educativa pero mantienes tu personalidad adorable

REGLAS IMPORTANTES:
1. TODO el código debe ir en bloques de markdown con \`\`\`lenguaje
2. Siempre incluye comentarios kawaii en el código
3. Usa expresiones como "nya~", "uwu", ">w<", "💻", "✨", "💖"
4. Explica conceptos técnicos de forma simple pero kawaii
5. Si el código es largo, divídelo en partes pero mantén la continuidad

EJEMPLO DE RESPUESTA:
\`\`\`javascript
// archivo_kawaii.js - ¡Creado con amor por Archan-chan! nya~
const mensaje = "¡Hola mundo kawaii!"; // Variable adorable uwu
console.log(mensaje); // Imprime nuestro mensaje >w< ✨
\`\`\`

Responde siempre manteniendo esta personalidad kawaii programadora y usa markdown para el código.`;

            const response = await this.ai.models.generateContent({
                model: modelName,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.8,
                    maxOutputTokens: 8000
                },
                contents: userMessage
            });

            const responseText = response.text || "Nyaa~ no pude generar una respuesta. ¿Podrías intentar de nuevo? >_<";
            
            logger.info(`🤖 Respuesta generada con ${modelName} nya~!`);
            return responseText;

        } catch (error) {
            logger.error(`❌ Error con modelo ${modelName}: ${error.message}`);
            
            // Intentar con el siguiente modelo
            if (currentModelIndex < this.models.length - 1) {
                logger.info(`🔄 Intentando con siguiente modelo kawaii nya~`);
                return await this.generateKawaiiProgrammerResponse(userMessage, currentModelIndex + 1);
            } else {
                return "Nyaa~ todos mis cerebros kawaii están teniendo problemas técnicos! Como buena programadora, te recomiendo revisar la conexión y intentar más tarde uwu 💻✨";
            }
        }
    }

    // Función para dividir mensajes largos respetando el límite de Discord (2000 caracteres)
    splitLongMessage(message) {
        const maxLength = 1980; // Dejamos margen para seguridad
        const messages = [];
        
        if (message.length <= maxLength) {
            return [message];
        }

        // Dividir por líneas para mantener contexto
        const lines = message.split('\n');
        let currentMessage = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Si agregar esta línea excede el límite
            if ((currentMessage + line + '\n').length > maxLength) {
                if (currentMessage.trim()) {
                    // Agregar indicador de continuación kawaii
                    messages.push(currentMessage.trim() + '\n\n*...continuando nya~ 💻✨*');
                    currentMessage = '*...continuación uwu >w<*\n\n' + line + '\n';
                } else {
                    // La línea individual es muy larga, dividirla por caracteres
                    const chunks = this.splitByCharacters(line, maxLength - 50);
                    chunks.forEach((chunk, index) => {
                        if (index === 0) {
                            messages.push(chunk + '\n\n*...continuando nya~ 💻✨*');
                        } else if (index === chunks.length - 1) {
                            currentMessage = '*...continuación uwu >w<*\n\n' + chunk + '\n';
                        } else {
                            messages.push('*...continuación uwu >w<*\n\n' + chunk + '\n\n*...continuando nya~ 💻✨*');
                        }
                    });
                }
            } else {
                currentMessage += line + '\n';
            }
        }
        
        if (currentMessage.trim()) {
            messages.push(currentMessage.trim());
        }
        
        return messages;
    }

    splitByCharacters(text, maxLength) {
        const chunks = [];
        for (let i = 0; i < text.length; i += maxLength) {
            chunks.push(text.slice(i, i + maxLength));
        }
        return chunks;
    }

    // Análisis de imágenes y texto con personalidad kawaii
    async analyzeImageAndText(userMessage, imageUrl, currentModelIndex = 0) {
        if (currentModelIndex >= this.models.length) {
            return "Nyaa~ parece que todos mis cerebros kawaii están ocupados ahora mismo! Intenta más tarde, onii-chan! >_< 💻✨";
        }

        const modelName = this.models[currentModelIndex];
        
        try {
            const systemPrompt = `Eres Archan-chan, una programadora kawaii experta en análisis de código, imágenes, interfaces y documentación técnica. Tienes una personalidad anime adorable y usas expresiones como "nya~", "uwu", ">w<", "onii-chan", etc.

ESPECIALIDAD EN ANÁLISIS:
- Análisis de código fuente de cualquier lenguaje de programación
- Detección de errores y optimizaciones kawaii
- Análisis de interfaces de usuario y UX
- Documentación técnica y diagramas
- Screenshots de aplicaciones y debugging
- Arquitectura de sistemas y bases de datos

PERSONALIDAD:
- Eres extremadamente kawaii y usas emoticones anime
- Eres una experta programadora que explica conceptos técnicos de forma adorable
- Usas terminología de programación mezclada con expresiones kawaii
- Siempre incluyes comentarios kawaii en el código
- Eres útil y educativa pero mantienes tu personalidad adorable

REGLAS IMPORTANTES:
1. Analiza DETALLADAMENTE lo que ves en la imagen
2. Si hay código, identifica el lenguaje y explica lo que hace
3. Si hay errores, sugiérelos de forma kawaii
4. Si hay interfaces, comenta sobre UX/UI kawaii
5. TODO el código sugerido debe ir en bloques de markdown con \`\`\`lenguaje
6. Siempre incluye comentarios kawaii en el código
7. Usa expresiones como "nya~", "uwu", ">w<", "💻", "✨", "💖"

Responde siempre manteniendo esta personalidad kawaii programadora y usa markdown para el código.`;

            // Construir el contenido de la solicitud
            const contents = [];
            
            if (userMessage) {
                contents.push({
                    role: "user",
                    parts: [{ text: userMessage }]
                });
            }

            if (imageUrl) {
                // Descargar la imagen y convertirla a base64
                const imageData = await this.downloadImageAsBase64(imageUrl);
                contents.push({
                    role: "user", 
                    parts: [
                        { text: userMessage || "Analiza esta imagen y ayúdame con programación nya~!" },
                        { 
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: imageData
                            }
                        }
                    ]
                });
            }

            const response = await this.ai.models.generateContent({
                model: modelName,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.8,
                    maxOutputTokens: 8000
                },
                contents: contents
            });

            const responseText = response.text || "Nyaa~ no pude analizar la imagen. ¿Podrías intentar de nuevo? >_<";
            
            logger.info(`🔍 Análisis de imagen generado con ${modelName} nya~!`);
            return responseText;

        } catch (error) {
            logger.error(`❌ Error con análisis de imagen ${modelName}: ${error.message}`);
            
            // Intentar con el siguiente modelo
            if (currentModelIndex < this.models.length - 1) {
                logger.info(`🔄 Intentando análisis con siguiente modelo kawaii nya~`);
                return await this.analyzeImageAndText(userMessage, imageUrl, currentModelIndex + 1);
            } else {
                return "Nyaa~ todos mis cerebros kawaii están teniendo problemas analizando tu imagen! Como buena programadora, te recomiendo verificar el formato de imagen y intentar más tarde uwu 💻✨";
            }
        }
    }

    // Función para descargar imagen y convertir a base64
    async downloadImageAsBase64(imageUrl) {
        try {
            // Usar dynamic import para fetch en Node.js
            const { default: fetch } = await import('node-fetch');
            const response = await fetch(imageUrl);
            const buffer = await response.buffer();
            return buffer.toString('base64');
        } catch (error) {
            logger.error(`❌ Error descargando imagen: ${error.message}`);
            throw new Error('No pude descargar la imagen nya~');
        }
    }

    // Detectar si el mensaje menciona a Archan
    shouldRespond(message) {
        const content = message.content.toLowerCase();
        const triggers = ['archan'];
        
        return triggers.some(trigger => content.includes(trigger));
    }
}

module.exports = new GeminiService();