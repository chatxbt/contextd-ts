import { createLogger, format, transports } from 'winston';

// Configure logging
function configureLogging() {
    const logger = createLogger({
        level: 'debug',
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ timestamp, level, message }) => {
                return `${timestamp} - ${level.toUpperCase()} - ${message}`;
            })
        ),
        transports: [
            new transports.Console(),
        ],
    });

    return logger;
}

// Usage
const logger = configureLogging();
export { logger };
