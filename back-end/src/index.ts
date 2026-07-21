import 'dotenv/config'
import { iniciarRotinasCron } from './cron/backupCron.js'
import app from './app.js'

const porta = process.env.PORT ?? 3000

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`)
})

iniciarRotinasCron()
