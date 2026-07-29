import banco from '../database/conexao.js'

export interface DadosCriacaoAntena {
  mestre: {
    categoria: 'ANTENA'
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
  detalhe?: Record<string, any>
  interfaces?: Array<{
    nome_interface: string
    ip?: string
    mac?: string
  }>
}

export const criarAntena = (dadosEntrada: DadosCriacaoAntena) => {
  const transacao = banco.transaction((dados: DadosCriacaoAntena) => {
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

    // Inserir Interfaces de Rede (se houver interfaces)
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
