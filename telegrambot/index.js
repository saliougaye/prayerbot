const { Telegraf, Markup } = require('telegraf');
const NodeGeocoder = require('node-geocoder');

const { botToken } = require('./helper/config-helper');

const bot = new Telegraf(botToken);
const geocoder = NodeGeocoder({
    provider: 'teleport'
});

const service = require('./handle');



bot.start(async (ctx) => {

    // FIXME give a better message when start

    
    const userExist = await service.userExist(ctx.update.message.from.id);

    if(userExist) {
        // FIXME return prayers
        
        return ctx.reply('Welcome my friend');
    }

    return ctx.reply(
        'Give me the location',
        Markup.keyboard([
            Markup.button.locationRequest('📍 Give me the location')
        ]).resize()
    )
})




bot.on('callback_query', async (ctx) => {
    console.log(ctx);

    const data = ctx.callbackQuery.data;

    if(data.includes('init_city')) {
        const userId = ctx.callbackQuery.from.id;

        const result = await service.insertUser(userId, data.replace('set_city=', ''))

        await ctx.answerCbQuery('Thank you for the position 🙏🏿');

        return result ? ctx.reply('Welcome my friend') : ctx.reply('Error');

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
                    Markup.button.callback(`${el.city} - ${el.country}`, `init_city=${el.city}`) // FIXME constant value set_city 
                ))
            ]
        )
        .resize()
        .oneTime()
    );
});

bot.command('today', async (ctx) => {

})





bot.launch();