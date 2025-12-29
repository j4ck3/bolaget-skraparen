import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())

interface Store {
	address: string
	city: string
	amount: string
	fullAddress: string
}

interface StoreResult {
	success: boolean
	price?: string
	stores?: Store[]
	error?: string
}

const getDrink = async (url: string, area?: string): Promise<StoreResult> => {
	// Validate URL before proceeding
	if (!url || typeof url !== 'string') {
		return { success: false, error: 'No URL provided' }
	}

	// Ensure URL is valid
	try {
		new URL(url)
	} catch {
		return { success: false, error: `Invalid URL: ${url}` }
	}

	// Use system Chromium in Docker, Puppeteer's bundled Chromium locally
	const chromiumPath =
		process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium'

	const browser = await puppeteer.launch({
		headless: true,
		executablePath: chromiumPath,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-accelerated-2d-canvas',
			'--no-first-run',
			'--no-zygote',
			'--single-process',
			'--disable-gpu',
		],
	})
	const page = await browser.newPage()

	// set age + cookies consent cookie
	const ageCookieValue = '{"state":{"verified":true},"version":0}'
	await page.setCookie({
		name: 'systembolaget.age',
		value: ageCookieValue,
		domain: '.systembolaget.se',
	})
	const consentCookieValue =
		'{"state":{"consentTypes":["useful","profiling","mandatory","statistical"]},"version":0}'
	await page.setCookie({
		name: 'systembolaget.consent',
		value: consentCookieValue,
		domain: '.systembolaget.se',
	})

	await page.goto(url, {
		waitUntil: 'domcontentloaded',
		timeout: 30000,
	})

	// Wait for the page to be interactive
	await page
		.waitForFunction(
			() =>
				document.readyState === 'complete' ||
				document.readyState === 'interactive',
			{ timeout: 5000 }
		)
		.catch(() => {})

	// Find and click the "Välj butik" button to open the store finder
	// The button is inside #PdpCardInStore section
	let buttonFound = false
	try {
		// Wait for the PdpCardInStore section
		await page.waitForSelector('#PdpCardInStore', { timeout: 10000 })

		// Find the "Välj butik" button - it contains the text "Välj butik"
		const button = await page.evaluateHandle(() => {
			const buttons = Array.from(
				document.querySelectorAll('#PdpCardInStore button')
			)
			return buttons.find((btn) => {
				const text = btn.textContent?.trim()
				return text === 'Välj butik' || text?.includes('Välj butik')
			})
		})

		const btnElement = button.asElement() as
			| import('puppeteer').ElementHandle<Element>
			| null
		if (btnElement) {
			await btnElement.click()
			console.log('Clicked "Välj butik" button')
			buttonFound = true
			// Wait for the store modal to fully load
			await page.waitForSelector('button.flex.w-full.flex-col', {
				timeout: 10000,
			})

			// Wait a moment for the modal to fully load
			console.log('Store modal loaded, waiting for initial render...')
			await new Promise((resolve) => setTimeout(resolve, 1000))
		}
	} catch (e: any) {
		console.error('Could not find or click "Välj butik" button:', e.message)
	}

	if (!buttonFound) {
		console.error('Could not find the store finder button')
		await browser.close()
		return {
			success: false,
			error: 'Could not find the "Välj butik" button on the page.',
		}
	}

	// Wait for the search field or store list to appear
	try {
		// Wait for either the search field or store buttons to appear
		await Promise.race([
			page.waitForSelector('#search', { timeout: 5000 }).catch(() => null),
			page
				.waitForSelector('button[class*="flex w-full flex-col"]', {
					timeout: 5000,
				})
				.catch(() => null),
		])

		// If area is provided and search field exists, filter stores first
		if (area) {
			const searchField = await page.$('#search')
			if (searchField) {
				console.log(`Filtering stores by area: ${area}`)
				await searchField.click()
				await searchField.type(area, { delay: 50 })
				// Wait for filtered results to appear
				await new Promise((resolve) => setTimeout(resolve, 1000))

				// Wait for stock counts to load on filtered stores
				// Scroll through the filtered list to trigger lazy loading
				console.log(
					'Scrolling through filtered stores to load all stock counts...'
				)
				const scrollContainer = await page.$('div.overflow-y-auto')
				if (scrollContainer) {
					// Scroll down slowly to trigger lazy loading
					for (let scrollPos = 0; scrollPos <= 1000; scrollPos += 200) {
						await page.evaluate((pos) => {
							const el = document.querySelector('div.overflow-y-auto')
							if (el) el.scrollTop = pos
						}, scrollPos)
						await new Promise((resolve) => setTimeout(resolve, 400))
					}
					// Scroll back to top
					await page.evaluate(() => {
						const el = document.querySelector('div.overflow-y-auto')
						if (el) el.scrollTop = 0
					})
					await new Promise((resolve) => setTimeout(resolve, 500))
				}

				// Now wait for all stock counts to stabilize
				console.log('Waiting for stock counts to stabilize...')
				let lastWithStock = 0
				let stableCount = 0
				for (let i = 0; i < 12; i++) {
					await new Promise((resolve) => setTimeout(resolve, 400))
					const stockStatus = await page.evaluate(() => {
						const btns = document.querySelectorAll(
							'button.flex.w-full.flex-col'
						)
						let total = 0
						let withStock = 0
						btns.forEach((btn) => {
							const rect = btn.getBoundingClientRect()
							// Only count visible buttons (in the modal)
							if (rect.height > 0 && rect.width > 0) {
								total++
								if (btn.textContent?.match(/\d+\s*st/i)) {
									withStock++
								}
							}
						})
						return { total, withStock }
					})
					console.log(
						`Stock check ${i + 1}: ${stockStatus.withStock}/${
							stockStatus.total
						} stores have stock`
					)

					if (
						stockStatus.withStock === lastWithStock &&
						stockStatus.total > 0
					) {
						stableCount++
						if (stableCount >= 2) {
							console.log('Stock counts stable')
							break
						}
					} else {
						stableCount = 0
					}
					lastWithStock = stockStatus.withStock
				}
			}
		}
	} catch (e: any) {
		console.error('Store list did not appear:', e.message)
		await browser.close()
		return {
			success: false,
			error: 'Store list did not appear after clicking the button.',
		}
	}

	// Get the price from the product page
	let price = ''
	try {
		price = await page.evaluate(() => {
			// Look for price - it's usually near the product number
			const priceElement = document
				.querySelector('[class*="sans"]')
				?.textContent?.match(/\d+[.,]\d+/)?.[0]
			// Or look for elements containing "kr" or price patterns
			const allText = document.body.textContent
			const priceMatch = allText?.match(/(\d+[.,]\d+)\s*kr/)
			return priceMatch ? priceMatch[1] : ''
		})
	} catch (e: any) {
		console.error('Could not extract price:', e.message)
	}

	// Build up stock counts by scrolling through the list
	// Stock counts are lazy-loaded when items become visible
	const stockMap: Map<string, string> = new Map()
	try {
		// Get scroll container info
		const scrollInfo = await page.evaluate(() => {
			const el = document.querySelector('div.overflow-y-auto')
			if (!el) return { height: 3000, containerTop: 0 }
			const rect = el.getBoundingClientRect()
			return {
				height: el.scrollHeight,
				containerTop: rect.top,
				containerHeight: rect.height,
			}
		})
		console.log(`Scroll container height: ${scrollInfo.height}`)

		// Scroll through the list - balance between coverage and speed
		const scrollStep = 600 // Medium steps
		const maxScroll = Math.min(scrollInfo.height, 8000) // Limit to reasonable amount

		for (let pos = 0; pos <= maxScroll; pos += scrollStep) {
			// Scroll to position
			await page.evaluate((scrollPos) => {
				const el = document.querySelector('div.overflow-y-auto')
				if (el) el.scrollTop = scrollPos
			}, pos)

			// Wait for lazy-loaded content - check the scroll container's visible area
			await new Promise((resolve) => setTimeout(resolve, 150))

			// Wait until visible items in viewport have stock counts
			let lastVisibleWithStock = 0
			let stableCount = 0
			for (let check = 0; check < 8; check++) {
				const visibleStatus = await page.evaluate(() => {
					const container = document.querySelector('div.overflow-y-auto')
					if (!container) return { visible: 0, withStock: 0 }

					const containerRect = container.getBoundingClientRect()
					const btns = container.querySelectorAll(
						'button.flex.w-full.flex-col'
					)

					let visible = 0
					let withStock = 0

					btns.forEach((btn) => {
						const rect = btn.getBoundingClientRect()
						// Check if button is visible within the scroll container
						if (
							rect.top >= containerRect.top - 50 &&
							rect.bottom <= containerRect.bottom + 50
						) {
							visible++
							// Check for stock text (e.g., "1651 st")
							const stockEl = btn.querySelector('p.text-bottle-700')
							if (stockEl?.textContent?.match(/\d+\s*st/i)) {
								withStock++
							}
						}
					})

					return { visible, withStock }
				})

				// If all visible items have stock counts, we're good
				if (
					visibleStatus.visible > 0 &&
					visibleStatus.withStock === lastVisibleWithStock &&
					visibleStatus.withStock > 0
				) {
					stableCount++
					if (stableCount >= 2) break
				} else {
					stableCount = 0
				}
				lastVisibleWithStock = visibleStatus.withStock
				await new Promise((resolve) => setTimeout(resolve, 200))
			}

			// Collect stock counts from ALL buttons (not just visible - they retain their values)
			const allStocks = await page.evaluate(() => {
				const btns = document.querySelectorAll(
					'button.flex.w-full.flex-col'
				)
				const result: { addr: string; stock: string }[] = []
				btns.forEach((btn) => {
					const addrEl = btn.querySelector('p.sans-200')
					const stockEl = btn.querySelector('p.text-bottle-700')
					const addr = addrEl?.textContent?.trim().toLowerCase() || ''
					const stockText = stockEl?.textContent?.trim() || ''
					const stockMatch = stockText.match(/(\d+)\s*st/i)
					if (addr && stockMatch) {
						result.push({ addr, stock: stockMatch[1] })
					}
				})
				return result
			})

			allStocks.forEach(({ addr, stock }) => {
				// Always update - later values might be more accurate
				stockMap.set(addr, stock)
			})
		}
		console.log(`Collected ${stockMap.size} stores with stock counts`)
	} catch (e: any) {
		console.error('Error during scroll collection:', e.message)
	}

	// Get all stores with stock information
	try {
		// Convert stockMap to object for passing to evaluate
		const stockData = Object.fromEntries(stockMap)
		console.log(
			`Using pre-collected stock data for ${
				Object.keys(stockData).length
			} stores`
		)

		const stores = await page.evaluate(
			(collectedStocks: Record<string, string>) => {
				const storeButtons = Array.from(
					document.querySelectorAll('button.flex.w-full.flex-col')
				)

				return storeButtons.map((button) => {
					const topSection = button.querySelector(
						'div.flex.w-full.justify-between'
					)
					const addressElement = topSection?.querySelector('p.sans-200')
					const address = (
						addressElement?.textContent?.trim() || ''
					).toLowerCase()

					// Try to get stock from DOM first
					let amount = '0'
					const stockEl = button.querySelector('p.text-bottle-700')
					const stockText = stockEl?.textContent?.trim() || ''
					const stockMatch = stockText.match(/(\d+)\s*st/i)
					if (stockMatch) {
						amount = stockMatch[1]
					}

					// Fall back to pre-collected data if no stock found in DOM
					if (amount === '0' && collectedStocks[address]) {
						amount = collectedStocks[address]
					}

					const fullAddressElement = button.querySelector('p.text-black65')
					const fullAddress = (
						fullAddressElement?.textContent?.trim() || ''
					).toLowerCase()
					const city = fullAddress.split(',').pop()?.trim() || ''

					return { address, city, amount, fullAddress }
				})
			},
			stockData
		)

		// Log summary
		const withStock = stores.filter((s) => s.amount !== '0').length
		console.log(`Extracted ${stores.length} stores, ${withStock} with stock`)

		const cleanedStores: Store[] = stores

		// Filter stores by area if provided
		let filteredStores = cleanedStores
		if (area) {
			filteredStores = cleanedStores.filter((store) => {
				return (
					store.city.toLowerCase() === area.toLowerCase() ||
					store.fullAddress.toLowerCase().includes(area.toLowerCase())
				)
			})
			console.log(
				`\nFiltered to ${filteredStores.length} stores in area: ${area}`
			)
		}

		return {
			success: true,
			price: price,
			stores: filteredStores,
		}
	} catch (e: any) {
		console.error('Could not extract store data:', e.message)
		return { success: false, error: e.message }
	} finally {
		await browser.close()
	}
}

export default getDrink
