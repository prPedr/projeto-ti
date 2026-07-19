import banco from '../database/conexao.js'

export interface Localizacao {
  id: number
  filial: string
  predio: string | null
  sala: string | null
  descricao: string | null
}

export interface DadosCriacaoLocalizacao {
  filial: string
  predio?: string
  sala?: string
  descricao?: string
}

export const listarLocalizacoes = (): Localizacao[] => {
  const consulta = banco.prepare(`
    SELECT id, filial, predio, sala, descricao
    FROM localizacoes
    ORDER BY filial, predio, sala
  `)

  return consulta.all() as Localizacao[]
}

export const criarLocalizacao = (dados: DadosCriacaoLocalizacao) => {
  const comando = banco.prepare(`
    INSERT INTO localizacoes (filial, predio, sala, descricao)
    VALUES (@filial, @predio, @sala, @descricao)
  `)

  const resultado = comando.run({
    filial: dados.filial,
    predio: dados.predio ?? null,
    sala: dados.sala ?? null,
    descricao: dados.descricao ?? null,
  })

  return resultado.lastInsertRowid
}
