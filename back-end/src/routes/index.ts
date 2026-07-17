import { Router } from 'express'
import rotasComputadores from './computadoresRoutes.js'

const rotas = Router()

rotas.use('/computadores', rotasComputadores)

export default rotas
