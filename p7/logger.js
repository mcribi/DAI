//logger.js
import winston from 'winston';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// Define el formato de los logs
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// Crea el logger
const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        colorize(),
        logFormat
    ),
    transports: [
        new transports.Console(), // Mostrar logs en la consola
        new transports.File({ filename: 'application.log' }) // Guardar logs en un archivo
    ],
});

export default logger;

