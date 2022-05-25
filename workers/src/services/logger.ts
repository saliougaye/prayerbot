import winston from 'winston';
import 'winston-daily-rotate-file';
import config from '../config';

const Logger = (application: string) => {

    const transports : winston.transport[] = [ new winston.transports.Console() ];

    if(config.environment === 'PROD') {

        var transport = new winston.transports.DailyRotateFile({
            filename: `${application}-%DATE%.log`,
            dirname: 'log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        });


        transports.push(transport)
    }

    const logger = winston.createLogger({
        level: config.environment === 'DEV' ? 'debug' : 'info',
        transports: transports
    });

    
    const info = (message: string, ...args: any[]) => {
        logger.info(message, {
            args: args
        });
    }

    const error = (message: string, error: Error, ...args: any[]) => {
        logger.error(message, {
            name: error.name,
            message: error.message,
            stacktrace: error.stack
        });

    }

    const warn = (message: string, error?: Error) => {

        logger.warn(message, {
            error: error
        });
    }


    const debug = (message: string, ...args: any[]) => {

        logger.debug(message, {
            args: args
        });
    }


    return {
        debug,
        info,
        warn,
        error
    }

}


export default Logger;