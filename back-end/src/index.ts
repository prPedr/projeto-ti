import 'dotenv/config'
import { iniciarRotinasCron } from './cron/backupCron.js'
import banco from './database/conexao.js'
import { rodarMigracoes } from './database/migrator.js'
import app from './app.js'

rodarMigracoes(banco)

const porta = process.env.PORT ?? 3000

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`)
})

iniciarRotinasCron()
