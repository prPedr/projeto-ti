import Database from 'better-sqlite3'
import express from 'express'
import request from 'supertest'
import { beforeAll, describe, expect, it, vi } from 'vitest'

// Mocking connection to run tests in-memory
vi.mock('../database/conexao.js', () => {
  const db = new Database(':memory:')
  const fs = awaitRef('fs')
  return { default: db }
})

async function awaitRef(mod: string) {
  return await import(mod)
}

describe('POST /antenas Endpoint', () => {
  let app: express.Application
  let token: string

  beforeAll(async () => {
    const { default: db } = await import('../database/conexao.js')
    const fs = await import('fs')
    const path = await import('path')
    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../database/schema.sql'), 'utf8')
    db.exec(schemaSql)

    // Insere dados iniciais
    db.exec(`
      INSERT INTO usuarios_sistema (id, nome, email, senha_hash, perfil) VALUES (1, 'Admin', 'admin@test.com', 'hash', 'ADMIN');
      INSERT INTO localizacoes (id, filial, predio, sala) VALUES (1, 'Matriz', 'Bloco A', 'TI');
    `)

    const { default: rotas } = await import('../routes/index.js')
    const jwt = await import('jsonwebtoken')

    token = jwt.default.sign({ id: 1, perfil: 'ADMIN' }, process.env.JWT_SECRET || 'segredo_jwt_padrao_para_desenvolvimento')

    app = express()
    app.use(express.json())
    app.use('/api', rotas)
  })

  it('Cria uma antena com sucesso quando enviada interface com IP', async () => {
    const resposta = await request(app)
      .post('/api/antenas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mestre: {
          categoria: 'ANTENA',
          marca: 'Ubiquiti',
          modelo: 'UniFi AC LR',
          status: 'ATIVO',
          localizacao_id: 1,
          nome: 'AP Recepção',
        },
        interfaces: [
          {
            nome_interface: 'Ethernet / Wi-Fi',
            ip: '192.168.1.100',
            mac: '00:11:22:33:44:55',
          },
        ],
      })

    expect(resposta.status).toBe(201)
    expect(resposta.body.sucesso).toBe(true)
    expect(resposta.body.id_equipamento).toBeDefined()
  })

  it('Rejeita criação de antena sem interface ou sem IP preenchido (validação de schema)', async () => {
    const resposta = await request(app)
      .post('/api/antenas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mestre: {
          categoria: 'ANTENA',
          marca: 'Ubiquiti',
          modelo: 'UniFi AC LR',
          status: 'ATIVO',
          localizacao_id: 1,
        },
        interfaces: [
          {
            nome_interface: 'Ethernet',
            // Sem IP
          },
        ],
      })

    expect(resposta.status).toBe(400)
    expect(resposta.body.sucesso).toBe(false)
  })
})
