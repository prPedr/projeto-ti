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

export const listarEquipamentos = (): EquipamentoListado[] => {
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
    ORDER BY e.data_cadastro DESC
  `)

  return consulta.all() as EquipamentoListado[]
}
