import { Router } from 'express'
import { criar, listar, listarCanais, atualizarCanal, listarConectaveis } from '../controllers/nvrsController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { nvrSchema } from '../schemas/equipamentosSchema.js'
import { atualizarCanalSchema, listarCanaisSchema } from '../schemas/canaisNvrSchema.js'

const rotasNvrs = Router()

rotasNvrs.get('/', autenticar, listar)
rotasNvrs.post('/', autenticar, validarSchema(nvrSchema), criar)

rotasNvrs.get('/cameras-conectaveis', autenticar, listarConectaveis)

// Rotas de canais do NVR
rotasNvrs.get('/:id/canais', autenticar, validarSchema(listarCanaisSchema), listarCanais)
rotasNvrs.put('/:id/canais/:numeroCanal', autenticar, validarSchema(atualizarCanalSchema), atualizarCanal)

export default rotasNvrs
