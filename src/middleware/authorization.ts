import { Response, NextFunction } from 'express'
import { unauthorized } from '@/helpers/http'
import { UserRequest } from '@/helpers/user'

export const authorization = async (req: UserRequest, res: Response, next: NextFunction) => {
	if (!req.user?.id) {
		const message = 'User not authorized.'
		return unauthorized(res, message)
	}
	return next()
}
