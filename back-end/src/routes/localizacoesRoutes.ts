import { Router } from 'express'
import { criar, listar } from '../controllers/localizacoesController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { listarLocalizacoesSchema } from '../schemas/localizacoesSchema.js'

const rotasLocalizacoes = Router()

rotasLocalizacoes.get('/', autenticar, validarSchema(listarLocalizacoesSchema), listar)
rotasLocalizacoes.post('/', autenticar, criar)

export default rotasLocalizacoes
