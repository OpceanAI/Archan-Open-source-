# Imagen base con Node 20
FROM node:20-alpine

# Instalar dependencias de compilación necesarias para canvas
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  cairo-dev \
  pango-dev \
  jpeg-dev \
  giflib-dev \
  pixman-dev \
  pangomm-dev \
  bash

# Definir directorio de trabajo
WORKDIR /app

# Copiar package.json primero (para aprovechar caché)
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código
COPY . .

ENV NODE_ENV=production

# Exponer puerto (si lo usas en HTTP)
EXPOSE 3000

# Comando por defecto
CMD ["npm", "start"]
