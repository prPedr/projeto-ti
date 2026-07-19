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

// helmet() aplica Cross-Origin-Resource-Policy: same-origin por padrão, o que
// bloqueia o front-end (outra origem) de carregar anexos via <img>/fetch. Como
// só essa rota serve arquivos pensados para consumo cross-origin, relaxamos
// a política apenas aqui, mantendo o resto da API na configuração estrita.
app.use('/uploads', helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }), express.static(caminhoDaPastaUploads))
app.use('/api', rotas)

// Precisa ser o último app.use: captura os erros lançados nas rotas/services
app.use(tratadorDeErros)

export default app
