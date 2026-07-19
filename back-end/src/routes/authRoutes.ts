import { Router } from 'express'
import { login } from '../controllers/authController.js'

const rotasAuth = Router()

rotasAuth.post('/login', login)

export default rotasAuth
