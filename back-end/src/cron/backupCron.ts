import cron from 'node-cron'
import { realizarBackup } from '../services/backupService.js'

export const iniciarRotinasCron = () => {
  cron.schedule('0 2 * * *', async () => {
    await realizarBackup()
  })

  console.log('Rotina de backup automático inicializada (todos os dias às 02:00).')
}
