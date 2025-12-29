import { Elysia } from 'elysia'
import getStores from '../services/bolagetService'

export const bolagetRoutes = new Elysia({ prefix: '/api/bolaget' })
	.get('/getstores', async ({ query, set }) => {
		try {
			const data = await getStores(query.target, query.area)

			if (data) {
				return { data }
			} else {
				set.status = 404
				return { message: 'Could not get the stores.' }
			}
		} catch (err) {
			console.error('Error checking stock:', err)
			set.status = 500
			return { message: '500: An error occurred while checking the product' }
		}
	})

