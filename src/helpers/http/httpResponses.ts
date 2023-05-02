import { Response } from 'express'

export const ok = (res: Response, message: string) => {
	res.status(200).json({ message: message })
}

export const created = (res: Response, message: string) => {
	res.status(201).json({ message: message })
}

export const noContent = (res: Response, message: string) => {
	res.status(203).json({ message: message })
}

export const badRequest = (res: Response, message: string) => {
	res.status(400).json({ message: message })
}

export const unauthorized = (res: Response, message: string) => {
	res.status(401).json({ message: message })
}

export const forbidden = (res: Response, message: string) => {
	res.status(403).json({ message: message })
}

export const notFound = (res: Response, message: string) => {
	res.status(404).json({ message: message })
}

export const conflict = (res: Response, message: string) => {
	res.status(409).json({ message: message })
}

export const internalServerError = (res: Response, message: string) => {
	res.status(500).json({ message: message })
}
