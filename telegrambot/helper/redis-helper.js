const Redis = require('ioredis');
const config = require('./config-helper');


const redisHelper = () => {

    const redis = new Redis(config.redis, {
        maxRetriesPerRequest: 10,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        }
    });

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