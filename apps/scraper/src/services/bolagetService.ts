// Reads store stock from Systembolaget's public JSON API, the same one
// www.systembolaget.se calls from the browser. An earlier version drove
// Chromium through the product page and broke whenever the markup changed.
//
// The API needs a subscription key that the site ships in its client bundle
// as NEXT_PUBLIC_API_KEY_APIM. If the key is rotated, the next 401 triggers a
// fresh lookup in the site's JS chunks, so a rotation heals itself.

const SITE = 'https://www.systembolaget.se'
const API = 'https://api-extern.systembolaget.se/sb-api-ecommerce/v1'
const FALLBACK_KEY = '8d39a7340ee7439f8b4c1e995c8f3e4a'
const STORE_CACHE_MS = 60 * 60 * 1000
const STOCK_CONCURRENCY = 8
const REQUEST_TIMEOUT_MS = 15000

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

interface SiteStore {
	siteId: string
	streetAddress: string | null
	city: string | null
	isAgent: boolean
}

let apiKey = process.env.SYSTEMBOLAGET_API_KEY || FALLBACK_KEY
let storeCache: { at: number; stores: SiteStore[] } | null = null
// Shared so that parallel requests failing with 401 trigger one lookup, not one each.
let keyLookup: Promise<string | null> | null = null

class HttpError extends Error {
	status: number
	constructor(status: number, url: string) {
		super(`HTTP ${status} from ${url}`)
		this.status = status
	}
}

const fetchWithTimeout = (url: string, init: RequestInit = {}) =>
	fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })

// Scan the homepage's JS chunks for the published APIM key.
export const discoverApiKey = async (): Promise<string | null> => {
	const html = await (await fetchWithTimeout(`${SITE}/`)).text()
	const chunks = [...new Set(html.match(/\/_next\/static\/[^"']+\.js/g) ?? [])]
	const pattern = /NEXT_PUBLIC_API_KEY_APIM\s*:\s*["']([0-9a-f]{32})["']/
	for (const chunk of chunks) {
		const res = await fetchWithTimeout(`${SITE}${chunk}`)
		if (!res.ok) continue
		const match = (await res.text()).match(pattern)
		if (match) return match[1]
	}
	return null
}

const apiGet = async <T>(path: string, retried = false): Promise<T> => {
	const url = `${API}${path}`
	const res = await fetchWithTimeout(url, {
		headers: {
			'ocp-apim-subscription-key': apiKey,
			origin: SITE,
			referer: `${SITE}/`,
			accept: 'application/json',
		},
	})
	if ((res.status === 401 || res.status === 403) && !retried) {
		const staleKey = apiKey
		keyLookup ??= discoverApiKey()
			.catch(() => null)
			.finally(() => {
				keyLookup = null
			})
		const fresh = await keyLookup
		if (fresh && fresh !== staleKey) {
			if (apiKey === staleKey) console.warn('Systembolaget API key rotated, using the new one')
			apiKey = fresh
			return apiGet<T>(path, true)
		}
	}
	if (!res.ok) throw new HttpError(res.status, url)
	return (await res.json()) as T
}

const getAllStores = async (): Promise<SiteStore[]> => {
	if (storeCache && Date.now() - storeCache.at < STORE_CACHE_MS) {
		return storeCache.stores
	}
	const data = await apiGet<{ siteSearchResults: SiteStore[] }>('/sitesearch/site/')
	const stores = data.siteSearchResults.filter((s) => !s.isAgent)
	storeCache = { at: Date.now(), stores }
	return stores
}

// "https://www.systembolaget.se/produkt/sprit/absolut-8901/" -> "8901"
export const productNumberFromUrl = (url: string): string | null => {
	let path: string
	try {
		path = new URL(url).pathname
	} catch {
		return null
	}
	const slug = path.split('/').filter(Boolean).pop() ?? ''
	return slug.match(/(\d+)$/)?.[1] ?? null
}

const mapLimit = async <T, R>(
	items: T[],
	limit: number,
	fn: (item: T) => Promise<R>
): Promise<R[]> => {
	const results: R[] = new Array(items.length)
	let next = 0
	const worker = async () => {
		while (next < items.length) {
			const i = next++
			results[i] = await fn(items[i])
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
	return results
}

const formatPrice = (price: number | null | undefined) =>
	typeof price === 'number'
		? `${price.toLocaleString('sv-SE', { maximumFractionDigits: 2 })} kr`
		: ''

const getDrink = async (url: string, area?: string): Promise<StoreResult> => {
	const productNumber = productNumberFromUrl(url)
	if (!productNumber) {
		return { success: false, error: `Could not read a product number from: ${url}` }
	}

	try {
		const product = await apiGet<{ productId: string; priceInclVat: number | null }>(
			`/product/productNumber/${productNumber}`
		)

		const wanted = area?.trim().toLowerCase()
		const stores = (await getAllStores()).filter((s) => {
			if (!wanted) return true
			const city = (s.city ?? '').toLowerCase()
			const fullAddress = `${s.streetAddress ?? ''}, ${s.city ?? ''}`.toLowerCase()
			return city === wanted || fullAddress.includes(wanted)
		})

		const result = await mapLimit(stores, STOCK_CONCURRENCY, async (s) => {
			let amount = '0'
			try {
				const stock = await apiGet<{ stock: number | null }>(
					`/stockbalance/store/${s.siteId}/${product.productId}/`
				)
				amount = String(stock.stock ?? 0)
			} catch (e: any) {
				console.error(`Stock lookup failed for store ${s.siteId}:`, e.message)
			}
			const address = (s.streetAddress ?? '').toLowerCase()
			const city = (s.city ?? '').toLowerCase()
			return { address, city, amount, fullAddress: `${address}, ${city}` }
		})

		return { success: true, price: formatPrice(product.priceInclVat), stores: result }
	} catch (e: any) {
		console.error('Systembolaget API request failed:', e.message)
		if (e instanceof HttpError && e.status === 404) {
			return { success: false, error: `Product ${productNumber} was not found.` }
		}
		return { success: false, error: e.message }
	}
}

export default getDrink
