import Database from 'better-sqlite3'
import type { Database as TipoBanco } from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const nomeArquivo = process.env.NODE_ENV === 'test' ? 'test.db' : 'app.db'
const caminhoBanco = path.resolve(__dirname, nomeArquivo)

const banco: TipoBanco = new Database(caminhoBanco)

banco.pragma('foreign_keys = ON')
banco.pragma('journal_mode = WAL')

export default banco
