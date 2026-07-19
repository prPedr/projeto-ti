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

export interface FiltrosListagemLocalizacoes {
  pagina: number
  limite: number
  busca?: string
}

export interface ResultadoListagemLocalizacoes {
  dados: Localizacao[]
  metadados: {
    totalRegistros: number
    paginaAtual: number
    limite: number
    totalPaginas: number
  }
}

export const listarLocalizacoes = (filtros: FiltrosListagemLocalizacoes): ResultadoListagemLocalizacoes => {
  const condicoes: string[] = []
  const parametros: any = {}

  if (filtros.busca) {
    condicoes.push('(filial LIKE @busca OR predio LIKE @busca OR sala LIKE @busca OR descricao LIKE @busca)')
    parametros.busca = `%${filtros.busca}%`
  }

  const clausulaWhere = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : ''

  const consultaContagem = banco.prepare(`SELECT COUNT(id) AS total FROM localizacoes ${clausulaWhere}`)
  const { total: totalRegistros } = consultaContagem.get(parametros) as { total: number }

  const offset = (filtros.pagina - 1) * filtros.limite
  parametros.limite = filtros.limite
  parametros.offset = offset

  const consulta = banco.prepare(`
    SELECT id, filial, predio, sala, descricao
    FROM localizacoes
    ${clausulaWhere}
    ORDER BY filial, predio, sala
    LIMIT @limite OFFSET @offset
  `)

  const dados = consulta.all(parametros) as Localizacao[]

  return {
    dados,
    metadados: {
      totalRegistros,
      paginaAtual: filtros.pagina,
      limite: filtros.limite,
      totalPaginas: Math.ceil(totalRegistros / filtros.limite),
    },
  }
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
