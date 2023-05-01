import express, { Router } from "express";
import { authController } from "../../controllers";

export const router: Router = express.Router()

router.post('/register', authController.register)

router.post('/login', authController.login)

router.post('/logout', authController.logout)

router.post('/refresh', authController.refresh)

router.get('/user', authController.user)
