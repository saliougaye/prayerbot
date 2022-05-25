require('dotenv').config();


const requiredKey = [
    "REDIS",
    "BOT_TOKEN"
];


requiredKey.forEach(el => {
    if(!process.env[el]) {
        throw new Error(`Missing required key ${el}`)
    }
})


module.exports = {
    redis: process.env.REDIS,
    botToken: process.env.BOT_TOKEN
}