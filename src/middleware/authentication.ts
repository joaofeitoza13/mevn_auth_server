import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { unauthorized } from '../controllers/http_responses'
import { IUser, User } from '../models'

interface UserRequest extends Request {
  user: IUser
}

export const authentication = async (req: UserRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decoded: IUser) => {
      if (err) {
        req.user = {} as IUser
        return next()
      }
      const user = await User.findById(decoded.id).select({ password: 0, refresh_token: 0 }).exec()
      if (user) {
        req.user = user.toObject({ getters: true })
      } else {
        req.user = {} as IUser
      }
      return next()
    })
  } else {
    const message = "Request header does not have a authorization or the 'Bearer' schema"
    // return unauthorized(res, message)
    req.user = {} as IUser
    return next()
  }
}
