const { Telegraf } = require('telegraf')
const axios = require('axios')
const puppeteer = require('puppeteer')
require('dotenv').config()

async function getLocationName(url) {
	// const getLocationName = async (url) => {
	// открываем браузер
	const browser = await puppeteer.launch({
		headless: true,
		args: ['--use-gl=egl'],
	})

	// открываем вкладку в браузере
	const page = await browser.newPage()

	// переходим по url адресу
	await page.goto(`${url}`)

	// делаем скриншот страницы для проверки правильности отработки программы
	// await page.screenshot({ path: 'example.png' })

	// в браузере находим нужный элемент и копируем (прав.кнопка мыши) его селектор
	const locationName = await page.$eval('#main_title', (el) => el.innerText)

	// закрываем браузер
	await browser.close()

	if (locationName) {
		return locationName
	}
}

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
		// console.log(ctx.message)
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

			// const dataTime = new Date(response.data.now_dt)
			const dataTime = new Date()
			// console.log(dataTime, '<----------------------------')

			const location = await getLocationName(response.data.info.url)
			// console.log(location, '<---------------------')
			if (location) {
				ctx.reply(`Ваше местоположение: ${location}`)
				ctx.reply(`Сегодня: ${dataTime.getDate()}-${dataTime.getMonth()}-${dataTime.getFullYear()}, ${dataTime.getHours()}:${dataTime.getMinutes()}
Температура: ${response.data.fact.temp}
Ощущается как: ${response.data.fact.feels_like}
Скорость ветра: ${response.data.fact.wind_speed}
`)
			}
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
