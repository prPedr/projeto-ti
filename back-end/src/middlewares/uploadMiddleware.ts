import { Request } from 'express'
import crypto from 'crypto'
import fs from 'fs'
import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pastaUploads = path.resolve(__dirname, '../../uploads')

if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, { recursive: true })
}

const extensoesPermitidas: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
}

const armazenamento = multer.diskStorage({
  destination: (_requisicao, _arquivo, callback) => {
    callback(null, pastaUploads)
  },
  filename: (_requisicao, arquivo, callback) => {
    const extensao = extensoesPermitidas[arquivo.mimetype] ?? ''
    const nomeAleatorio = crypto.randomBytes(16).toString('hex')
    callback(null, `${Date.now()}-${nomeAleatorio}${extensao}`)
  },
})

const tiposPermitidos = Object.keys(extensoesPermitidas)

const filtroArquivo = (_requisicao: Request, arquivo: Express.Multer.File, callback: FileFilterCallback) => {
  if (!tiposPermitidos.includes(arquivo.mimetype)) {
    callback(new Error('Tipo de arquivo não suportado. Envie apenas PDF, JPEG ou PNG.'))
    return
  }

  callback(null, true)
}

export const upload = multer({
  storage: armazenamento,
  fileFilter: filtroArquivo,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
})
