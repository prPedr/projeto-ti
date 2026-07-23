import Database from "better-sqlite3"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { marcarTodasComoAplicadas } from "./migrator.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const caminhoBanco = path.resolve(__dirname, "app.db")

if (fs.existsSync(caminhoBanco)) {
  console.log("app.db já existe — setup.ts só cria bancos novos, nada a fazer.")
  console.log("Para aplicar mudanças de schema num banco existente, rode o servidor normalmente (npm run dev): as migrações pendentes em database/migrations/ são aplicadas automaticamente.")
  process.exit(0)
}

const banco = new Database(caminhoBanco, { verbose: console.log })

const caminhoEsquema = path.resolve(__dirname, "schema.sql")
const esquemaSql = fs.readFileSync(caminhoEsquema, "utf8")

banco.exec(esquemaSql)
console.log("Banco de dados criado a partir de schema.sql.")

// Um banco novo já nasce com tudo que as migrações fariam — marca todas
// como aplicadas em vez de rodar os ALTER TABLEs de novo por cima.
marcarTodasComoAplicadas(banco)
console.log("Migrações existentes marcadas como já aplicadas.")

banco.close()
console.log("Conectado ao banco de dados.")
