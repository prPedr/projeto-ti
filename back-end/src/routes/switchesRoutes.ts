import { Router } from 'express'
import { criar } from '../controllers/switchesController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { switchSchema } from '../schemas/equipamentosSchema.js'

const rotasSwitches = Router()

rotasSwitches.post('/', autenticar, validarSchema(switchSchema), criar)

export default rotasSwitches
