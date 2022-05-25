const { isProd, webhookUrl, port } = require('./helper/config-helper');
const fastify = require('fastify');
const bot = require('./bot');

(async () => {
    if (isProd) {

        if (!webhookUrl) throw Error('❌ In production mode WEBHOOK_URL is required');

        const app = fastify();

        const secret_path = `/telegraf/${bot.secretPathComponent()}`;

        app.post(secret_path, (req, reply) => bot.handleUpdate(req.body, reply.raw));

        await bot.telegram.setWebhook(webhookUrl + secret_path);

        console.log('Webhook is set on', webhookUrl);

        app.listen(port, '0.0.0.0', () => {
            console.log('Listening on port', port)
        });

    } else {
        bot.launch();
    }
})();

