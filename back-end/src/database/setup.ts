import Database from "better-sqlite3"
import fs from "fs"
import path from "path"

const caminhoBanco = path.resolve(__dirname, "app.db")

const banco = new Database(caminhoBanco, { verbose: console.log })

const caminhoEsquema = path.resolve(__dirname, "schema.sql")
const esquemaSql = fs.readFileSync(caminhoEsquema, "utf8")

banco.exec(esquemaSql)
console.log("Conectado ao banco de dados.")

banco.close()
