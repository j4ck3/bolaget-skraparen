import { Elysia } from 'elysia'
// TODO: Create scrapeService or remove this controller
// import check from '../services/main/scrapeService'

export const mainRoutes = new Elysia({ prefix: '/api/main' })
	.get('/check', async ({ set }) => {
		set.status = 501
		return { message: 'Not implemented - scrapeService not found' }
	})

