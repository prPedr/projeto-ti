import Database from 'better-sqlite3'
import type { Database as TipoBanco } from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'
import { rodarMigracoes } from '../database/migrator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const esquemaSqlPath = path.resolve(__dirname, '../database/schema.sql')

describe('Migração 0006 - Separação NVR/CAMERA e Tabela canais_nvr', () => {
  it('Banco novo via schema.sql cria tabelas e CHECK atualizados', () => {
    const banco: TipoBanco = new Database(':memory:')
    const esquemaSql = fs.readFileSync(esquemaSqlPath, 'utf8')
    banco.exec(esquemaSql)

    // PRAGMA table_info em opcoes_predefinidas
    const colunasOpcoes = banco.prepare("PRAGMA table_info('opcoes_predefinidas')").all() as Array<{ name: string; type: string }>
    const nomesOpcoes = colunasOpcoes.map((c) => c.name)
    expect(nomesOpcoes).toContain('tipo_equipamento')

    // PRAGMA table_info em canais_nvr
    const colunasCanais = banco.prepare("PRAGMA table_info('canais_nvr')").all() as Array<{ name: string; type: string }>
    const nomesCanais = colunasCanais.map((c) => c.name)
    expect(nomesCanais).toContain('nvr_id')
    expect(nomesCanais).toContain('numero_canal')
    expect(nomesCanais).toContain('camera_conectada_id')
    expect(nomesCanais).toContain('descricao')

    // Testar aceitação de 'NVR' e 'CAMERA' em opcoes_predefinidas
    banco.prepare("INSERT INTO opcoes_predefinidas (categoria, valor, tipo_equipamento) VALUES ('MARCA', 'Intelbras', 'NVR')").run()
    banco.prepare("INSERT INTO opcoes_predefinidas (categoria, valor, tipo_equipamento) VALUES ('MARCA', 'Hikvision', 'CAMERA')").run()

    const registros = banco.prepare("SELECT * FROM opcoes_predefinidas WHERE tipo_equipamento IN ('NVR', 'CAMERA')").all()
    expect(registros.length).toBe(2)
  })

  it('Banco existente aplicando migração 0006 converte NVR_CAMERA para NVR e cria canais_nvr', () => {
    const banco: TipoBanco = new Database(':memory:')
    banco.exec(`
      CREATE TABLE usuarios_sistema (id INTEGER PRIMARY KEY);
      CREATE TABLE localizacoes (id INTEGER PRIMARY KEY);
      CREATE TABLE opcoes_predefinidas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria TEXT NOT NULL,
        valor TEXT NOT NULL,
        dependencia_id INTEGER DEFAULT NULL,
        tipo_equipamento TEXT CHECK (tipo_equipamento IN ('COMPUTADOR', 'SWITCH', 'CELULAR', 'NVR_CAMERA'))
      );
      INSERT INTO opcoes_predefinidas (categoria, valor, tipo_equipamento) VALUES ('MARCA', 'Intelbras', 'NVR_CAMERA');
      CREATE TABLE equipamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria TEXT NOT NULL CHECK (categoria IN ('COMPUTADOR', 'SWITCH', 'CELULAR', 'NVR', 'CAMERA', 'IMPRESSORA', 'ANTENA')),
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
        ('0004_add_impressoras.sql'),
        ('0005_add_antena.sql');
    `)

    rodarMigracoes(banco)

    // Confirma que NVR_CAMERA virou NVR
    const antigoConvertido = banco.prepare("SELECT * FROM opcoes_predefinidas WHERE valor = 'Intelbras'").get() as any
    expect(antigoConvertido.tipo_equipamento).toBe('NVR')

    // Confirma que canais_nvr existe
    const canaisInfo = banco.prepare("PRAGMA table_info('canais_nvr')").all()
    expect(canaisInfo.length).toBeGreaterThan(0)
  })
})
