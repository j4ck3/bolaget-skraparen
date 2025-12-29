import { Elysia } from 'elysia'
import getProductsFromSearch from '../services/matsmartService'

export const mRoutes = new Elysia({ prefix: '/api/m' })
	.get('/getproducts', async ({ query, set }) => {
		try {
			const data = await getProductsFromSearch(query.url, query.area)

			if (data) {
				return { data }
			} else {
				set.status = 404
				return { message: 'No drinks' }
			}
		} catch (err) {
			console.error('Error:', err)
			set.status = 500
			return { message: 'An error occurred while getting products' }
		}
	})

