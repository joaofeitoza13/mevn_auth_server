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
} from '../helpers/http'
import { User, UserRequest } from '../helpers/user'
import { UserModel } from '../models'

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
  const userExists = await UserModel.exists({ email }).exec()

  if (userExists) {
    const message = 'Email already taken.'
    return conflict(res, message)
  }

  try {
    const hashedPW = await bcrypt.hash(password, 10)
    await UserModel.create({
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

  const user = await UserModel.findOne({ email })
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
  const user = await UserModel.findOne({ refresh_token: refreshToken }).exec()

  if (!user) {
    //? httpOnly, sameSite and secure properties
    res.clearCookie('refresh_token', { httpOnly: true })
    // res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'none', secure: true })
    const message = 'No user with this cookie found, cookies cleared.'
    return noContent(res, message)
  }

  if (user) {
    user.refresh_token = null!
    await user.save()
  }

  res.clearCookie('refresh_token', { httpOnly: true })
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

  const user = await UserModel.findOne({ refresh_token: refreshToken }).exec()

  if (!user) {
    const message = 'User not found.'
    return unauthorized(res, message)
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err: Error, decodedUser: User) => {
    if (err || user.id !== decodedUser.id) {
      const message = 'User not found.'
      return unauthorized(res, message)
    }
    const accessToken = jwt.sign({ id: decodedUser.id }, process.env.ACCESS_TOKEN, {
      expiresIn: '1800s',
    })
    res.json({ access_token: accessToken })
  })
}

export const user = async (req: UserRequest, res: Response) => {
  const user = req.user
  return res.status(200).json(user)
}
