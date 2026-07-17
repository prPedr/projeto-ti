import { Router } from 'express'
import rotasComputadores from './computadoresRoutes.js'
import rotasEquipamentos from './equipamentosRoutes.js'

const rotas = Router()

rotas.use('/computadores', rotasComputadores)
rotas.use('/equipamentos', rotasEquipamentos)

export default rotas
