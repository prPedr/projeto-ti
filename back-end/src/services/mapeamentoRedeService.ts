import banco from '../database/conexao.js'

export interface InterfaceRedeListada {
  id: number
  equipamento_id: number
  nome_interface: string
  ip: string
  mac: string | null
  categoria: string
  nome: string | null
  marca: string
  modelo: string
  status: string
  filial: string | null
  sala: string | null
}

export const listarInterfacesRede = (filtroSubRede?: string): InterfaceRedeListada[] => {
  // ip/mac só ficam NULL quando o equipamento é descartado (equipamentosService.ts
  // zera as interfaces no descarte pra liberar o UNIQUE) — filtrar ip IS NOT NULL
  // já exclui descartados automaticamente, sem precisar checar e.status.
  const condicoes: string[] = ['ir.ip IS NOT NULL']
  const parametros: any = {}

  if (filtroSubRede) {
    condicoes.push('ir.ip LIKE @padrao')
    parametros.padrao = `${filtroSubRede}.%`
  }

  const clausulaWhere = `WHERE ${condicoes.join(' AND ')}`

  const consulta = banco.prepare(`
    SELECT
      ir.id,
      ir.equipamento_id,
      ir.nome_interface,
      ir.ip,
      ir.mac,
      e.categoria,
      e.nome,
      e.marca,
      e.modelo,
      e.status,
      l.filial AS filial,
      l.sala AS sala
    FROM interfaces_rede ir
    JOIN equipamentos e ON e.id = ir.equipamento_id
    LEFT JOIN localizacoes l ON l.id = e.localizacao_id
    ${clausulaWhere}
    ORDER BY ir.ip
  `)
  // ip é TEXT: esse ORDER BY ordena como string (ex: "192.168.1.10" antes de
  // "192.168.1.2"). De propósito não resolvido aqui — a ordenação numérica
  // correta fica por conta do front-end, que faz isso de forma mais simples
  // e confiável em JS do que tentar contornar em SQLite puro.

  return consulta.all(parametros) as InterfaceRedeListada[]
}
