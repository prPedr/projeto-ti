import Database from 'better-sqlite3'
import type { Database as TipoBanco } from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'
import { rodarMigracoes } from '../database/migrator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const esquemaSqlPath = path.resolve(__dirname, '../database/schema.sql')

describe('Categoria ANTENA - validação de schema e migração', () => {
  it('Banco novo via schema.sql aceita a categoria ANTENA no CHECK constraint', () => {
    const banco: TipoBanco = new Database(':memory:')
    const esquemaSql = fs.readFileSync(esquemaSqlPath, 'utf8')
    banco.exec(esquemaSql)

    // Insere usuário e localização para FKs
    banco.exec(`
      INSERT INTO usuarios_sistema (nome, email, senha_hash, perfil) VALUES ('Admin', 'admin@test.com', 'hash', 'ADMIN');
      INSERT INTO localizacoes (filial, predio, sala) VALUES ('Matriz', 'Bloco A', 'TI');
    `)

    // Insere um equipamento com categoria ANTENA
    const stmt = banco.prepare(`
      INSERT INTO equipamentos (categoria, nome, marca, modelo, status, localizacao_id, cadastrado_por)
      VALUES ('ANTENA', 'Antena Setorial 01', 'Ubiquiti', 'LiteAP AC', 'ATIVO', 1, 1)
    `)
    const result = stmt.run()
    expect(result.changes).toBe(1)

    const equipamento = banco.prepare('SELECT * FROM equipamentos WHERE id = ?').get(result.lastInsertRowid) as any
    expect(equipamento.categoria).toBe('ANTENA')
    expect(equipamento.marca).toBe('Ubiquiti')
    expect(equipamento.modelo).toBe('LiteAP AC')

    // Confirma schema via PRAGMA table_info e DDL
    const colunas = banco.prepare("PRAGMA table_info('equipamentos')").all() as Array<{ name: string; type: string }>
    const nomesColunas = colunas.map(c => c.name)
    expect(nomesColunas).toContain('categoria')
    expect(nomesColunas).toContain('marca')
    expect(nomesColunas).toContain('modelo')

    // Tentar inserir categoria inválida deve falhar pelo CHECK constraint
    expect(() => {
      banco.prepare(`
        INSERT INTO equipamentos (categoria, marca, modelo, status, cadastrado_por)
        VALUES ('CATEGORIA_INVALIDA', 'Marca', 'Modelo', 'ATIVO', 1)
      `).run()
    }).toThrow(/CHECK constraint failed/)
  })

  it('Banco existente migrado via 0005_add_antena.sql aceita a categoria ANTENA', () => {
    const banco: TipoBanco = new Database(':memory:')
    banco.exec(`
      CREATE TABLE usuarios_sistema (id INTEGER PRIMARY KEY);
      INSERT INTO usuarios_sistema (id) VALUES (1);
      CREATE TABLE localizacoes (id INTEGER PRIMARY KEY);
      CREATE TABLE equipamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria TEXT NOT NULL CHECK (categoria IN ('COMPUTADOR', 'SWITCH', 'CELULAR', 'NVR', 'CAMERA', 'IMPRESSORA')),
        nome TEXT,
        marca TEXT NOT NULL DEFAULT 'Generica',
        modelo TEXT NOT NULL DEFAULT 'Modelo',
        status TEXT NOT NULL DEFAULT 'ATIVO',
        localizacao_id INTEGER,
        fornecedor TEXT,
        data_garantia DATE,
        observacao TEXT,
        cadastrado_por INTEGER NOT NULL DEFAULT 1,
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_descarte DATETIME DEFAULT NULL
      );
      CREATE TABLE migracoes_aplicadas (id INTEGER PRIMARY KEY, nome TEXT UNIQUE, aplicada_em TEXT);
      INSERT INTO migracoes_aplicadas (nome) VALUES 
        ('0001_add_tipo_equipamento_opcoes.sql'),
        ('0002_add_portas_switch.sql'),
        ('0003_remove_portas_em_uso.sql'),
        ('0004_add_impressoras.sql');
    `)

    rodarMigracoes(banco)

    const stmt = banco.prepare(`
      INSERT INTO equipamentos (categoria, nome, marca, modelo, status, cadastrado_por)
      VALUES ('ANTENA', 'Antena Wi-Fi 5GHz', 'MikroTik', 'SXT SQ 5', 'ATIVO', 1)
    `)
    const result = stmt.run()
    expect(result.changes).toBe(1)

    const row = banco.prepare('SELECT * FROM equipamentos WHERE id = ?').get(result.lastInsertRowid) as any
    expect(row.categoria).toBe('ANTENA')
  })
})
