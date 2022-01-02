const dotenv = require('dotenv');
dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN
const TelegramBot = require('node-telegram-bot-api');

const {
    getPrayers
} = require('./utils')


const bot = new TelegramBot(BOT_TOKEN, {
    polling: true
});

const initUser = {}


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
        text: "Write Your City Name",
        options: undefined
    }
}


const handleMessage = (message) => {

    console.log(initUser[message.chat.id]);
    if(initUser[message.chat.id] !== undefined && initUser[message.chat.id].isConfigEnd === false) {
        initUser[message.chat.id].city = message.text;

        initUser[message.chat.id].isConfigEnd = true;

        return {
            text: "Okay Your Configuration is Completed",
            options: {
                reply_markup: {
                    keyboard: [
                        ["🕒 Prayer Times", "🏠 Change City"]
                    ]
                }
            }
        }
    }
    
    return {
        text: "Okay I Have Take It",
        options: undefined
    }

}

const handlePrayerTime = async (message) => {

    const user = initUser[message.chat.id];

    if(user !== undefined && user.city) {
        const prayerData = await getPrayers(user.city);

        let times = '';

        const todayPrayerTimes = prayerData.today;

        for(const prop in todayPrayerTimes) {
            times += `${prop} ${todayPrayerTimes[prop]}\n`;
        }

        return {
            text: `
                📅 Today ${prayerData.date}\n🏠 City ${prayerData.city}\n${times}
            `
        }
    }


    return {
        text: "Error, City not setted"
    }

    
}

const commandSwitch = async (message) => {
    let data;
    switch(message.text) {
        case "/start":
            data = onStartCommand(message);
            return data;
        
        case "🕒 Prayer Times":
            data = await handlePrayerTime(message)
            return data;
        default:
            data = handleMessage(message);
            return data;

            
    }

}
