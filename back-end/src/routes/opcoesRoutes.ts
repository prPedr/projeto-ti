import { Router } from 'express'
import { criar, editar, excluir, listar } from '../controllers/opcoesController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { exigirPerfil } from '../middlewares/autorizacaoMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { criarOpcaoSchema, listarOpcoesSchema } from '../schemas/opcoesSchema.js'

const rotasOpcoes = Router()

rotasOpcoes.get('/', autenticar, validarSchema(listarOpcoesSchema), listar)
rotasOpcoes.post('/', autenticar, exigirPerfil('ADMIN'), validarSchema(criarOpcaoSchema), criar)
rotasOpcoes.put('/:id', autenticar, exigirPerfil('ADMIN'), editar)
rotasOpcoes.delete('/:id', autenticar, exigirPerfil('ADMIN'), excluir)

export default rotasOpcoes
