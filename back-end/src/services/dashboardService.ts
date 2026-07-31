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

export interface UtilizacaoRecurso {
  total: number
  ocupadas: number
}

export interface ResumoDashboard {
  totalAtivos: number
  totalEmManutencao: number
  totalEstoque: number
  totalDescartados: number
  ativosPorCategoria: AtivoPorCategoria[]
  portasSwitch: UtilizacaoRecurso
  canaisNvr: UtilizacaoRecurso
  garantiasVencendo: GarantiaVencendo[]
  garantiasVencendoTotal: number
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

  const portasSwitch = banco
    .prepare(`
      SELECT
        (SELECT COALESCE(SUM(numero_portas), 0) FROM eq_switches) AS total,
        (SELECT COUNT(*) FROM portas_switch WHERE equipamento_conectado_id IS NOT NULL OR descricao IS NOT NULL) AS ocupadas
    `)
    .get() as UtilizacaoRecurso

  const canaisNvr = banco
    .prepare(`
      SELECT
        (SELECT COALESCE(SUM(quantidade_canais), 0) FROM eq_nvrs) AS total,
        (SELECT COUNT(*) FROM canais_nvr WHERE camera_conectada_id IS NOT NULL OR descricao IS NOT NULL) AS ocupadas
    `)
    .get() as UtilizacaoRecurso

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

  return {
    totalAtivos,
    totalEmManutencao,
    totalEstoque,
    totalDescartados,
    ativosPorCategoria,
    portasSwitch,
    canaisNvr,
    garantiasVencendo,
    garantiasVencendoTotal,
  }
}
