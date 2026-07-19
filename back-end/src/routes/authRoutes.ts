import { Router } from 'express'
import { login } from '../controllers/authController.js'
import { limiterLogin } from '../middlewares/rateLimitMiddleware.js'

const rotasAuth = Router()

rotasAuth.post('/login', limiterLogin, login)

export default rotasAuth
