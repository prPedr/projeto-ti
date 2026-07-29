import banco from '../database/conexao.js'

export interface DadosCriacaoImpressora {
  mestre: {
    categoria: 'IMPRESSORA'
    marca: string
    modelo: string
    status: 'ATIVO' | 'ESTOQUE' | 'MANUTENCAO' | 'DESCARTADO'
    localizacao_id: number
    cadastrado_por: number
    nome?: string
    fornecedor?: string
    data_garantia?: string
    observacao?: string
  }
  detalhe: {
    tipo_conexao: 'REDE' | 'USB'
    computador_conectado_id?: number
  }
  interfaces?: Array<{
    nome_interface: string
    ip?: string
    mac?: string
  }>
}

export const criarImpressora = (dadosEntrada: DadosCriacaoImpressora) => {
  const transacao = banco.transaction((dados: DadosCriacaoImpressora) => {
    // Inserir na tabela mestre
    const comandoMestre = banco.prepare(`
      INSERT INTO equipamentos (categoria, marca, modelo, status, localizacao_id, cadastrado_por, nome, fornecedor, data_garantia, observacao)
      VALUES (@categoria, @marca, @modelo, @status, @localizacao_id, @cadastrado_por, @nome, @fornecedor, @data_garantia, @observacao)
    `)
    const resultadoMestre = comandoMestre.run({
      ...dados.mestre,
      nome: dados.mestre.nome ?? null,
      fornecedor: dados.mestre.fornecedor ?? null,
      data_garantia: dados.mestre.data_garantia ?? null,
      observacao: dados.mestre.observacao ?? null,
    })
    const idEquipamento = Number(resultadoMestre.lastInsertRowid)

    // Inserir na tabela de detalhe (eq_impressoras)
    const comandoDetalhe = banco.prepare(`
      INSERT INTO eq_impressoras (equipamento_id, tipo_conexao, computador_conectado_id)
      VALUES (@equipamento_id, @tipo_conexao, @computador_conectado_id)
    `)
    comandoDetalhe.run({
      equipamento_id: idEquipamento,
      tipo_conexao: dados.detalhe.tipo_conexao,
      computador_conectado_id: dados.detalhe.computador_conectado_id ?? null,
    })

    // Inserir Interfaces de Rede (se tipo_conexao === 'REDE' e houver interfaces)
    if (dados.detalhe.tipo_conexao === 'REDE' && dados.interfaces && dados.interfaces.length > 0) {
      const comandoRede = banco.prepare(`
        INSERT INTO interfaces_rede (equipamento_id, nome_interface, ip, mac)
        VALUES (@equipamento_id, @nome_interface, @ip, @mac)
      `)

      for (const interfaceRede of dados.interfaces) {
        comandoRede.run({
          nome_interface: interfaceRede.nome_interface,
          ip: interfaceRede.ip ?? null,
          mac: interfaceRede.mac ?? null,
          equipamento_id: idEquipamento,
        })
      }
    }

    return idEquipamento
  })

  return transacao(dadosEntrada)
}

export interface ComputadorConectavel {
  id: number
  nome: string | null
  marca: string
  modelo: string
  categoria: string
  ips: string[]
}

export const listarComputadoresConectaveis = (excluirId?: number): ComputadorConectavel[] => {
  const parametros: Record<string, any> = {}
  let condicaoExcluir = ''

  if (excluirId) {
    condicaoExcluir = 'AND e.id != @excluirId'
    parametros.excluirId = excluirId
  }

  const consulta = banco.prepare(`
    SELECT
      e.id,
      e.nome,
      e.marca,
      e.modelo,
      e.categoria,
      GROUP_CONCAT(DISTINCT ir.ip) AS ips
    FROM equipamentos e
    LEFT JOIN interfaces_rede ir ON ir.equipamento_id = e.id
    WHERE e.categoria = 'COMPUTADOR'
      AND e.status = 'ATIVO'
      ${condicaoExcluir}
    GROUP BY e.id
    ORDER BY e.nome
  `)

  const linhas = consulta.all(parametros) as Array<{
    id: number
    nome: string | null
    marca: string
    modelo: string
    categoria: string
    ips: string | null
  }>

  return linhas.map((linha) => ({
    id: linha.id,
    nome: linha.nome,
    marca: linha.marca,
    modelo: linha.modelo,
    categoria: linha.categoria,
    ips: linha.ips ? linha.ips.split(',') : [],
  }))
}
