import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserModel, UserRequest } from '../helpers/user'
import { User } from '../models'

export const authentication = async (req: UserRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decodedUser: UserModel) => {
      if (err) {
        req.user = {} as UserModel
        return next()
      }
      const user = await User.findById(decodedUser.id)
        .select({ password: 0, refresh_token: 0 })
        .exec()
      if (user) {
        req.user = user.toObject({ getters: true })
      } else {
        req.user = {} as UserModel
      }
      return next()
    })
  } else {
    const message = "Request header does not have a authorization or the 'Bearer' schema"
    req.message = message
    return next()
  }
}
