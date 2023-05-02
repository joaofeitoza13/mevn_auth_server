import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User, UserRequest } from '@/helpers/user'
import { UserModel } from '@/models'

export const authentication = async (req: UserRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization || req.headers.Authorization
	if (typeof authHeader === 'string' && authHeader.startsWith('Bearer')) {
		const token = authHeader.split(' ')[1]
		jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decodedUser: User) => {
			if (err) {
				req.user = {} as User
				return next()
			}
			const user = await UserModel.findById(decodedUser.id)
				.select({ password: 0, refresh_token: 0 })
				.exec()
			if (user) {
				req.user = user.toObject({ getters: true })
			} else {
				req.user = {} as User
			}
			return next()
		})
	} else {
		const message = 'Request header does not have a authorization or the Bearer'
		req.message = message
		return next()
	}
}
