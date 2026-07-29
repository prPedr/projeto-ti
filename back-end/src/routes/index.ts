import { Router } from 'express'
import rotasAntenas from './antenasRoutes.js'
import rotasAuth from './authRoutes.js'
import rotasCameras from './camerasRoutes.js'
import rotasCelulares from './celularesRoutes.js'
import rotasComputadores from './computadoresRoutes.js'
import rotasDashboard from './dashboardRoutes.js'
import rotasEquipamentos from './equipamentosRoutes.js'
import rotasImpressoras from './impressorasRoutes.js'
import rotasLocalizacoes from './localizacoesRoutes.js'
import rotasMapeamentoRede from './mapeamentoRedeRoutes.js'
import rotasNvrs from './nvrsRoutes.js'
import rotasOpcoes from './opcoesRoutes.js'
import rotasSwitches from './switchesRoutes.js'
import rotasUsuarios from './usuariosRoutes.js'

const rotas = Router()

rotas.use('/antenas', rotasAntenas)
rotas.use('/auth', rotasAuth)
rotas.use('/cameras', rotasCameras)
rotas.use('/celulares', rotasCelulares)
rotas.use('/computadores', rotasComputadores)
rotas.use('/dashboard', rotasDashboard)
rotas.use('/equipamentos', rotasEquipamentos)
rotas.use('/impressoras', rotasImpressoras)
rotas.use('/localizacoes', rotasLocalizacoes)
rotas.use('/mapeamento-rede', rotasMapeamentoRede)
rotas.use('/nvrs', rotasNvrs)
rotas.use('/opcoes', rotasOpcoes)
rotas.use('/switches', rotasSwitches)
rotas.use('/usuarios', rotasUsuarios)

export default rotas
