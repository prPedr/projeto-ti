import { Router } from 'express'
import { criar, listarConectaveis } from '../controllers/impressorasController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { impressoraSchema } from '../schemas/equipamentosSchema.js'

const rotasImpressoras = Router()

rotasImpressoras.get('/computadores-conectaveis', autenticar, listarConectaveis)
rotasImpressoras.post('/', autenticar, validarSchema(impressoraSchema), criar)

export default rotasImpressoras
