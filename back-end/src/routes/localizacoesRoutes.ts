import { Router } from 'express'
import { criar, listar } from '../controllers/localizacoesController.js'
import { autenticar } from '../middlewares/authMiddleware.js'

const rotasLocalizacoes = Router()

rotasLocalizacoes.get('/', autenticar, listar)
rotasLocalizacoes.post('/', autenticar, criar)

export default rotasLocalizacoes
