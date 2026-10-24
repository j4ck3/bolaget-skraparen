import { writeFile } from 'fs/promises'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { executablePath } from 'puppeteer'

puppeteer.use(StealthPlugin())

const getAllCities = async (url: string): Promise<void> => {
	console.log('running the scraping')
	const browser = await puppeteer.launch({
		headless: false,
		executablePath: executablePath(),
	})
	const page = await browser.newPage()

	// set age consent cookie
	const decodedValue = '{"state":{"verified":true},"version":0}'
	await page.setCookie({
		name: 'systembolaget.age',
		value: decodedValue,
		domain: '.systembolaget.se',
	})

	await page.goto(url, {
		waitUntil: 'domcontentloaded',
	})

	// find the show stores button and click it!
	const button = await page.$('.css-103vv0f')

	if (button) {
		await button.click()
		// Listen for the dialog event and dismiss it.
		page.on('dialog', async (dialog) => {
			await dialog.dismiss()
		})

		// Select hela sverige on the <select> element
		const selectElement = await page.$('.css-dz8wl')
		if (selectElement) {
			const valueToSelect = 'sweden'
			await page.select('select', valueToSelect)
		} else {
			console.log('Select element not found')
		}
	} else {
		console.log('Button not found')
		await browser.close()
		return
	}

	// Wait for stores then map store content
	await page.waitForSelector('.css-4od5c4')

	const cities = await page.evaluate(async () => {
		const stores = Array.from(document.querySelectorAll('.css-4od5c4'))

		const data = stores.map((item) => {
			const city =
				item
					.querySelector('.css-1tkalz1 .css-1cwtvfm')
					?.textContent?.trim() || ''

			return city
		})
		return data
	})

	await browser.close()

	const writeArrayToJsonFile = async (array: string[], filename: string) => {
		const jsonArray = JSON.stringify(array, null, 2)

		try {
			await writeFile(filename, jsonArray)
			console.log('JSON array has been written to the file:', filename)
		} catch (err) {
			console.error('Error writing to file:', err)
		}
	}

	const filename = 'output.json'
	await writeArrayToJsonFile(cities, filename)
}

export default getAllCities
