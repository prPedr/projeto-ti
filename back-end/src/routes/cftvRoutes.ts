import { Router } from 'express'
import { criar } from '../controllers/cftvController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { cftvSchema } from '../schemas/equipamentosSchema.js'

const rotasCftv = Router()

rotasCftv.post('/', autenticar, validarSchema(cftvSchema), criar)

export default rotasCftv
