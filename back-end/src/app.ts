import express from 'express'
import cors from 'cors'
import rotas from './routes/index.js'
import { tratadorDeErros } from './middlewares/errorHandler.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', rotas)

// Precisa ser o último app.use: captura os erros lançados nas rotas/services
app.use(tratadorDeErros)

export default app
