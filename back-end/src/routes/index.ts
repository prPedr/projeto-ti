import { Router } from 'express'
import rotasAuth from './authRoutes.js'
import rotasCelulares from './celularesRoutes.js'
import rotasCftv from './cftvRoutes.js'
import rotasComputadores from './computadoresRoutes.js'
import rotasDashboard from './dashboardRoutes.js'
import rotasEquipamentos from './equipamentosRoutes.js'
import rotasLocalizacoes from './localizacoesRoutes.js'
import rotasMapeamentoRede from './mapeamentoRedeRoutes.js'
import rotasOpcoes from './opcoesRoutes.js'
import rotasSwitches from './switchesRoutes.js'
import rotasUsuarios from './usuariosRoutes.js'

const rotas = Router()

rotas.use('/auth', rotasAuth)
rotas.use('/celulares', rotasCelulares)
rotas.use('/cftv', rotasCftv)
rotas.use('/computadores', rotasComputadores)
rotas.use('/dashboard', rotasDashboard)
rotas.use('/equipamentos', rotasEquipamentos)
rotas.use('/localizacoes', rotasLocalizacoes)
rotas.use('/mapeamento-rede', rotasMapeamentoRede)
rotas.use('/opcoes', rotasOpcoes)
rotas.use('/switches', rotasSwitches)
rotas.use('/usuarios', rotasUsuarios)

export default rotas
