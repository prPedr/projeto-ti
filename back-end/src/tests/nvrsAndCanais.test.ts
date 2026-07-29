import Database from 'better-sqlite3'
import express from 'express'
import request from 'supertest'
import { beforeAll, describe, expect, it, vi } from 'vitest'

// Mocking connection to run tests in-memory
vi.mock('../database/conexao.js', () => {
  const db = new Database(':memory:')
  return { default: db }
})

describe('End-to-End NVRs e Câmeras (Migração 0007, Serviços e Canais)', () => {
  let app: express.Application
  let token: string
  let idNvr: number
  let idCamera: number
  let idComputador: number

  beforeAll(async () => {
    const { default: db } = await import('../database/conexao.js')
    const fs = await import('fs')
    const path = await import('path')
    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../database/schema.sql'), 'utf8')
    db.exec(schemaSql)

    // Insere dados de apoio (usuário e localização)
    db.exec(`
      INSERT INTO usuarios_sistema (id, nome, email, senha_hash, perfil) VALUES (1, 'Admin', 'admin@test.com', 'hash', 'ADMIN');
      INSERT INTO localizacoes (id, filial, predio, sala) VALUES (1, 'Matriz', 'Bloco A', 'TI');
    `)

    const { default: rotas } = await import('../routes/index.js')
    const { tratadorDeErros } = await import('../middlewares/errorHandler.js')
    const jwt = await import('jsonwebtoken')

    token = jwt.default.sign({ id: 1, perfil: 'ADMIN' }, process.env.JWT_SECRET || 'segredo_jwt_padrao_para_desenvolvimento')

    app = express()
    app.use(express.json())
    app.use('/api', rotas)
    app.use(tratadorDeErros)
  })

  it('Cadastra um NVR com quantidade_canais = 8', async () => {
    const resposta = await request(app)
      .post('/api/nvrs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mestre: {
          categoria: 'NVR',
          marca: 'Intelbras',
          modelo: 'NVD 3116',
          status: 'ATIVO',
          localizacao_id: 1,
          nome: 'NVR Portaria Principal',
        },
        detalhe: {
          quantidade_canais: 8,
          capacidade_armazenamento: 'HD 4TB',
          firmware: 'v2.1',
        },
        interfaces: [
          {
            nome_interface: 'LAN 1',
            ip: '192.168.1.200',
            mac: '00:11:22:33:44:00',
          },
        ],
      })

    expect(resposta.status).toBe(201)
    expect(resposta.body.sucesso).toBe(true)
    expect(resposta.body.id_equipamento).toBeDefined()
    idNvr = resposta.body.id_equipamento
  })

  it('Cadastra uma Câmera e um Computador', async () => {
    // Cadastrar Câmera
    const resCam = await request(app)
      .post('/api/cameras')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mestre: {
          categoria: 'CAMERA',
          marca: 'Intelbras',
          modelo: 'VIP 3230',
          status: 'ATIVO',
          localizacao_id: 1,
          nome: 'Câmera Entrada 1',
        },
        detalhe: {
          resolucao: '1080p',
          firmware: 'v1.0',
        },
        interfaces: [
          {
            nome_interface: 'Ethernet',
            ip: '192.168.1.201',
          },
        ],
      })

    expect(resCam.status).toBe(201)
    idCamera = resCam.body.id_equipamento

    // Cadastrar Computador
    const resComp = await request(app)
      .post('/api/computadores')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mestre: {
          categoria: 'COMPUTADOR',
          marca: 'Dell',
          modelo: 'OptiPlex',
          status: 'ATIVO',
          localizacao_id: 1,
        },
        detalhe: {},
      })

    expect(resComp.status).toBe(201)
    idComputador = resComp.body.id_equipamento
  })

  it('Lista NVRs com contagem de canais_ocupados', async () => {
    const resposta = await request(app)
      .get('/api/nvrs')
      .set('Authorization', `Bearer ${token}`)

    expect(resposta.status).toBe(200)
    expect(resposta.body.sucesso).toBe(true)
    const nvr = resposta.body.dados.find((n: any) => n.id === idNvr)
    expect(nvr).toBeDefined()
    expect(nvr.quantidade_canais).toBe(8)
    expect(nvr.canais_ocupados).toBe(0)
  })

  it('Gerencia e lista os 8 canais do NVR dinamicamente', async () => {
    const resposta = await request(app)
      .get(`/api/nvrs/${idNvr}/canais`)
      .set('Authorization', `Bearer ${token}`)

    expect(resposta.status).toBe(200)
    expect(resposta.body.sucesso).toBe(true)
    expect(resposta.body.dados.length).toBe(8)
    expect(resposta.body.dados[0].numero_canal).toBe(1)
  })

  it('Rejeita conectar um COMPUTADOR a um canal do NVR (apenas CAMERA permitida)', async () => {
    const resposta = await request(app)
      .put(`/api/nvrs/${idNvr}/canais/1`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        camera_conectada_id: idComputador,
        descricao: 'Tentativa de conectar PC no NVR',
      })

    expect(resposta.status).toBe(400)
    expect(resposta.body.sucesso).toBe(false)
  })

  it('Conecta uma Câmera válida ao Canal 1 do NVR com sucesso', async () => {
    const resposta = await request(app)
      .put(`/api/nvrs/${idNvr}/canais/1`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        camera_conectada_id: idCamera,
        descricao: 'Câmera da Entrada 1 conectada no canal 1',
      })

    expect(resposta.status).toBe(200)
    expect(resposta.body.sucesso).toBe(true)

    // Verifica listagem de canais atualizada
    const resCanais = await request(app)
      .get(`/api/nvrs/${idNvr}/canais`)
      .set('Authorization', `Bearer ${token}`)

    const canal1 = resCanais.body.dados.find((c: any) => c.numero_canal === 1)
    expect(canal1.camera_conectada_id).toBe(idCamera)
    expect(canal1.conectado_categoria).toBe('CAMERA')
    expect(canal1.descricao).toBe('Câmera da Entrada 1 conectada no canal 1')

    // Verifica que listagem de NVRs mostra 1 canal ocupado
    const resNvrs = await request(app)
      .get('/api/nvrs')
      .set('Authorization', `Bearer ${token}`)

    const nvr = resNvrs.body.dados.find((n: any) => n.id === idNvr)
    expect(nvr.canais_ocupados).toBe(1)
  })
})
