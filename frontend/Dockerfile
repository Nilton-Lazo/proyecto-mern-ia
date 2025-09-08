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

# Copiar todo el frontend
COPY . .

# Exponer el puerto donde corre Vite
EXPOSE 5173

# Comando para desarrollo
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"]
