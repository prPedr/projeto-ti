import { Router } from 'express'
import { resumo } from '../controllers/dashboardController.js'
import { autenticar } from '../middlewares/authMiddleware.js'

const rotasDashboard = Router()

rotasDashboard.get('/', autenticar, resumo)

export default rotasDashboard
