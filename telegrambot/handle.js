const redis = require('./helper/redis-helper');
const axios = require('axios');
const { api } = require('./helper/config-helper');
const labels = require('./constant/strings');

// FIXME add logger

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


    // FIXME cache prayers
    const getPrayers = async (city) => {

        try {
            const res = await axios.get(`${api}/${city}`);

            
            const prayerText = stringifyPrayer(res.data);

            return prayerText;

        } catch (error) {
            
            console.log(error);

            return labels.generalError;
        }
    }

    const stringifyPrayer = (data) => {
        const day = `📅 ${data.date}`;

        const prayerTimes = data.today;

        let times = '';

        for(const prop in prayerTimes) {
            times += `${prop} ${prayerTimes[prop]}\n`;
        }

        const text = `${day}
🏠 ${data.city}
${times}
        `;

        return text;
    }

    return {
        userExist,
        setUserLocation,
        getUserLocation,
        getPrayers,
    }
}

module.exports = handler();