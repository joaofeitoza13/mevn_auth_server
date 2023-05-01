import { Request, Response } from "express"
import { User } from "../models"
import { badRequest, conflict, created, internalServerError } from "./http_responses"
import bcrypt from "bcrypt"

export const register = async (req: Request, res: Response) => {
  const { username, email, firstname, lastname, password, passwordConf } = req.body

  if( !username || !email || !firstname || !lastname || !password || !passwordConf ) {
    const message = 'Missing field(s).'
    return badRequest(res, message)
  }

  if(password !== passwordConf) {
    const message = 'Passwords are different.'
    return badRequest(res, message)
  }
  //! exec() should not be executed after create function
  const userExists = await User.exists({ email }).exec()

  if(userExists) {
    const message = 'Email already taken.'
    return conflict(res, message)
  }

  try {
    const hashedPW = await bcrypt.hash(password, 10)
    //! exec() should not be executed after create function
    await User.create({ email, username, password: hashedPW, firstname, lastname })
    const message = "User created successfully."
    return created(res, message)
  } catch (error) {
    const message = 'Internal Server Error'
    return internalServerError(res, message)
  }
}

export const login = async (req: Request, res: Response) => {
  res.sendStatus(200)
}

export const logout = async (req: Request, res: Response) => {
  res.sendStatus(200)
}

export const refresh = async (req: Request, res: Response) => {
  res.sendStatus(200)
}

export const user = async (req: Request, res: Response) => {
  res.sendStatus(200)
}
