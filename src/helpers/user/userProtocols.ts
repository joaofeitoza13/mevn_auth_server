import { Request } from 'express'
import { ObjectId } from 'mongoose'

export interface User {
	id: ObjectId
	email: string
	username: string
	password: string
	firstname: string
	lastname: string
	refresh_token: string
}

export interface UserRequest extends Request {
	user: User
	message?: string
}
