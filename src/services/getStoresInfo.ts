'use server'
import axios from 'axios'

// In Docker: use container name, locally: use localhost
const API_URL = process.env.API_URL || 'http://localhost:5000'

export async function getStores(target: string, area: string) {
	try {
		const stores = await axios.get(
			`${API_URL}/api/bolaget/getstores`,
			{
				params: {
					target: target,
					area: area
				},
				// Scraping can take a while due to lazy loading and scrolling
				timeout: 120000, // 2 minutes
			}
		)
		return stores.data
	} catch (error: any) {
		console.error('Error fetching stores:', error?.message || error)
		throw new Error(error?.message || 'Failed to fetch stores')
	}
}
