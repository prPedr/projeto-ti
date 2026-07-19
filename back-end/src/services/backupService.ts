import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import banco from '../database/conexao.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pastaBackups = path.resolve(__dirname, '../../backups')

const gerarNomeArquivo = (): string => {
  const agora = new Date()
  const doisDigitos = (valor: number) => String(valor).padStart(2, '0')

  const ano = agora.getFullYear()
  const mes = doisDigitos(agora.getMonth() + 1)
  const dia = doisDigitos(agora.getDate())
  const hora = doisDigitos(agora.getHours())
  const minuto = doisDigitos(agora.getMinutes())

  return `backup-${ano}-${mes}-${dia}-${hora}-${minuto}.db`
}

export const realizarBackup = async (): Promise<void> => {
  if (!fs.existsSync(pastaBackups)) {
    fs.mkdirSync(pastaBackups, { recursive: true })
  }

  const caminhoCompletoDoArquivo = path.join(pastaBackups, gerarNomeArquivo())

  try {
    await banco.backup(caminhoCompletoDoArquivo)
    console.log(`Backup realizado com sucesso: ${caminhoCompletoDoArquivo}`)
  } catch (erro) {
    console.log(`Falha ao realizar backup: ${(erro as Error).message}`)
  }
}
