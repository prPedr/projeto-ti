import { Router } from 'express'
import { criar, editar, excluir, listar } from '../controllers/opcoesController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { criarOpcaoSchema, listarOpcoesSchema } from '../schemas/opcoesSchema.js'

const rotasOpcoes = Router()

rotasOpcoes.get('/', autenticar, validarSchema(listarOpcoesSchema), listar)
rotasOpcoes.post('/', autenticar, validarSchema(criarOpcaoSchema), criar)
rotasOpcoes.put('/:id', autenticar, editar)
rotasOpcoes.delete('/:id', autenticar, excluir)

export default rotasOpcoes
