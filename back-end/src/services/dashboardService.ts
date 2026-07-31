import banco from '../database/conexao.js'

export interface AtivoPorCategoria {
  categoria: string
  quantidade: number
}

export interface GarantiaVencendo {
  id: number
  nome: string | null
  marca: string
  modelo: string
  categoria: string
  data_garantia: string
}

export interface RedeMetrica {
  total: number
  emUso: number
}

export interface CameraMetrica {
  total: number
  ativas: number
  inativas: number
}

export interface ImpressoraMetrica {
  total: number
}

export interface ResumoDashboard {
  totalAtivos: number
  totalEmManutencao: number
  totalEstoque: number
  totalDescartados: number
  ativosPorCategoria: AtivoPorCategoria[]
  garantiasVencendo: GarantiaVencendo[]
  garantiasVencendoTotal: number
  rede: RedeMetrica
  cameras: CameraMetrica
  impressoras: ImpressoraMetrica
}

export const obterResumoDashboard = (): ResumoDashboard => {
  const { totalAtivos } = banco
    .prepare(`SELECT COUNT(*) AS totalAtivos FROM equipamentos WHERE status = 'ATIVO'`)
    .get() as { totalAtivos: number }

  const { totalEmManutencao } = banco
    .prepare(`SELECT COUNT(*) AS totalEmManutencao FROM equipamentos WHERE status = 'MANUTENCAO'`)
    .get() as { totalEmManutencao: number }

  const { totalEstoque } = banco
    .prepare(`SELECT COUNT(*) AS totalEstoque FROM equipamentos WHERE status = 'ESTOQUE'`)
    .get() as { totalEstoque: number }

  const { totalDescartados } = banco
    .prepare(`SELECT COUNT(*) AS totalDescartados FROM equipamentos WHERE status = 'DESCARTADO'`)
    .get() as { totalDescartados: number }

  const ativosPorCategoria = banco
    .prepare(`
      SELECT categoria, COUNT(*) AS quantidade
      FROM equipamentos
      WHERE status = 'ATIVO'
      GROUP BY categoria
    `)
    .all() as AtivoPorCategoria[]

  const garantiasVencendo = banco
    .prepare(`
      SELECT id, nome, marca, modelo, categoria, data_garantia
      FROM equipamentos
      WHERE status IN ('ATIVO', 'ESTOQUE')
        AND data_garantia IS NOT NULL
        AND date(data_garantia) BETWEEN date('now') AND date('now', '+30 days')
      ORDER BY date(data_garantia) ASC
      LIMIT 10
    `)
    .all() as GarantiaVencendo[]

  const { garantiasVencendoTotal } = banco
    .prepare(`
      SELECT COUNT(*) AS garantiasVencendoTotal
      FROM equipamentos
      WHERE status IN ('ATIVO', 'ESTOQUE')
        AND data_garantia IS NOT NULL
        AND date(data_garantia) BETWEEN date('now') AND date('now', '+30 days')
    `)
    .get() as { garantiasVencendoTotal: number }

  // Mapeamento de Rede: IPs em uso vs Total de IPs nas sub-redes
  const { emUso } = banco
    .prepare(`
      SELECT COUNT(*) AS emUso
      FROM interfaces_rede ir
      JOIN equipamentos e ON e.id = ir.equipamento_id
      WHERE e.status != 'DESCARTADO' AND ir.ip IS NOT NULL
    `)
    .get() as { emUso: number }

  const subredesCount = banco
    .prepare(`
      SELECT COUNT(DISTINCT (
        substr(ir.ip, 1, length(ir.ip) - length(substr(ir.ip, instr(ir.ip, '.'))) - length(substr(substr(ir.ip, instr(ir.ip, '.') + 1), instr(substr(ir.ip, instr(ir.ip, '.') + 1), '.'))))
      )) AS totalSubredes
      FROM interfaces_rede ir
      JOIN equipamentos e ON e.id = ir.equipamento_id
      WHERE e.status != 'DESCARTADO' AND ir.ip IS NOT NULL
    `)
    .get() as { totalSubredes: number }

  const totalIpsCapacidade = (subredesCount.totalSubredes || 1) * 254

  // Câmeras: Total, ativas e inativas (não ativas)
  const { totalCameras } = banco
    .prepare(`
      SELECT COUNT(*) AS totalCameras
      FROM eq_cameras c
      JOIN equipamentos e ON e.id = c.equipamento_id
      WHERE e.status != 'DESCARTADO'
    `)
    .get() as { totalCameras: number }

  const { ativasCameras } = banco
    .prepare(`
      SELECT COUNT(*) AS ativasCameras
      FROM eq_cameras c
      JOIN equipamentos e ON e.id = c.equipamento_id
      WHERE e.status = 'ATIVO'
    `)
    .get() as { ativasCameras: number }

  const inativasCameras = Math.max(0, totalCameras - ativasCameras)

  // Impressoras: Total de impressoras na tabela eq_impressoras
  const { totalImpressoras } = banco
    .prepare(`
      SELECT COUNT(*) AS totalImpressoras
      FROM eq_impressoras i
      JOIN equipamentos e ON e.id = i.equipamento_id
      WHERE e.status != 'DESCARTADO'
    `)
    .get() as { totalImpressoras: number }

  return {
    totalAtivos,
    totalEmManutencao,
    totalEstoque,
    totalDescartados,
    ativosPorCategoria,
    garantiasVencendo,
    garantiasVencendoTotal,
    rede: {
      total: totalIpsCapacidade,
      emUso,
    },
    cameras: {
      total: totalCameras,
      ativas: ativasCameras,
      inativas: inativasCameras,
    },
    impressoras: {
      total: totalImpressoras,
    },
  }
}
