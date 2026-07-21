import { Router } from 'express'
import { uploadAnexo } from '../controllers/anexosController.js'
import { descartar, listar, buscarPorId, atualizar } from '../controllers/equipamentosController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { upload } from '../middlewares/uploadMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { listarEquipamentosSchema } from '../schemas/equipamentosSchema.js'

const rotasEquipamentos = Router()

rotasEquipamentos.get('/', validarSchema(listarEquipamentosSchema), listar)
rotasEquipamentos.get('/:id', autenticar, buscarPorId)
rotasEquipamentos.put('/:id', autenticar, atualizar)
rotasEquipamentos.post('/:id/anexos', autenticar, upload.single('arquivo'), uploadAnexo)
rotasEquipamentos.delete('/:id', autenticar, descartar)

export default rotasEquipamentos
