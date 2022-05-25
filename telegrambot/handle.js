const redis = require('./helper/redis-helper');
const axios = require('axios');
const config = require('./helper/config-helper')


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

    const setUserLocation = async (userId, city) => {

        try {

            const inserted = await redis.set(userId, city);

            return inserted;

        } catch (error) {

            console.log(error);

            return false;

        }
    }

    const getUserLocation = async (userId) => {

        try {

            const city = await redis.get(userId);

            return city;

        } catch(error) {

            return undefined;
        }
    }


    // FIXME cache
    const getPrayers = async (city) => {

        try {
            const res = await axios.get(`${config.api}/${city}`);

            const data = res.data;

            return data;

        } catch (error) {
            
            console.log(error);

            return undefined;
        }

    }

    return {
        userExist,
        setUserLocation,
        getUserLocation,
        getPrayers,
    }
}

module.exports = handler();