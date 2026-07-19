import { Router } from 'express'
import rotasAuth from './authRoutes.js'
import rotasCftv from './cftvRoutes.js'
import rotasComputadores from './computadoresRoutes.js'
import rotasEquipamentos from './equipamentosRoutes.js'

const rotas = Router()

rotas.use('/auth', rotasAuth)
rotas.use('/cftv', rotasCftv)
rotas.use('/computadores', rotasComputadores)
rotas.use('/equipamentos', rotasEquipamentos)

export default rotas
