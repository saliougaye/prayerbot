const { Telegraf, Markup } = require('telegraf');
const NodeGeocoder = require('node-geocoder');

const { botToken } = require('./helper/config-helper');

const bot = new Telegraf(botToken);
const geocoder = NodeGeocoder({
    provider: 'teleport'
});

const service = require('./handle');
const { prayerDataToString } = require('./utils');



bot.start(async (ctx) => {

    // FIXME give a better message when start

    const userId = ctx.update.message.from.id;
    const userExist = await service.userExist(userId);

    if(userExist) {

        const message = await getPrayerMessage(userId)
        
        return ctx.reply(message);
    }

    return ctx.reply(
        'Give me the location',
        Markup.keyboard([
            Markup.button.locationRequest('📍 Give me the location')
        ])
        .resize()
        .oneTime()
    );
})




bot.on('callback_query', async (ctx) => {

    const data = ctx.callbackQuery.data;

    if(data.includes('set_city')) {
        const userId = ctx.callbackQuery.from.id;

        const city = data.replace('set_city=', '');

        const result = await service.setUserLocation(userId, city);

        await ctx.answerCbQuery('Thank you for the position 🙏🏿');

        return result ? ctx.reply(`📍 Your Location is ${city}`) : ctx.reply('Error'); // FIXME messages

    }
    
    return ctx.answerCbQuery('Callback');
})




bot.on('location', async (ctx) => {
    console.log(ctx.message.location);

    const res = await geocoder.reverse({ lat: ctx.message.location.latitude, lon: ctx.message.location.longitude });

    const mapped = res.map(el => ({ city: el.city, country: el.country }));



    return ctx.reply(
        'Which one of this?',
        Markup.inlineKeyboard(
            [
                mapped.map(el => (
                    Markup.button.callback(`${el.city} - ${el.country}`, `set_city=${el.city}`) // FIXME constant value set_city 
                ))
            ]
        )
        .resize()
        .oneTime()
    );
});

bot.command('today', async (ctx) => {
    const userId = ctx.update.message.from.id;
    const userExist = await service.userExist(userId);

    if(!userExist) {
        return ctx.reply('Please, type /start') // FIXME message
    }

    const message = await getPrayerMessage(userId);

    return ctx.reply(message);
    
});


bot.command('location', async (ctx) => {

    // FIXME locatin keyboard remove after clicked
    return ctx.reply(
        'Give me the location',
        Markup.keyboard([
            Markup.button.locationRequest('📍 Give me the location')
        ])
        .resize()
        .oneTime()
    );
})


const getPrayerMessage = async (userId) => {

    const city = await service.getUserLocation(userId);

    const prayers = await service.getPrayers(city);


    if(!prayers) {
        return 'Sorry im having errors';
    }

    const message = prayerDataToString(prayers, true);

    return message;
}



bot.launch();