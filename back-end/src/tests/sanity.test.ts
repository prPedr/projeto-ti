import { beforeAll, describe, expect, it } from 'vitest'
import banco from '../database/conexao.js'
import { prepararBancoDeTeste } from './setup.js'

describe('infraestrutura de teste', () => {
  beforeAll(() => prepararBancoDeTeste())

  it('cria o schema no banco de teste', () => {
    const tabelas = banco.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    expect(tabelas.length).toBeGreaterThan(0)
  })
})
