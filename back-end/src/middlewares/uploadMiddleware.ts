import { Request } from 'express'
import fs from 'fs'
import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pastaUploads = path.resolve(__dirname, '../../uploads')

if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, { recursive: true })
}

const armazenamento = multer.diskStorage({
  destination: (requisicao, arquivo, callback) => {
    callback(null, pastaUploads)
  },
  filename: (requisicao, arquivo, callback) => {
    const nomeUnico = `${Date.now()}-${arquivo.originalname}`
    callback(null, nomeUnico)
  },
})

const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png']

const filtroArquivo = (requisicao: Request, arquivo: Express.Multer.File, callback: FileFilterCallback) => {
  if (!tiposPermitidos.includes(arquivo.mimetype)) {
    callback(new Error('Tipo de arquivo não suportado. Envie apenas PDF, JPEG ou PNG.'))
    return
  }

  callback(null, true)
}

export const upload = multer({ storage: armazenamento, fileFilter: filtroArquivo })
