import mongoose, { ConnectOptions } from 'mongoose'

export const connectDB = async (db: string) => {
	try {
		await mongoose.connect(db, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
		} as ConnectOptions)
	} catch (error) {
		console.log(error)
	}
}
