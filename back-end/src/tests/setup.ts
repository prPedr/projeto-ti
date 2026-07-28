import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import banco from '../database/conexao.js'
import { marcarTodasComoAplicadas } from '../database/migrator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function prepararBancoDeTeste() {
  const tabelaExistente = banco.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios_sistema'").get()
  if (!tabelaExistente) {
    const schemaSql = fs.readFileSync(
      path.resolve(__dirname, '../database/schema.sql'),
      'utf8',
    )
    banco.exec(schemaSql)
    marcarTodasComoAplicadas(banco)
  }
}

export function limparBancoDeTeste() {
  const tabelas = [
    'anexos',
    'portas_switch',
    'eq_cftv',
    'eq_celulares',
    'eq_switches',
    'eq_computadores',
    'interfaces_rede',
    'equipamentos',
    'opcoes_predefinidas',
    'localizacoes',
    'usuarios_sistema',
    'migracoes_aplicadas',
  ]

  const limpar = banco.transaction(() => {
    for (const tabela of tabelas) {
      banco.prepare(`DELETE FROM ${tabela}`).run()
    }
  })

  limpar()
}
