import { Router } from 'express'
import { criar } from '../controllers/switchesController.js'
import { autenticar } from '../middlewares/authMiddleware.js'

const rotasSwitches = Router()

rotasSwitches.post('/', autenticar, criar)

export default rotasSwitches
