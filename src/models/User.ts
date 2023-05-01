import { Schema, model } from "mongoose";

interface User {
  username: string
  email: string
  firstname: string
  lastname: string
  password: string
  refresh_token: string
}

const userSchema = new Schema<User>({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    validate: [
      (val: string) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val),
    ],
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  password: {
    type: String, 
    required: true,
    min: 6,
  },
  refresh_token: String
},
{
  virtuals: {
    full_name: {
      // ? asdsadas
      get(this: User): string {
        return `${this.firstname} ${this.lastname}`
      }
    }
  }
})
//! 'users' refers to the collection of the db specified in the connection string
export const User = model<User>('User', userSchema, 'users')