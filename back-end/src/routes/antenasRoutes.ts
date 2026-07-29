import { Router } from 'express'
import { criar } from '../controllers/antenasController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { antenaSchema } from '../schemas/equipamentosSchema.js'

const rotasAntenas = Router()

rotasAntenas.post('/', autenticar, validarSchema(antenaSchema), criar)

export default rotasAntenas
