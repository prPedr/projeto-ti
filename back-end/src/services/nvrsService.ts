import banco from '../database/conexao.js'

export interface DadosCriacaoNvr {
  mestre: {
    categoria: 'NVR'
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
    quantidade_canais?: number
    capacidade_armazenamento?: string
    firmware?: string
    identificacao_extra?: string
  }
  interfaces?: Array<{
    nome_interface: string
    ip?: string
    mac?: string
  }>
}

export const criarNvr = (dadosEntrada: DadosCriacaoNvr) => {
  const transacao = banco.transaction((dados: DadosCriacaoNvr) => {
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

    // Inserir na tabela de detalhe (eq_nvrs)
    const comandoDetalhe = banco.prepare(`
      INSERT INTO eq_nvrs (equipamento_id, quantidade_canais, capacidade_armazenamento, firmware, identificacao_extra)
      VALUES (@equipamento_id, @quantidade_canais, @capacidade_armazenamento, @firmware, @identificacao_extra)
    `)
    comandoDetalhe.run({
      quantidade_canais: dados.detalhe.quantidade_canais ?? null,
      capacidade_armazenamento: dados.detalhe.capacidade_armazenamento ?? null,
      firmware: dados.detalhe.firmware ?? null,
      identificacao_extra: dados.detalhe.identificacao_extra ?? null,
      equipamento_id: idEquipamento,
    })

    // Inserir Interfaces de Rede
    if (dados.interfaces && dados.interfaces.length > 0) {
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

export interface NvrListado {
  id: number
  nome: string | null
  marca: string
  modelo: string
  status: string
  quantidade_canais: number | null
  filial: string | null
  sala: string | null
  canais_ocupados: number
}

export const listarNvrs = (): NvrListado[] => {
  const consulta = banco.prepare(`
    SELECT
      e.id,
      e.nome,
      e.marca,
      e.modelo,
      e.status,
      en.quantidade_canais,
      l.filial,
      l.sala,
      (
        SELECT COUNT(*)
        FROM canais_nvr cn
        WHERE cn.nvr_id = e.id
          AND (cn.camera_conectada_id IS NOT NULL OR cn.descricao IS NOT NULL)
      ) AS canais_ocupados
    FROM equipamentos e
    JOIN eq_nvrs en ON en.equipamento_id = e.id
    LEFT JOIN localizacoes l ON l.id = e.localizacao_id
    WHERE e.status != 'DESCARTADO'
    ORDER BY e.nome
  `)

  return consulta.all() as NvrListado[]
}
