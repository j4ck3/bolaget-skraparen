'use server'
import axios from 'axios'
export async function getStores(target: string, area: string) {
	try {
		const stores = await axios.get(
			'http://localhost:5000/api/bolaget/getstores',
			{
				params: {
					target: target,
					area: area
				}
			}
		)
		return stores.data
	} catch (error) {
		console.error('Error fetching stores:', error)
		throw error
	}
}
