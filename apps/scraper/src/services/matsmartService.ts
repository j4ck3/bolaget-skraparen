import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { executablePath } from 'puppeteer'

puppeteer.use(StealthPlugin())

interface Product {
	name: string
	brandAndQuantity: string
	price: string
	imageUrl: string
}

interface ProductResult {
	products?: Product[]
	message?: string
}

const getProductsFromSearch = async (url: string, productName?: string): Promise<ProductResult | undefined> => {
	const browser = await puppeteer.launch({
		headless: false,
		executablePath: executablePath(),
	})
	const page = await browser.newPage()

	await page.goto(url, {
		waitUntil: 'domcontentloaded',
	})

	try {
		await new Promise(resolve => setTimeout(resolve, 3000))
	} catch (e) {
		console.error('waitForSelector product-list or product-item: not found')
		await browser.close()
		return undefined
	}
	// get the price and stocks of all the stores
	try {
		const result = await page.evaluate(() => {
			const productItems = Array.from(
				document.querySelectorAll('.product-item')
			)

			const processData = (productItem: Element) => {
				const priceElement = productItem.querySelector(
					'.product-item-price p'
				)
				const priceText = priceElement
					? priceElement.textContent?.trim() || 'Price not found'
					: 'Price not found'

				const nameElement = productItem.querySelector('.label')
				const productName = nameElement
					? nameElement.textContent?.trim() || 'Name not found'
					: 'Name not found'

				const brandAndQuantityElement =
					productItem.querySelector('.brand-and-weight')
				const brandAndQuantity = brandAndQuantityElement
					? brandAndQuantityElement.textContent?.trim() || 'Brand and weight not found'
					: 'Brand and weight not found'

				const imageElement = productItem.querySelector(
					'.product-grid-item-image-col img:nth-child(2)'
				)
				const imageUrl = imageElement
					? imageElement.getAttribute('src') || 'Image URL not found'
					: 'Image URL not found'

				return {
					name: productName,
					brandAndQuantity: brandAndQuantity,
					price: priceText,
					imageUrl: imageUrl,
				}
			}
			const data = productItems.map(processData)

			return {
				products: data,
			}
		})

		if (result) {
			return result
		} else {
			console.error('result is null')
			return { message: 'result is null' }
		}
	} catch (e: any) {
		console.error(e.message, 'could not get store data')
		return undefined
	} finally {
		await browser.close()
	}
}

export default getProductsFromSearch

