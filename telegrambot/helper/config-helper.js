require('dotenv').config();


const requiredKey = [
    "REDIS",
    "BOT_TOKEN",
    "API",
];


requiredKey.forEach(el => {
    if(!process.env[el]) {
        throw new Error(`Missing required key ${el}`)
    }
})


module.exports = {
    redis: process.env.REDIS,
    botToken: process.env.BOT_TOKEN,
    api: process.env.API,
    isProd: process.env.NODE_ENV === 'PROD' ? true : false
}