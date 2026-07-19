import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'
import { tratadorDeErros } from './middlewares/errorHandler.js'
import rotas from './routes/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const caminhoDaPastaUploads = path.resolve(__dirname, '../uploads')

const origemPermitida = process.env.FRONTEND_URL ?? 'http://localhost:5173'

const app = express()

app.use(helmet())
app.use(cors({ origin: origemPermitida }))
app.use(express.json())
app.use('/uploads', express.static(caminhoDaPastaUploads))
app.use('/api', rotas)

// Precisa ser o último app.use: captura os erros lançados nas rotas/services
app.use(tratadorDeErros)

export default app
