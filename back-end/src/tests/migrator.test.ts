import Database from 'better-sqlite3'
import type { Database as TipoBanco } from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it, vi } from 'vitest'
import {
  garantirTabelaControle,
  listarArquivosMigracoes,
  marcarTodasComoAplicadas,
  rodarMigracoes,
} from '../database/migrator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pastaMigracoes = path.resolve(__dirname, '../database/migrations')

describe('migrator - sistema de migrações', () => {
  it('TESTE 1: Rodar migrations pela primeira vez aplica tudo', () => {
    const banco: TipoBanco = new Database(':memory:')
    // Cria o estado inicial das tabelas do banco antes da aplicação das migrações
    banco.exec(`
      CREATE TABLE opcoes_predefinidas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria TEXT NOT NULL,
        valor TEXT NOT NULL,
        dependencia_id INTEGER DEFAULT NULL
      );
      CREATE TABLE equipamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria TEXT NOT NULL
      );
      CREATE TABLE eq_switches (
        equipamento_id INTEGER PRIMARY KEY,
        numero_portas INTEGER,
        firmware TEXT,
        vlans_configuradas TEXT,
        portas_em_uso INTEGER
      );
    `)

    rodarMigracoes(banco)

    const migracoesAplicadas = banco
      .prepare('SELECT nome FROM migracoes_aplicadas')
      .all() as Array<{ nome: string }>

    const arquivosReais = fs
      .readdirSync(pastaMigracoes)
      .filter((file) => file.endsWith('.sql'))

    expect(migracoesAplicadas.length).toBe(arquivosReais.length)
    expect(migracoesAplicadas.map((m) => m.nome).sort()).toEqual(arquivosReais.sort())

    // Confirma que a coluna tipo_equipamento foi realmente adicionada pela migração 0001
    const colunas = banco.prepare("PRAGMA table_info('opcoes_predefinidas')").all() as Array<{ name: string }>
    expect(colunas.some((c) => c.name === 'tipo_equipamento')).toBe(true)
  })

  it('TESTE 2: Rodar migrations de novo não reaplica nada (idempotência)', () => {
    const banco: TipoBanco = new Database(':memory:')
    banco.exec(`
      CREATE TABLE opcoes_predefinidas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria TEXT NOT NULL,
        valor TEXT NOT NULL,
        dependencia_id INTEGER DEFAULT NULL
      );
      CREATE TABLE equipamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria TEXT NOT NULL
      );
      CREATE TABLE eq_switches (
        equipamento_id INTEGER PRIMARY KEY,
        numero_portas INTEGER,
        firmware TEXT,
        vlans_configuradas TEXT,
        portas_em_uso INTEGER
      );
    `)

    rodarMigracoes(banco)

    const arquivosReais = listarArquivosMigracoes()

    expect(() => rodarMigracoes(banco)).not.toThrow()

    const totalAplicadas = banco
      .prepare('SELECT COUNT(*) as total FROM migracoes_aplicadas')
      .get() as { total: number }

    expect(totalAplicadas.total).toBe(arquivosReais.length)
  })

  it('TESTE 3: marcarTodasComoAplicadas insere registros sem executar o SQL das tabelas', () => {
    const banco: TipoBanco = new Database(':memory:')
    marcarTodasComoAplicadas(banco)

    const arquivosReais = listarArquivosMigracoes()
    const migracoesAplicadas = banco
      .prepare('SELECT nome FROM migracoes_aplicadas')
      .all() as Array<{ nome: string }>

    expect(migracoesAplicadas.length).toBe(arquivosReais.length)

    // Confirma que nenhuma das tabelas reais foi criada (já que schema.sql não rodou)
    expect(() => {
      banco.prepare('SELECT * FROM opcoes_predefinidas').all()
    }).toThrow(/no such table/)
  })

  it('TESTE 4: Migração com erro de SQL não é marcada como aplicada (rollback correto)', () => {
    const banco: TipoBanco = new Database(':memory:')
    garantirTabelaControle(banco)

    const spyReaddir = vi.spyOn(fs, 'readdirSync').mockImplementation((p: any) => {
      if (typeof p === 'string' && p.endsWith('migrations')) {
        return ['9999_teste_invalido.sql'] as any
      }
      return fs.readdirSync(p)
    })

    const spyReadfile = vi.spyOn(fs, 'readFileSync').mockImplementation((p: any, options: any) => {
      if (typeof p === 'string' && p.endsWith('9999_teste_invalido.sql')) {
        return 'EXPRESSAO_SQL_TOTALMENTE_INVALIDA_COM_ERRO;'
      }
      return fs.readFileSync(p, options)
    })

    try {
      expect(() => rodarMigracoes(banco)).toThrow()

      const pendente = banco
        .prepare("SELECT * FROM migracoes_aplicadas WHERE nome = '9999_teste_invalido.sql'")
        .all()

      expect(pendente.length).toBe(0)
    } finally {
      spyReaddir.mockRestore()
      spyReadfile.mockRestore()
    }
  })
})
