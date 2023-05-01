import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'

dotenv.config()

const port = process.env.PORT

const server: Express = express()

server.get('/', (req: Request, res: Response) => {
  res.send("Typescript Express Server's root.")
})

server.all('*', (req: Request, res: Response) => {
  res.sendStatus(404)
})

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
