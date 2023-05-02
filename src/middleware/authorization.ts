import { Request, Response, NextFunction } from 'express'
import { unauthorized } from '../controllers/http_responses'
import { IUser } from '../models'

interface UserRequest extends Request {
  user: IUser
}

export const authorization = async (req: UserRequest, res: Response, next: NextFunction) => {
  if (!req.user.id) {
    const message = 'User not authorized.'
    return unauthorized(res, message)
  }
  return next()
}
