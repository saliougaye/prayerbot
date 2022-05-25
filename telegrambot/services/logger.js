const winston = require('winston');
require('winston-daily-rotate-file');
const { isProd } = require('../helper/config-helper')

const Logger = () => {

    const transports = [ new winston.transports.Console() ];

    
    if(isProd) {

        var transport = new winston.transports.DailyRotateFile({
            filename: `prayerbot-%DATE%.log`,
            dirname: 'log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        });


        transports.push(transport)
    }

    const logger = winston.createLogger({
        level: isProd ? 'info' : 'debug',
        transports: transports
    });

    const info = (message, ...args) => {
        logger.info(message, {
            args: args
        });
    }

    const error = (message, error, ...args) => {
        logger.error(message, {
            error: {
                name: error.name,
                message: error.message,
                stacktrace: error.stack
            },
            args: args
        });

    }

    const warn = (message, error) => {

        logger.warn(message, {
            error: error
        });
    }


    const debug = (message, ...args) => {

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


module.exports = Logger();