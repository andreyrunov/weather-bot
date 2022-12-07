const { Telegraf } = require('telegraf')
const axios = require('axios')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) =>
	ctx.reply(
		'Добро пожаловать! Чтобы узнать прогноз погоды в Вашем регионе - пришлите свою геолокацию'
	)
)
// bot.help((ctx) => ctx.reply('Send me a sticker'))
// bot.on('sticker', (ctx) => ctx.reply('👍'))
// bot.hears('hi', (ctx) => ctx.reply('Hey there'))

// обработчик, который принимает от пользователя сообщение и выводит его в консоль
bot.on('message', async (ctx) => {
	if (ctx.message.location) {
		console.log(ctx.message)
		const url = `https://api.weather.yandex.ru/v2/informers?lat=${ctx.message.location.latitude}&lon=${ctx.message.location.longitude}`

		try {
			const response = await axios({
				method: 'get',
				url: url,
				headers: {
					'Content-Type': 'application/json',
					'X-Yandex-API-Key': 'c1fec854-4a72-446f-8d2a-a9776ed55a81',
					// 'Content-Type': 'application/x-www-form-urlencoded',
				},
			})
			console.log(
				response.data,
				'=============================================================='
			)
			// console.log(response.data.forecast.parts)
		} catch (err) {
			console.error(err)
		}
	}
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
