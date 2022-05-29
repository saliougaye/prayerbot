import Redis from "ioredis"
import config from "../config"


const redisHelper = () => {

    const redis = new Redis(config.redisUrl, {
        maxRetriesPerRequest: null,
    })

    const getConnection = () => {
        return redis;
    }

    const get = async (key: string) => {
        const value = await redis.get(key);

        return value;
    }

    const set = async (key: string, value: string) => {

        const result = await redis.set(key, value);

        return result;
    }

    return {
        getConnection,
        get,
        set
    }
}


export default redisHelper();