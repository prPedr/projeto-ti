import { Router } from 'express'
import { criar, listar, listarPortas, atualizarPorta } from '../controllers/switchesController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { switchSchema } from '../schemas/equipamentosSchema.js'
import { atualizarPortaSchema, listarPortasSchema } from '../schemas/portasSwitchSchema.js'

const rotasSwitches = Router()

rotasSwitches.get('/', autenticar, listar)
rotasSwitches.post('/', autenticar, validarSchema(switchSchema), criar)

// Rotas de portas
rotasSwitches.get('/:id/portas', autenticar, validarSchema(listarPortasSchema), listarPortas)
rotasSwitches.put('/:id/portas/:numeroPorta', autenticar, validarSchema(atualizarPortaSchema), atualizarPorta)

export default rotasSwitches
