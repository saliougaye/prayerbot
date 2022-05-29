const { Telegraf, Markup } = require('telegraf');
const NodeGeocoder = require('node-geocoder');
const { botToken } = require('./helper/config-helper');
const prayerService = require('./services/prayerService');
const labels = require('./constant/strings');
const callbackEvents = require('./constant/callback_events');


const bot = new Telegraf(botToken);
const geocoder = NodeGeocoder({
    provider: 'teleport'
});

bot.start(async (ctx) => {

    const userId = ctx.update.message.from.id;
    const userExist = await prayerService.userExist(userId);

    if(userExist) {

        const location = await prayerService.getUserLocation(userId);

        if(!location) {
            return ctx.reply(labels.generalError);
        }

        const message = await prayerService.getPrayers(location)
        
        return ctx.reply(message);
    }

    return ctx.reply(
        labels.locationText,
        getLocationKeyboard()
    );
});

bot.on('location', async (ctx) => {

    const userId = ctx.message.from.id;

    const { latitude, longitude } = ctx.message.location;

    const res = await geocoder.reverse({ 
        lat: latitude, 
        lon: longitude 
    });

    const city = res[0].city;

    const result = await prayerService.setUserLocation(
        userId, 
        {
            latitude,
            longitude
        },
        city
    );

    return result ? 
        ctx.reply(labels.userLocationText(city)) 
        : ctx.reply(labels.generalError);
});

bot.command('today', async (ctx) => {
    const userId = ctx.update.message.from.id;
    
    const message = await getPrayer(userId);

    return ctx.reply(message);
    
});


bot.command('location', async (ctx) => {

    // FIXME location keyboard remove after clicked
    return ctx.reply(
        labels.locationText,
        getLocationKeyboard()
    );
});

bot.command('tomorrow', async (ctx) => {
    const userId = ctx.update.message.from.id;
    
    const message = await getPrayer(userId, true);
    return ctx.reply(message);

});

const getPrayer = async (userId, tomorrow = false) => {

    const userExist = await prayerService.userExist(userId);

    if(!userExist) {
        return labels.initializeFirstText;
    }

    const location = await prayerService.getUserLocation(userId);

    if(!location) {
        return labels.generalError;
    }

    const message = await prayerService.getPrayers(location, tomorrow);

    return message;

}

const getLocationKeyboard = () => {
    return Markup.keyboard([
        Markup.button.locationRequest(labels.locationButtonText)
    ])
    .resize()
    .oneTime();
}



module.exports = bot;