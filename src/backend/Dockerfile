# Imagen base
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependencias
RUN pnpm install

# Copiar todo el backend
COPY . .

# Exponer el puerto donde corre Express
EXPOSE 3000

# Comando para desarrollo con nodemon
CMD ["pnpm", "run", "dev"]
