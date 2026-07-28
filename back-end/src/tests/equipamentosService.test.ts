import { beforeEach, describe, expect, it } from 'vitest'
import banco from '../database/conexao.js'
import { atualizarEquipamento } from '../services/equipamentosService.js'
import { limparBancoDeTeste, prepararBancoDeTeste } from './setup.js'

describe('equipamentosService - atualização e proteção SQL Injection', () => {
  let usuarioId: number
  let eqId: number

  beforeEach(() => {
    prepararBancoDeTeste()
    limparBancoDeTeste()

    const resUser = banco
      .prepare(`
        INSERT INTO usuarios_sistema (nome, email, senha_hash, perfil)
        VALUES ('Admin', 'admin@teste.com', 'hash', 'ADMIN')
      `)
      .run()
    usuarioId = Number(resUser.lastInsertRowid)

    const resEq = banco
      .prepare(`
        INSERT INTO equipamentos (categoria, marca, modelo, status, observacao, cadastrado_por)
        VALUES ('COMPUTADOR', 'Dell', 'Latitude', 'ATIVO', 'Obs inicial', ?)
      `)
      .run(usuarioId)
    eqId = Number(resEq.lastInsertRowid)

    banco
      .prepare(`
        INSERT INTO eq_computadores (equipamento_id, usuario_alocado, processador)
        VALUES (?, 'João', 'Intel i7')
      `)
      .run(eqId)
  })

  it('TESTE 1: atualização de payload legítimo funciona corretamente', () => {
    atualizarEquipamento(eqId, {
      mestre: { observacao: 'Observação atualizada' },
    })

    const eq = banco
      .prepare('SELECT observacao, status FROM equipamentos WHERE id = ?')
      .get(eqId) as { observacao: string; status: string }

    expect(eq.observacao).toBe('Observação atualizada')
    expect(eq.status).toBe('ATIVO')
  })

  it('TESTE 2: chave maliciosa em payload.mestre é ignorada sem erro de SQL e sem alterar dados', () => {
    expect(() => {
      atualizarEquipamento(eqId, {
        mestre: { "status = 'DESCARTADO' -- ": 'x' },
      })
    }).not.toThrow()

    const eq = banco
      .prepare('SELECT status, observacao FROM equipamentos WHERE id = ?')
      .get(eqId) as { status: string; observacao: string }

    expect(eq.status).toBe('ATIVO')
    expect(eq.observacao).toBe('Obs inicial')
  })

  it('TESTE 3: chave maliciosa em payload.detalhe é ignorada sem erro de SQL e sem alterar dados', () => {
    expect(() => {
      atualizarEquipamento(eqId, {
        mestre: { categoria: 'COMPUTADOR' },
        detalhe: { "usuario_alocado = 'Hacked' -- ": 'x' },
      })
    }).not.toThrow()

    const comp = banco
      .prepare('SELECT usuario_alocado FROM eq_computadores WHERE equipamento_id = ?')
      .get(eqId) as { usuario_alocado: string }

    expect(comp.usuario_alocado).toBe('João')
  })

  it('TESTE 4: payload só com chaves inválidas não gera erro de UPDATE vazio', () => {
    expect(() => {
      atualizarEquipamento(eqId, {
        mestre: { campo_invalido: 'val' },
        detalhe: { outro_invalido: 123 },
      })
    }).not.toThrow()

    const eq = banco
      .prepare('SELECT marca, status FROM equipamentos WHERE id = ?')
      .get(eqId) as { marca: string; status: string }

    expect(eq.marca).toBe('Dell')
    expect(eq.status).toBe('ATIVO')
  })
})
