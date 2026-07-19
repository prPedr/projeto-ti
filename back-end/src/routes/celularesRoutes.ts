import { Router } from 'express'
import { criar } from '../controllers/celularesController.js'
import { autenticar } from '../middlewares/authMiddleware.js'

const rotasCelulares = Router()

rotasCelulares.post('/', autenticar, criar)

export default rotasCelulares
