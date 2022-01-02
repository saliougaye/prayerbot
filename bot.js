const dotenv = require('dotenv');
dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN
const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment')


const {
    getPrayers
} = require('./utils')


const bot = new TelegramBot(BOT_TOKEN, {
    polling: true
});

const initUser = {}

const DEFAULT_MESSAGE = {
    WRITE_CITY_NAME: 'Write Your City Name',
    CONFIG_COMPLETED: '✅ Okay, your configuration completed. Thanks for use Prayer Times Bot',
    KEYBOARD_TEXT: {
        TODAY: "🕒 Today Prayer Times",
        TOMORROW: "➡ Tomorrow Prayer Times",
        CHANGE_CITY: "🏠 Change City"
    },
    CITY_NOT_SETTED: "Okay I Have Take It",
    ERROR: "Error, City not setted"
}


bot.on('message', async (msg) => {
    
    const message = await commandSwitch(msg);

    console.log(msg);

    bot.sendMessage(msg.chat.id, message.text, message.options);
})


const onStartCommand = (message) => {
    

    if(initUser[message.chat.id] === undefined) {
        
        initUser[message.chat.id] = {
            chatId: message.chat.id,
            isConfigEnd: false,
            city: undefined,
            
        };
    }



    return {
        text: DEFAULT_MESSAGE.WRITE_CITY_NAME,
        options: undefined
    }
}


const handleMessage = (message) => {

    if(initUser[message.chat.id] !== undefined && initUser[message.chat.id].isConfigEnd === false) {
        initUser[message.chat.id].city = message.text;

        initUser[message.chat.id].isConfigEnd = true;

        return {
            text: DEFAULT_MESSAGE.CONFIG_COMPLETED,
            options: {
                reply_markup: {
                    keyboard: [
                        [DEFAULT_MESSAGE.KEYBOARD_TEXT.TODAY], 
                        [DEFAULT_MESSAGE.KEYBOARD_TEXT.TOMORROW], 
                        [DEFAULT_MESSAGE.KEYBOARD_TEXT.CHANGE_CITY]
                    ]
                }
            }
        }
    }
    
    return {
        text: DEFAULT_MESSAGE.CITY_NOT_SETTED
    }

}

const handlePrayerTime = async (message, today) => {

    const user = initUser[message.chat.id];

    if(user !== undefined && user.city) {
        const prayerData = await getPrayers(user.city);

        let times = '';



        const day = today ? `📅 Today ${prayerData.date}` : `➡ Tomorrow ${moment(prayerData.date, 'ddd, DD MMM YYYY').add(1, 'days').format('ddd, DD MMM YYYY')}`
        const prayerTimes = today ? prayerData.today : prayerData.tomorrow;

        for(const prop in prayerTimes) {
            times += `${prop} ${prayerTimes[prop]}\n`;
        }

        return {
            text: `
            ${day}\n🏠 City ${prayerData.city}\n${times}
            `
        }
    }


    return {
        text: DEFAULT_MESSAGE.ERROR
    }

    
}

const handleChangeCity = (message) => {

    if(initUser[message.chat.id] !== undefined) {
        
        initUser[message.chat.id] = {
            chatId: message.chat.id,
            isConfigEnd: false,
            city: undefined,
            
        };
    }



    return {
        text: DEFAULT_MESSAGE.WRITE_CITY_NAME
    }

}



const commandSwitch = async (message) => {
    let data;
    switch(message.text) {
        case "/start":
            data = onStartCommand(message);
            break;
        case DEFAULT_MESSAGE.KEYBOARD_TEXT.TODAY:
            data = await handlePrayerTime(message, true)
            break;
        case DEFAULT_MESSAGE.KEYBOARD_TEXT.TOMORROW:
            data = await handlePrayerTime(message, false)
            break;
        case DEFAULT_MESSAGE.KEYBOARD_TEXT.CHANGE_CITY:
            data = handleChangeCity(message);
            break;
        default:
            data = handleMessage(message);
            break;
            
    }

    return data;

}
