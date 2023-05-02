import { Schema, model } from 'mongoose'
import { UserModel } from 'helpers/user'

const userSchema = new Schema<UserModel>(
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
      validate: [(val: string) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val)],
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
      full_name: {
        // ? asdsadas
        get(this: UserModel): string {
          return `${this.firstname} ${this.lastname}`
        },
      },
      id: {
        get() {
          return this._id
        },
      },
    },
  }
)

export const User = model<UserModel>('User', userSchema, 'users')
