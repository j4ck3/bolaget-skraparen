import { Elysia } from 'elysia'
import schedule from 'node-schedule'
import getTriggiz from './services/triggizService'
import TelegramBot from 'node-telegram-bot-api'

// Import routes
import { bolagetRoutes } from './controllers/bolagetController'
// import { mainRoutes } from './controllers/mainController' // Commented out - missing service file
// import { mRoutes } from './controllers/mController'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHANNELID = process.env.TELEGRAM_CHANNELID

const sendTelegramNotification = async (message: string) => {
	try {
		const bot = new TelegramBot(BOT_TOKEN!)
		await bot.sendMessage(CHANNELID!, message, { parse_mode: 'HTML' })
	} catch (error) {
		console.error('Error sending message:', error)
	}
}

async function checkTriggizStatus() {
	try {
		const result = await getTriggiz()

		const triggizNumber = result.triggiz.replace(/\D/g, '')

		const notifyPattern = /^(?:[1-9]\d*)000$/
		const triggizValueIsRewardThreshold = notifyPattern.test(triggizNumber)
		console.log(triggizNumber + triggizValueIsRewardThreshold)
		if (!triggizValueIsRewardThreshold) return

		const message = `✅ ${result.triggiz}
🚀 ${result.milestone}
📌 ${triggizValueIsRewardThreshold}`

		await sendTelegramNotification(message)
	} catch (error) {
		console.error('Error in checkTriggizStatus:', error)
	}
}

const executeJob = async () => {
	try {
		await checkTriggizStatus()
	} catch (err) {
		console.error('Failed to execute job:', err)
	}
}

// Run on startup in production
;(async () => {
	try {
		if (process.env.NODE_ENV === 'production') {
			console.log('Running in production mode')
			await checkTriggizStatus()
		}
	} catch (error) {
		console.error('Error executing job:', error)
	}
})()

// Schedule the job to run every day at 12:00
schedule.scheduleJob('0 12 * * *', async () => {
	await executeJob()
})

const PORT = process.env.PORT || 5000

const app = new Elysia()
	.use(bolagetRoutes)
	// .use(mainRoutes) // Commented out - missing service file
	// .use(mRoutes)
	.get('/', () => 'Stock Scraper API')
	.listen(PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

