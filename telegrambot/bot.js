const dotenv = require('dotenv');
dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN

const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment')
const DB = require('./data')();

const {
    DEFAULT_MESSAGE,
    DATE_FORMAT,
    KEYBOARD,
    COMMANDS
} = require('./constant/index');


const {
    getPrayers,
    prayerDataToString
} = require('./utils');



const onStartCommand = async (message) => {
    
    let user = await DB.getUser(message.chat.id);

    if(user === undefined) {
        
        user = {
            chatId: message.chat.id,
            isConfigEnd: false,
            city: undefined,
            
        }
        
        await DB.addUser(user);

        return {
            text: DEFAULT_MESSAGE.WRITE_CITY_NAME
        }
    }

    const data = await handlePrayerTime(message, true);

    return data;


    
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
                reply_markup: KEYBOARD
            }
        }
    }
    
    return {
        text: DEFAULT_MESSAGE.ERROR,
        options: {
            reply_markup: KEYBOARD
        }
    }

}

const handlePrayerTime = async (message, today) => {
    const user = await DB.getUser(message.chat.id);

    if(user !== undefined && user.city) {

        const now = moment().format(DATE_FORMAT);

        let prayerData = await DB.getPrayers(now, user.city)
        
        if(!prayerData) {
            prayerData = await getPrayers(user.city);

            const date = moment(prayerData.date, DATE_FORMAT).format(DATE_FORMAT);
            
            await DB.addPrayerTimes(date, user.city, {
                today: prayerData.today,
                tomorrow: prayerData.tomorrow
            });
        }
        
        const text = prayerDataToString(prayerData, today);


        return {
            text: text,
            options: {
                reply_markup: KEYBOARD
            }
        }
    }


    return {
        text: DEFAULT_MESSAGE.ERROR,
        options: {
            reply_markup: KEYBOARD
        }
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

        await DB.editUser(user)


    }



    return {
        text: DEFAULT_MESSAGE.WRITE_CITY_NAME
    }

}



const commandSwitch = async (message) => {
    let data;
    switch(message.text) {
        case COMMANDS.START:
            data = await onStartCommand(message);
            break;
        case DEFAULT_MESSAGE.KEYBOARD_TEXT.TODAY:
        case COMMANDS.TODAY_PRAYERS:
            data = await handlePrayerTime(message, true)
            break;
        case DEFAULT_MESSAGE.KEYBOARD_TEXT.TOMORROW:
        case COMMANDS.TOMORROW_PRAYERS:
            data = await handlePrayerTime(message, false)
            break;
        case DEFAULT_MESSAGE.KEYBOARD_TEXT.CHANGE_CITY:
        case COMMANDS.CHANGE_CITY:
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

    // process.on('SIGINT', async () => {
    //     await DB.closeClient();
    // })

    // process.on('SIGTERM', async () => {
    //     await DB.closeClient();
    // })

    // process.on('SIGKILL', async () => {
    //     await DB.closeClient();
    // })
    
    
})();