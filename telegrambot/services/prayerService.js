const redis = require('../helper/redis-helper');
const axios = require('axios');
const { api } = require('../helper/config-helper');
const labels = require('../constant/strings');
const logger = require('./logger');
const moment = require('moment');

const handler = () => {

    const prayerKey = 'CACHE_PRAYER';

    
    const userExist = async (userId) => {
        try {
            
            const exist = await redis.keyExist(userId);

            return exist;

        } catch (error) {
            logger.error('Failed to check if the user exist', error, {
                userId: userId
            });

            return false;

        }
    }

    const setUserLocation = async (userId, city) => {

        try {

            const inserted = await redis.set(userId, city);

            return inserted;

        } catch (error) {
            
            logger.error('Failed to set user location', error, {
                userId: userId,
                city: city
            });

            return false;

        }
    }

    const getUserLocation = async (userId) => {

        try {

            const city = await redis.get(userId);

            return city;

        } catch(error) {

            logger.error('Failed to get user location', error, {
                userId: userId
            });

            return undefined;
        }
    }

    

    const getPrayers = async (city, tomorrow = false) => {

        try {

            const cachedPrayers = await getCachePrayers();

            let data;

            if(cachedPrayers[city]) {
                data = cachedPrayers[city];
            } else {
                const res = await axios.get(`${api}/${city}`);

                data = res.data;

                cachedPrayers[city] = data;

                await cachePrayers(cachedPrayers);
            }

            
            const prayerText = stringifyPrayer(
                tomorrow 
                ? 
                moment(data.date, 'ddd,DD MMM YYYY').add(1, 'days').format('ddd,DD MMM YYYY') 
                : 
                data.date, 
                city, 
                tomorrow ? data.tomorrow : data.today
            );

            return prayerText;

        } catch (error) {
            
            logger.error('Failed to get prayers', error, {
                city: city
            });

            return labels.generalError;
        }
    }

    const cachePrayers = async (data) => {
        await redis.set(prayerKey, JSON.stringify(data))
    }

    const getCachePrayers = async () => {

        const cache = await redis.get(prayerKey);

        if(!cache) {
            await redis.set(prayerKey, JSON.stringify({}))
            return {};
        }


        const prayers = JSON.parse(cache);

        return prayers;

    }

    

    const stringifyPrayer = (date, city, prayerTimes) => {
        const day = `📅 ${date}`;

        let times = '';

        for(const prop in prayerTimes) {
            times += `${prop} ${prayerTimes[prop]}\n`;
        }

        const text = `${day}
🏠 ${city}
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