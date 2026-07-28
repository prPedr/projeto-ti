import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import app from '../app.js'
import banco from '../database/conexao.js'
import { limparBancoDeTeste, prepararBancoDeTeste } from './setup.js'

function gerarTokenTeste(id: number, perfil: string): string {
  const secret = process.env.JWT_SECRET || 'segredo_de_teste_para_vitest_123'
  return jwt.sign({ id, perfil }, secret, { expiresIn: '8h' })
}

describe('Autorização por perfil (ADMIN vs TECNICO)', () => {
  let adminId: number
  let tokenAdmin: string
  let tecnicoId: number
  let tokenTecnico: string

  beforeAll(() => {
    prepararBancoDeTeste()
  })

  beforeEach(async () => {
    limparBancoDeTeste()

    const senhaHash = await bcrypt.hash('senha123', 10)

    const resAdmin = banco
      .prepare(`
        INSERT INTO usuarios_sistema (nome, email, senha_hash, perfil)
        VALUES ('Admin Teste', 'admin@teste.com', ?, 'ADMIN')
      `)
      .run(senhaHash)
    adminId = Number(resAdmin.lastInsertRowid)
    tokenAdmin = gerarTokenTeste(adminId, 'ADMIN')

    const resTecnico = banco
      .prepare(`
        INSERT INTO usuarios_sistema (nome, email, senha_hash, perfil)
        VALUES ('Tecnico Teste', 'tecnico@teste.com', ?, 'TECNICO')
      `)
      .run(senhaHash)
    tecnicoId = Number(resTecnico.lastInsertRowid)
    tokenTecnico = gerarTokenTeste(tecnicoId, 'TECNICO')
  })

  it('TESTE 1: Usuário comum (TECNICO) NÃO pode criar opção -> 403', async () => {
    const resposta = await request(app)
      .post('/api/opcoes')
      .set('Authorization', `Bearer ${tokenTecnico}`)
      .send({
        categoria: 'MARCA',
        valor: 'Dell',
        tipo_equipamento: 'COMPUTADOR',
      })

    expect(resposta.status).toBe(403)
    expect(resposta.body.sucesso).toBe(false)
  })

  it('TESTE 2: Usuário ADMIN pode criar opção -> 201', async () => {
    const resposta = await request(app)
      .post('/api/opcoes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        categoria: 'MARCA',
        valor: 'Dell',
        tipo_equipamento: 'COMPUTADOR',
      })

    expect(resposta.status).toBe(201)
    expect(resposta.body.sucesso).toBe(true)
  })

  it('TESTE 3: Sem token nenhum -> 401', async () => {
    const resposta = await request(app)
      .post('/api/opcoes')
      .send({
        categoria: 'MARCA',
        valor: 'Dell',
        tipo_equipamento: 'COMPUTADOR',
      })

    expect(resposta.status).toBe(401)
    expect(resposta.body.sucesso).toBe(false)
  })

  it('TESTE 4a: Usuário comum bloqueado (403) e ADMIN permitido (201) em POST /api/localizacoes', async () => {
    const bloqueado = await request(app)
      .post('/api/localizacoes')
      .set('Authorization', `Bearer ${tokenTecnico}`)
      .send({ filial: 'Matriz', predio: 'Bloco A' })

    expect(bloqueado.status).toBe(403)

    const permitido = await request(app)
      .post('/api/localizacoes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ filial: 'Matriz', predio: 'Bloco A' })

    expect(permitido.status).toBe(201)
  })

  it('TESTE 4b: Usuário comum bloqueado (403) e ADMIN permitido (201) em POST /api/usuarios', async () => {
    const bloqueado = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenTecnico}`)
      .send({
        nome: 'Novo Usr',
        email: 'novo@teste.com',
        senha: 'senha12345',
        perfil: 'TECNICO',
      })

    expect(bloqueado.status).toBe(403)

    const permitido = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Novo Usr',
        email: 'novo@teste.com',
        senha: 'senha12345',
        perfil: 'TECNICO',
      })

    expect(permitido.status).toBe(201)
  })

  it('TESTE 5: Leitura (GET /api/opcoes) continua liberada pra qualquer autenticado -> 200', async () => {
    const resposta = await request(app)
      .get('/api/opcoes')
      .set('Authorization', `Bearer ${tokenTecnico}`)

    expect(resposta.status).toBe(200)
    expect(resposta.body.sucesso).toBe(true)
  })
})
