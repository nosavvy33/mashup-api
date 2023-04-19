const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level.toUpperCase()}: ${message}`;
});

// Custom format for file output
const fileFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// Create logger with different transports
const logger = createLogger({
    format: combine(
        timestamp(),
    ),
    transports: [
        // Console transport (information level)
        new transports.Console({
            format: combine(
                format.colorize(),
                consoleFormat
            ),
            level: 'info',
        }),

        // File transport (debug level)
        new transports.File({
            filename: 'logs.txt',
            format: fileFormat,
            level: 'debug',
        }),
    ],
});

module.exports = logger;
