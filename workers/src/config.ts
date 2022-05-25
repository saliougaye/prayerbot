import dotenv from 'dotenv';

dotenv.config();

type Environment = 'DEV' | 'PROD';

interface Config {
    redisUrl: string
    environment: Environment,
    botToken: string
}

const keyRequired : string[] = [
    "REDIS_URL",
    "BOT_TOKEN"
]


keyRequired.forEach(el => {
    if(!process.env[el]) {
        throw new Error(`Missing Required env: ${el}`)
    }
});


const config : Config = {
    redisUrl: process.env.REDIS_URL!,
    botToken: process.env.BOT_TOKEN!,
    environment: process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'PROD' ? 'PROD' : 'DEV'
};

export default config;

