import { Router } from 'express'
import { listar } from '../controllers/equipamentosController.js'

const rotasEquipamentos = Router()

rotasEquipamentos.get('/', listar)

export default rotasEquipamentos
