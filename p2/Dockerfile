# Utilizamos una imagen ligera de Node.js
FROM node:16-alpine   

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos necesarios al contenedor
COPY package*.json ./

# Instalamos las dependencias de la aplicación
RUN npm install

# Copiamos el resto de los archivos de la aplicación
COPY . .

# Configuramos las variables de entorno necesarias
ENV IN=production
ENV USER_DB=root
ENV PASS=example
ENV SECRET_KEY="EsTa MisMa:i8775tyjk,"
ENV DB_HOST=mongo

# Exponemos el puerto en el que funciona la aplicación
EXPOSE 8000

# Comando para iniciar la aplicación
CMD npm run tienda

