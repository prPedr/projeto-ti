import { Router } from 'express'
import { criar } from '../controllers/camerasController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { cameraSchema } from '../schemas/equipamentosSchema.js'

const rotasCameras = Router()

rotasCameras.post('/', autenticar, validarSchema(cameraSchema), criar)

export default rotasCameras
