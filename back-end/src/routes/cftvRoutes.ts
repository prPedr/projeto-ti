import { Router } from 'express'
import { criar } from '../controllers/cftvController.js'
import { autenticar } from '../middlewares/authMiddleware.js'

const rotasCftv = Router()

rotasCftv.post('/', autenticar, criar)

export default rotasCftv
