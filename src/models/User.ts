import { Schema, model } from 'mongoose'
import { User } from 'helpers/user'

const userSchema = new Schema<User>(
	{
		username: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
			unique: true,
			validate: [(val: string) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val)],
		},
		firstname: {
			type: String,
			required: true,
		},
		lastname: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
			min: 6,
		},
		refresh_token: String,
	},
	{
		virtuals: {
			id: {
				get() {
					return this._id
				},
			},
			full_name: {
				// ? asdsadas
				get(): string {
					return `${this.firstname} ${this.lastname}`
				},
			},
		},
	}
)

export const UserModel = model<User>('UserModel', userSchema, 'users')
