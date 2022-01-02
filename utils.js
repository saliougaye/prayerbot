const axios = require('axios');

const getPrayers = async (city) => {

    const res = await axios.get(`${process.env.PRAYERAPI_ENDPOINT}/${city}`);

    const data = res.data;


    return data;
}

module.exports = {
    getPrayers
}