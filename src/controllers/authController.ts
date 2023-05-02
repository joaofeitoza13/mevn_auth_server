import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {
  badRequest,
  conflict,
  created,
  internalServerError,
  noContent,
  unauthorized,
} from './http_responses'
import { IUser, User } from '../models'

export const register = async (req: Request, res: Response) => {
  const { username, email, firstname, lastname, password, passwordConf } = req.body

  if (!username || !email || !firstname || !lastname || !password || !passwordConf) {
    const message = 'Missing field(s).'
    return badRequest(res, message)
  }

  if (password !== passwordConf) {
    const message = 'Passwords are different.'
    return badRequest(res, message)
  }
  const userExists = await User.exists({ email }).exec()

  if (userExists) {
    const message = 'Email already taken.'
    return conflict(res, message)
  }

  try {
    const hashedPW = await bcrypt.hash(password, 10)
    await User.create({
      email,
      username,
      password: hashedPW,
      firstname,
      lastname,
    })
    const message = 'User created successfully.'
    return created(res, message)
  } catch (error) {
    const message = 'Internal Server Error'
    return internalServerError(res, message)
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    const message = 'Invalid fields.'
    return badRequest(res, message)
  }

  const user = await User.findOne({ email })
  if (!user) {
    const message = 'User not found.'
    return unauthorized(res, message)
  }

  if (user) {
    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      const message = `Passwords didn't match.`
      return unauthorized(res, message)
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN!, {
      expiresIn: '1800s',
    })

    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN!, {
      expiresIn: '1d',
    })
    user.refresh_token = refreshToken
    await user.save()
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    })
    //! remove sameSite and secure for postman, as it hides the cookie
    // res.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 24*60*60*1000, secure: true })
    res.json({ access_token: accessToken })
  }
}

export const logout = async (req: Request, res: Response) => {
  const cookies = req.cookies

  if (!cookies.refresh_token) {
    const message = 'Sorry, no refresh token defined inside cookies.'
    return noContent(res, message)
  }

  const refreshToken = cookies.refresh_token
  const user = await User.findOne({ refresh_token: refreshToken }).exec()

  if (!user) {
    //? httpOnly, sameSite and secure properties
    //! enables cookies between cors: cross-origin resource sharing
    res.clearCookie('refresh_token', { httpOnly: true })
    //! remove sameSite and secure for postman, as it hides the cookie
    // res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'none', secure: true })
    const message = 'No user with this cookie found, cookies cleared.'
    return noContent(res, message)
  }

  if (user) {
    user.refresh_token = null!
    await user.save()
  }

  res.clearCookie('refresh_token', { httpOnly: true })
  //! remove sameSite and secure for postman, as it hides the cookie
  // res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'none', secure: true })
  const message = 'Cookie cleared.'
  return noContent(res, message)
}

export const refresh = async (req: Request, res: Response) => {
  const cookies = req.cookies
  if (!cookies.refresh_token) {
    const message = 'Sorry, no refresh token defined inside cookies.'
    return unauthorized(res, message)
  }
  const refreshToken = cookies.refresh_token

  const user = await User.findOne({ refresh_token: refreshToken }).exec()

  if (!user) {
    const message = 'User not found.'
    return unauthorized(res, message)
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err: Error, decoded: IUser) => {
    if (err || user.id !== decoded.id) {
      const message = 'User not found.'
      return unauthorized(res, message)
    }
    const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN, {
      expiresIn: '1800s',
    })
    res.json({ access_token: accessToken })
  })
}

export const user = async (req: Request, res: Response) => {
  res.sendStatus(200)
}
