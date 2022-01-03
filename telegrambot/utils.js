const axios = require('axios');
const {
    DATE_FORMAT
} = require('./constant/index');
const moment = require('moment');

const getPrayers = async (city) => {

    const res = await axios.get(`${process.env.PRAYERAPI_ENDPOINT}/${city}`);

    const data = res.data;


    return data;
}


const prayerDataToString = (data, today) => {

    const tomorrowDate = moment(data.date, DATE_FORMAT).add(1, 'days').format(DATE_FORMAT);

    const day = today ? `📅 ${data.date}` : `➡ ${tomorrowDate}`;

    const prayerTimes = today ? data.today : data.tomorrow;

    let times = '';

    for(const prop in prayerTimes) {
        times += `${prop} ${prayerTimes[prop]}\n`;
    }

    const text = `${day}\n🏠 ${data.city}\n${times}`;

    return text;
}

module.exports = {
    getPrayers,
    prayerDataToString
}