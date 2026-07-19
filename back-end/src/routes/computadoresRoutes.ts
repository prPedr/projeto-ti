import { Router } from 'express'
import { criar } from '../controllers/computadoresController.js'
import { autenticar } from '../middlewares/authMiddleware.js'

const rotasComputadores = Router()

rotasComputadores.post('/', autenticar, criar)

export default rotasComputadores
