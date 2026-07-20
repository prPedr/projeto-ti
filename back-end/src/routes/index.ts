import { Router } from 'express'
import rotasAuth from './authRoutes.js'
import rotasCelulares from './celularesRoutes.js'
import rotasCftv from './cftvRoutes.js'
import rotasComputadores from './computadoresRoutes.js'
import rotasEquipamentos from './equipamentosRoutes.js'
import rotasLocalizacoes from './localizacoesRoutes.js'
import rotasSwitches from './switchesRoutes.js'

const rotas = Router()

rotas.use('/auth', rotasAuth)
rotas.use('/celulares', rotasCelulares)
rotas.use('/cftv', rotasCftv)
rotas.use('/computadores', rotasComputadores)
rotas.use('/equipamentos', rotasEquipamentos)
rotas.use('/localizacoes', rotasLocalizacoes)
rotas.use('/switches', rotasSwitches)

export default rotas
