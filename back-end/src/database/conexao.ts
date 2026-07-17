import Database from 'better-sqlite3'
import type { Database as TipoBanco } from 'better-sqlite3'
import path from 'path'

const caminhoBanco = path.resolve(__dirname, 'app.db')

const banco: TipoBanco = new Database(caminhoBanco)

banco.pragma('foreign_keys = ON')
banco.pragma('journal_mode = WAL')

export default banco
