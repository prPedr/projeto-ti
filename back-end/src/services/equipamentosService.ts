import banco from '../database/conexao.js'

export interface EquipamentoListado {
  id: number
  categoria: 'COMPUTADOR' | 'SWITCH' | 'CELULAR' | 'NVR' | 'CAMERA'
  nome: string | null
  marca: string
  modelo: string
  status: 'ATIVO' | 'ESTOQUE' | 'MANUTENCAO' | 'DESCARTADO'
  fornecedor: string | null
  data_garantia: string | null
  observacao: string | null
  data_cadastro: string
  localizacao_id: number | null
  filial: string | null
  sala: string | null
  cadastrado_por: number
  cadastrado_por_nome: string | null
}

export interface FiltrosListagem {
  pagina: number
  limite: number
  busca?: string
  status?: string
}

export interface ResultadoListagemEquipamentos {
  dados: EquipamentoListado[]
  metadados: {
    totalRegistros: number
    paginaAtual: number
    limite: number
    totalPaginas: number
  }
}

export const listarEquipamentos = (filtros: FiltrosListagem): ResultadoListagemEquipamentos => {
  const condicoes: string[] = []
  const parametros: any = {}

  if (filtros.status) {
    condicoes.push('e.status = @status')
    parametros.status = filtros.status
  } else {
    // Sem filtro explícito, esconde os descartados das listagens/dashboard por
    // padrão; quem quiser vê-los, filtra status=DESCARTADO de propósito.
    condicoes.push("e.status != 'DESCARTADO'")
  }

  if (filtros.busca) {
    condicoes.push('(e.nome LIKE @busca OR e.marca LIKE @busca OR e.modelo LIKE @busca OR eqc.tag_patrimonio LIKE @busca)')
    parametros.busca = `%${filtros.busca}%`
  }

  const clausulaWhere = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : ''

  // Junta eq_computadores só para permitir buscar por tag_patrimonio; os demais
  // campos pesquisados (nome, marca, modelo) já vivem na tabela mestre.
  const consultaContagem = banco.prepare(`
    SELECT COUNT(e.id) AS total
    FROM equipamentos e
    LEFT JOIN eq_computadores eqc ON eqc.equipamento_id = e.id
    ${clausulaWhere}
  `)
  const { total: totalRegistros } = consultaContagem.get(parametros) as { total: number }

  const offset = (filtros.pagina - 1) * filtros.limite
  parametros.limite = filtros.limite
  parametros.offset = offset

  const consulta = banco.prepare(`
    SELECT
      e.id,
      e.categoria,
      e.nome,
      e.marca,
      e.modelo,
      e.status,
      e.fornecedor,
      e.data_garantia,
      e.observacao,
      e.data_cadastro,
      e.localizacao_id,
      l.filial AS filial,
      l.sala AS sala,
      e.cadastrado_por,
      u.nome AS cadastrado_por_nome
    FROM equipamentos e
    LEFT JOIN localizacoes l ON l.id = e.localizacao_id
    LEFT JOIN usuarios_sistema u ON u.id = e.cadastrado_por
    LEFT JOIN eq_computadores eqc ON eqc.equipamento_id = e.id
    ${clausulaWhere}
    ORDER BY e.data_cadastro DESC
    LIMIT @limite OFFSET @offset
  `)

  const dados = consulta.all(parametros) as EquipamentoListado[]

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

export type ResultadoDescarte = 'NAO_ENCONTRADO' | 'JA_DESCARTADO' | 'DESCARTADO'

export const descartarEquipamento = (id: number, usuarioId: number): ResultadoDescarte => {
  // Checa o status antes de gravar: sem isso, descartar duas vezes o mesmo
  // equipamento reescreve data_descarte e duplica o texto em observacao a
  // cada chamada (changes sempre voltava 1, escondendo o problema).
  const equipamento = banco.prepare('SELECT status FROM equipamentos WHERE id = @id').get({ id }) as
    | { status: string }
    | undefined

  if (!equipamento) {
    return 'NAO_ENCONTRADO'
  }

  if (equipamento.status === 'DESCARTADO') {
    return 'JA_DESCARTADO'
  }

  const transacao = banco.transaction(() => {
    const interfaces = banco.prepare('SELECT ip, mac FROM interfaces_rede WHERE equipamento_id = @id').all({ id }) as Array<{
      ip: string | null
      mac: string | null
    }>

    const enderecosLiberados = interfaces.flatMap((interfaceRede) => [interfaceRede.ip, interfaceRede.mac]).filter((valor): valor is string => valor !== null)

    const notaEnderecos = enderecosLiberados.length > 0 ? ` (IP/MAC liberados para reuso: ${enderecosLiberados.join(', ')})` : ''

    // Zera ip/mac em vez de deletar a interface: libera o UNIQUE(ip)/UNIQUE(mac)
    // para outro equipamento (ex.: reaproveitar a placa wifi de um notebook
    // quebrado em outro), já que o SQLite trata cada NULL como valor distinto
    // e não bloqueia a constraint. O valor liberado fica registrado abaixo.
    banco.prepare('UPDATE interfaces_rede SET ip = NULL, mac = NULL WHERE equipamento_id = @id').run({ id })

    banco
      .prepare(
        `
        UPDATE equipamentos
        SET
          status = 'DESCARTADO',
          data_descarte = CURRENT_TIMESTAMP,
          observacao = COALESCE(observacao || ' ', '') || 'Descartado pelo usuário ID ' || CAST(@usuarioId AS INTEGER) || @notaEnderecos
        WHERE id = @id
      `
      )
      .run({ id, usuarioId, notaEnderecos })
  })

  transacao()

  return 'DESCARTADO'
}
