import { Router } from 'express'
import { criar } from '../controllers/computadoresController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { computadorSchema } from '../schemas/equipamentosSchema.js'

const rotasComputadores = Router()

rotasComputadores.post('/', autenticar, validarSchema(computadorSchema), criar)

export default rotasComputadores
