import { Router } from 'express'
import { listar, listarSwitches } from '../controllers/mapeamentoRedeController.js'
import { autenticar } from '../middlewares/authMiddleware.js'

const rotasMapeamentoRede = Router()

rotasMapeamentoRede.get('/', autenticar, listar)
rotasMapeamentoRede.get('/switches', autenticar, listarSwitches)

export default rotasMapeamentoRede
