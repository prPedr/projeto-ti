import { Router } from 'express'
import { listar } from '../controllers/mapeamentoRedeController.js'
import { autenticar } from '../middlewares/authMiddleware.js'

const rotasMapeamentoRede = Router()

rotasMapeamentoRede.get('/', autenticar, listar)

export default rotasMapeamentoRede
