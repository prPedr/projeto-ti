import type { Database as TipoBanco } from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pastaMigracoes = path.resolve(__dirname, 'migrations')

interface RegistroMigracao {
  nome: string
}

export function garantirTabelaControle(banco: TipoBanco): void {
  banco.exec(`
    CREATE TABLE IF NOT EXISTS migracoes_aplicadas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      aplicada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

export function listarArquivosMigracoes(): string[] {
  if (!fs.existsSync(pastaMigracoes)) {
    return []
  }

  return fs
    .readdirSync(pastaMigracoes)
    .filter((nome) => nome.endsWith('.sql'))
    .sort()
}

/**
 * Marca todas as migrações existentes como já aplicadas sem executar o SQL
 * delas. Usado por setup.ts: um banco novo, criado a partir do schema.sql
 * atual, já nasce com tudo que as migrações fariam.
 */
export function marcarTodasComoAplicadas(banco: TipoBanco): void {
  garantirTabelaControle(banco)

  const inserir = banco.prepare('INSERT OR IGNORE INTO migracoes_aplicadas (nome) VALUES (?)')

  for (const arquivo of listarArquivosMigracoes()) {
    inserir.run(arquivo)
  }
}

export function rodarMigracoes(banco: TipoBanco): void {
  garantirTabelaControle(banco)

  const jaAplicadas = new Set(
    (banco.prepare('SELECT nome FROM migracoes_aplicadas').all() as RegistroMigracao[]).map(
      (registro) => registro.nome,
    ),
  )

  const aplicarMigracao = banco.transaction((sql: string, nome: string) => {
    banco.exec(sql)
    banco.prepare('INSERT INTO migracoes_aplicadas (nome) VALUES (?)').run(nome)
  })

  for (const arquivo of listarArquivosMigracoes()) {
    if (jaAplicadas.has(arquivo)) {
      continue
    }

    const caminho = path.join(pastaMigracoes, arquivo)
    const sql = fs.readFileSync(caminho, 'utf8')

    try {
      aplicarMigracao(sql, arquivo)
      console.log(`Migração aplicada: ${arquivo}`)
    } catch (erro) {
      console.error(`Falha ao aplicar a migração "${arquivo}". Nenhuma alteração dela foi mantida (rollback automático).`)
      throw erro
    }
  }
}
