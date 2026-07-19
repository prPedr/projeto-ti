import { Router } from 'express'
import { uploadAnexo } from '../controllers/anexosController.js'
import { listar } from '../controllers/equipamentosController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { upload } from '../middlewares/uploadMiddleware.js'

const rotasEquipamentos = Router()

rotasEquipamentos.get('/', listar)
rotasEquipamentos.post('/:id/anexos', autenticar, upload.single('arquivo'), uploadAnexo)

export default rotasEquipamentos
