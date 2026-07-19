import banco from '../database/conexao.js'

export interface DadosCriacaoCftv {
  mestre: {
    categoria: 'NVR' | 'CAMERA'
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
    identificacao_extra?: string
    capacidade_armazenamento?: string
    quantidade_canais_resolucao?: string
    firmware?: string
  }
  interfaces?: Array<{
    nome_interface: string
    ip?: string
    mac?: string
  }>
}

export const criarCftv = (dadosEntrada: DadosCriacaoCftv) => {
  const transacao = banco.transaction((dados: DadosCriacaoCftv) => {
    const comandoMestre = banco.prepare(`
      INSERT INTO equipamentos (categoria, marca, modelo, status, localizacao_id, cadastrado_por)
      VALUES (@categoria, @marca, @modelo, @status, @localizacao_id, @cadastrado_por)
    `)
    const resultadoMestre = comandoMestre.run(dados.mestre)
    const idEquipamento = resultadoMestre.lastInsertRowid

    const comandoDetalhe = banco.prepare(`
      INSERT INTO eq_cftv (equipamento_id, identificacao_extra, capacidade_armazenamento, quantidade_canais_resolucao, firmware)
      VALUES (@equipamento_id, @identificacao_extra, @capacidade_armazenamento, @quantidade_canais_resolucao, @firmware)
    `)
    comandoDetalhe.run({ ...dados.detalhe, equipamento_id: idEquipamento })

    if (dados.interfaces && dados.interfaces.length > 0) {
      const comandoRede = banco.prepare(`
        INSERT INTO interfaces_rede (equipamento_id, nome_interface, ip, mac)
        VALUES (@equipamento_id, @nome_interface, @ip, @mac)
      `)

      for (const interfaceRede of dados.interfaces) {
        comandoRede.run({ ...interfaceRede, equipamento_id: idEquipamento })
      }
    }

    return idEquipamento
  })

  try {
    const novoId = transacao(dadosEntrada)
    return novoId
  } catch (erro: any) {
    if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      if (erro.message.includes('interfaces_rede.ip')) {
        throw new Error('IP já cadastrado em outro dispositivo na rede.')
      }
      if (erro.message.includes('interfaces_rede.mac')) {
        throw new Error('MAC já cadastrado em outro dispositivo na rede.')
      }
      throw new Error('IP ou MAC já cadastrado em outro dispositivo na rede.')
    }
    throw erro
  }
}
