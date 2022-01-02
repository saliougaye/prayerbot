const dotenv = require('dotenv');
dotenv.config();

const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment')


const DB = require('./data')();

const BOT_TOKEN = process.env.BOT_TOKEN


const {
    getPrayers
} = require('./utils');


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







const onStartCommand = async (message) => {
    
    let user = await DB.getUser(message.chat.id);

    if(user === undefined) {
        
        user = {
            chatId: message.chat.id,
            isConfigEnd: false,
            city: undefined,
            
        }
        
        await DB.addUser(user);
    }



    return {
        text: DEFAULT_MESSAGE.WRITE_CITY_NAME
    }
}


const handleMessage = async (message) => {

    const user = await DB.getUser(message.chat.id);

    if(user !== undefined && user.isConfigEnd === false) {
        user.city = message.text;

        user.isConfigEnd = true;

        await DB.editUser(user);

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
    const user = await DB.getUser(message.chat.id);

    if(user !== undefined && user.city) {


        
        const prayerData = await getPrayers(user.city);

        let times = '';



        const day = today ? `📅 Today ${prayerData.date}` : `➡ Tomorrow ${moment(prayerData.date, 'ddd,DD MMM YYYY').add(1, 'days').format('ddd, DD MMM YYYY')}`
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

const handleChangeCity = async (message) => {

    let user = await DB.getUser(message.chat.id);

    if(user !== undefined) {

        
        user = {
            chatId: message.chat.id,
            isConfigEnd: false,
            city: undefined
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
            data = await onStartCommand(message);
            break;
        case DEFAULT_MESSAGE.KEYBOARD_TEXT.TODAY:
            data = await handlePrayerTime(message, true)
            break;
        case DEFAULT_MESSAGE.KEYBOARD_TEXT.TOMORROW:
            data = await handlePrayerTime(message, false)
            break;
        case DEFAULT_MESSAGE.KEYBOARD_TEXT.CHANGE_CITY:
            data = await handleChangeCity(message);
            break;
        default:
            data = await handleMessage(message);
            break;
            
    }

    return data;

}






(async () => {
    await DB.initDb();

    const bot = new TelegramBot(BOT_TOKEN, {
        polling: true
    });

    bot.on('message', async (msg) => {
    
        const message = await commandSwitch(msg);
    
        bot.sendMessage(msg.chat.id, message.text, message.options);
    })

    process.on('SIGINT', async () => {
        await DB.closeClient();
    })

    process.on('SIGTERM', async () => {
        await DB.closeClient();
    })

    process.on('SIGKILL', async () => {
        await DB.closeClient();
    })
    
    
})();