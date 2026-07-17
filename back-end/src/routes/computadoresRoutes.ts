import { Router } from 'express'
import { criar } from '../controllers/computadoresController.js'

const rotasComputadores = Router()

rotasComputadores.post('/', criar)

export default rotasComputadores
