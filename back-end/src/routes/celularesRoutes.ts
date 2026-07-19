import { Router } from 'express'
import { criar } from '../controllers/celularesController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { celularSchema } from '../schemas/equipamentosSchema.js'

const rotasCelulares = Router()

rotasCelulares.post('/', autenticar, validarSchema(celularSchema), criar)

export default rotasCelulares
