const Redis = require('ioredis');
const config = require('./config-helper');


const redisHelper = () => {

    // FIXME add max retries
    // FIXME connection error exit program

    const redis = new Redis(config.redis);

    const get = async (key) => {
        const value = await redis.get(key);

        return value;
    }

    const set = async (key, value) => {
        const res = await redis.set(key, value);

        return res === 'OK';
    }

    const keyExist = async (key) => {
        const exists = await redis.exists(key);

        return exists === 1;
    }


    return {
        get,
        set,
        keyExist
    }
}


module.exports = redisHelper()