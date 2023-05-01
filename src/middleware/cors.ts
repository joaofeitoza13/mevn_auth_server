import { CorsOptions } from 'cors'
import { allowedOrigins } from '../config/allowed_origins'

export const corsConfig: CorsOptions = {
  origin: (origin: string, callback: (error: Error | null, allow?: boolean) => any) => {
    if (allowedOrigins.includes(origin || '') || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
