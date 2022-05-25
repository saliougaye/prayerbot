const redis = require('./helper/redis-helper');


const handler = () => {

    // FIXME fix return types

    const userExist = async (userId) => {
        try {
            
            const exist = await redis.keyExist(userId);

            return exist
        } catch (error) {
            console.log(error);

            return false;

        }
    }

    const insertUser = async (userId, city) => {

        try {

            const inserted = await redis.set(userId, city);

            return inserted;

        } catch (error) {

            console.log(error);

            return false;

        }
    }

    const getUserCity = async (userId) => {

        try {

            const city = await redis.get(userId);

            return city;

        } catch(error) {

            return undefined;
        }
    }

    return {
        userExist,
        insertUser,
        getUserCity
    }
}

module.exports = handler();