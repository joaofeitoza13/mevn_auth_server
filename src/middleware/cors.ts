import { CorsOptions } from 'cors'
import { allowedOrigins } from '@/configs'

export const corsConfig: CorsOptions = {
	origin: (origin: string, callback) => {
		if (allowedOrigins.includes(origin || '') || !origin) {
			callback(null, true)
		} else {
			callback(new Error('Not allowed by CORS'))
		}
	},
}
