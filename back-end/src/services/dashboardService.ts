import banco from '../database/conexao.js'

export interface AtivoPorCategoria {
  categoria: string
  quantidade: number
}

export interface ResumoDashboard {
  totalAtivos: number
  totalEmManutencao: number
  ativosPorCategoria: AtivoPorCategoria[]
}

export const obterResumoDashboard = (): ResumoDashboard => {
  const { totalAtivos } = banco
    .prepare(`SELECT COUNT(*) AS totalAtivos FROM equipamentos WHERE status = 'ATIVO'`)
    .get() as { totalAtivos: number }

  const { totalEmManutencao } = banco
    .prepare(`SELECT COUNT(*) AS totalEmManutencao FROM equipamentos WHERE status = 'MANUTENCAO'`)
    .get() as { totalEmManutencao: number }

  const ativosPorCategoria = banco
    .prepare(`
      SELECT categoria, COUNT(*) AS quantidade
      FROM equipamentos
      WHERE status = 'ATIVO'
      GROUP BY categoria
    `)
    .all() as AtivoPorCategoria[]

  return { totalAtivos, totalEmManutencao, ativosPorCategoria }
}
