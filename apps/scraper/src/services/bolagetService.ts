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
	await page.setCookie({
		name: 'systembolaget.age',
		value: '{"state":{"verified":true},"version":0}',
		domain: '.systembolaget.se',
	})
	await page.setCookie({
		name: 'systembolaget.consent',
		value: '{"state":{"consentTypes":["useful","profiling","mandatory","statistical"]},"version":0}',
		domain: '.systembolaget.se',
	})

	await page.goto(url, {
		waitUntil: 'domcontentloaded',
		timeout: 30000,
	})

	// Find and click the "Välj butik" button to open the store finder
	let buttonFound = false
	try {
		// Wait for the button to appear and be clickable
		await page.waitForFunction(
			() => {
				const buttons = document.querySelectorAll('#PdpCardInStore button')
				return Array.from(buttons).some((btn) =>
					btn.textContent?.includes('Välj butik')
				)
			},
			{ timeout: 15000 }
		)

		const button = await page.evaluateHandle(() => {
			const buttons = Array.from(
				document.querySelectorAll('#PdpCardInStore button')
			)
			return buttons.find((btn) => btn.textContent?.includes('Välj butik'))
		})

		const btnElement = button.asElement() as
			| import('puppeteer').ElementHandle<Element>
			| null

		if (btnElement) {
			await btnElement.click()
			buttonFound = true

			// Wait for store buttons to appear AND have content (address text)
			await page.waitForFunction(
				() => {
					const btns = document.querySelectorAll(
						'button.flex.w-full.flex-col'
					)
					if (btns.length === 0) return false
					// Check that at least one button has address content
					return Array.from(btns).some((btn) =>
						btn.querySelector('p.sans-200')?.textContent?.trim()
					)
				},
				{ timeout: 15000 }
			)
		}
	} catch (e: any) {
		console.error('Could not find or click "Välj butik" button:', e.message)
	}

	if (!buttonFound) {
		await browser.close()
		return {
			success: false,
			error: 'Could not find the "Välj butik" button on the page.',
		}
	}

	// Filter stores by area if provided
	try {
		if (area) {
			const searchField = await page.$('#search')
			if (searchField) {
				// Get initial button count before filtering
				const initialCount = await page.evaluate(
					() =>
						document.querySelectorAll('button.flex.w-full.flex-col')
							.length
				)

				await searchField.click()
				await searchField.type(area, { delay: 30 })

				// Wait for filtered results - either fewer buttons or content change
				await page.waitForFunction(
					(prevCount: number) => {
						const btns = document.querySelectorAll(
							'button.flex.w-full.flex-col'
						)
						// Either count changed or we have stock data loaded
						return (
							btns.length !== prevCount ||
							Array.from(btns).some((btn) =>
								btn.textContent?.match(/\d+\s*st/i)
							)
						)
					},
					{ timeout: 10000 },
					initialCount
				)

				// Scroll to trigger lazy loading, then wait for stock counts
				const scrollContainer = await page.$('div.overflow-y-auto')
				if (scrollContainer) {
					// Quick scroll to bottom and back to trigger loading
					await page.evaluate(() => {
						const el = document.querySelector('div.overflow-y-auto')
						if (el) el.scrollTop = el.scrollHeight
					})

					// Wait for any stock count to appear
					await page
						.waitForFunction(
							() => {
								const btns = document.querySelectorAll(
									'button.flex.w-full.flex-col'
								)
								return Array.from(btns).some((btn) =>
									btn.textContent?.match(/\d+\s*st/i)
								)
							},
							{ timeout: 5000 }
						)
						.catch(() => {})

					await page.evaluate(() => {
						const el = document.querySelector('div.overflow-y-auto')
						if (el) el.scrollTop = 0
					})
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

	// Get list of filtered store addresses (for early exit optimization)
	const filteredAddresses: Set<string> = new Set()
	if (area) {
		const lowerArea = area.toLowerCase()
		const addresses = await page.evaluate((areaFilter: string) => {
			const btns = document.querySelectorAll('button.flex.w-full.flex-col')
			const matching: string[] = []
			btns.forEach((btn) => {
				const addrEl = btn.querySelector('p.sans-200')
				const fullAddrEl = btn.querySelector('p.text-black65')
				const addr = addrEl?.textContent?.trim().toLowerCase() || ''
				const fullAddr = fullAddrEl?.textContent?.trim().toLowerCase() || ''
				const city = fullAddr.split(',').pop()?.trim() || ''

				if (city === areaFilter || fullAddr.includes(areaFilter)) {
					matching.push(addr)
				}
			})
			return matching
		}, lowerArea)
		addresses.forEach((a) => filteredAddresses.add(a))
	}

	// Helper to check if all filtered stores have stock
	const allFilteredHaveStock = () => {
		if (!area || filteredAddresses.size === 0) return false
		for (const addr of filteredAddresses) {
			if (!stockMap.has(addr)) return false
		}
		return true
	}

	// Collect stock data by scrolling
	const stockMap: Map<string, string> = new Map()
	try {
		const scrollHeight = await page.evaluate(() => {
			const el = document.querySelector('div.overflow-y-auto')
			return el?.scrollHeight || 3000
		})

		const maxScroll = Math.min(scrollHeight, 8000)

		// PHASE 1: Fast scroll to trigger all lazy loading
		for (let pos = 0; pos <= maxScroll; pos += 400) {
			await page.evaluate((scrollPos) => {
				const el = document.querySelector('div.overflow-y-auto')
				if (el) el.scrollTop = scrollPos
			}, pos)
			await new Promise((r) => setTimeout(r, 50))
		}

		// Scroll back to top
		await page.evaluate(() => {
			const el = document.querySelector('div.overflow-y-auto')
			if (el) el.scrollTop = 0
		})

		// PHASE 2: Wait for network to settle
		await page.evaluate(() => {
			return new Promise<void>((resolve) => {
				let timeout: ReturnType<typeof setTimeout>
				const check = () => {
					clearTimeout(timeout)
					timeout = setTimeout(resolve, 500)
				}
				check()
				setTimeout(resolve, 3000)
			})
		})

		// PHASE 3: Scroll and collect - exit early if all filtered stores have stock
		for (let pos = 0; pos <= maxScroll; pos += 300) {
			await page.evaluate((scrollPos) => {
				const el = document.querySelector('div.overflow-y-auto')
				if (el) el.scrollTop = scrollPos
			}, pos)

			await page
				.waitForFunction(
					() => {
						const container = document.querySelector(
							'div.overflow-y-auto'
						)
						if (!container) return true

						const containerRect = container.getBoundingClientRect()
						const btns = container.querySelectorAll(
							'button.flex.w-full.flex-col'
						)

						let visible = 0
						let withStock = 0

						btns.forEach((btn) => {
							const rect = btn.getBoundingClientRect()
							if (
								rect.top >= containerRect.top - 100 &&
								rect.bottom <= containerRect.bottom + 100
							) {
								visible++
								const stockEl = btn.querySelector('p.text-bottle-700')
								if (stockEl?.textContent?.match(/\d+\s*st/i)) {
									withStock++
								}
							}
						})

						return visible === 0 || withStock >= visible
					},
					{ timeout: 2000 }
				)
				.catch(() => {})

			// Collect stock data
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
				stockMap.set(addr, stock)
			})

			// Early exit if all filtered stores have stock
			if (allFilteredHaveStock()) {
				break
			}
		}

		// PHASE 4: Final pass (skip if already got all filtered stores)
		if (!allFilteredHaveStock()) {
			for (let pos = 0; pos <= maxScroll; pos += 250) {
				await page.evaluate((scrollPos) => {
					const el = document.querySelector('div.overflow-y-auto')
					if (el) el.scrollTop = scrollPos
				}, pos)
				await new Promise((r) => setTimeout(r, 150))

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
					stockMap.set(addr, stock)
				})

				if (allFilteredHaveStock()) {
					break
				}
			}
		}
	} catch (e: any) {
		console.error('Error during scroll collection:', e.message)
	}

	// Extract all stores with stock information
	try {
		const stockData = Object.fromEntries(stockMap)

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

					let amount = '0'
					const stockEl = button.querySelector('p.text-bottle-700')
					const stockText = stockEl?.textContent?.trim() || ''
					const stockMatch = stockText.match(/(\d+)\s*st/i)

					if (stockMatch) {
						amount = stockMatch[1]
					} else if (collectedStocks[address]) {
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

		// Filter stores by area if provided
		const filteredStores: Store[] = area
			? stores.filter(
					(store) =>
						store.city.toLowerCase() === area.toLowerCase() ||
						store.fullAddress.includes(area.toLowerCase())
			  )
			: stores

		return {
			success: true,
			price,
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
