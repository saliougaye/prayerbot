require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');
const NodeGeocoder = require('node-geocoder');


const BOT_TOKEN = process.env.BOT_TOKEN;

const bot = new Telegraf(BOT_TOKEN);
const geocoder = NodeGeocoder({
    provider: 'teleport'
});




// (async () => {

    

//     const res = await geocoder.reverse({ lat: 41.836093, lon: 12.484808 });


//     console.log(res)

// })()


bot.start((ctx) => {

    // FIXME give a better message when start; if user is already in the db go next

    ctx.reply(
        'Give me the location',
        Markup.keyboard([
            Markup.button.locationRequest('📍 Give me the location')
        ]).resize()
    )
})


bot.action(/"type":"city"/, (ctx, next) => {
    console.log(ctx)
    return ctx.reply('👍').then(() => next())
})

// bot.on('text', (ctx) => {
//     console.log(ctx.)

//     ctx.reply('Hello World');
// });

bot.on('location', async (ctx) => {
    console.log(ctx.message.location);

    const res = await geocoder.reverse({ lat: ctx.message.location.latitude, lon: ctx.message.location.longitude });

    const mapped = res.map(el => ({ city: el.city, country: el.country }));

    // if(mapped.length === 1) {
    //     return ctx.reply(`Thanks for the location 🙏🏿\n📍 Your location is ${mapped[0].city}`)
    // }



    return ctx.reply(
        'Which one of this?',
        Markup.keyboard(
            mapped.map(el => ([ 
                Markup.button.callback(`${el.city} - ${el.country}`, JSON.stringify({
                    type: 'city',
                    data: el
                })) 
            ]))
        )
        .resize()
        .oneTime()
    );
});





bot.launch();