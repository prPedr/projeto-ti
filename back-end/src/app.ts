import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import rotas from './routes/index.js'
import { tratadorDeErros } from './middlewares/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const caminhoDaPastaUploads = path.resolve(__dirname, '../uploads')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(caminhoDaPastaUploads))
app.use('/api', rotas)

// Precisa ser o último app.use: captura os erros lançados nas rotas/services
app.use(tratadorDeErros)

export default app
