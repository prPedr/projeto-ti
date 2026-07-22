import banco from '../database/conexao.js'

export interface OpcaoPredefinida {
  id: number
  categoria: string
  valor: string
  dependencia_id: number | null
  tipo_equipamento: string | null
}

export const listarOpcoes = (
  categoria?: string,
  tipoEquipamento?: string,
): OpcaoPredefinida[] | Record<string, OpcaoPredefinida[]> => {
  const condicoes: string[] = []
  const parametros: unknown[] = []

  if (categoria) {
    condicoes.push('categoria = ?')
    parametros.push(categoria)
  }

  if (tipoEquipamento) {
    condicoes.push('tipo_equipamento = ?')
    parametros.push(tipoEquipamento)
  }

  const onde = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : ''

  if (categoria) {
    const opcoes = banco
      .prepare(`SELECT id, categoria, valor, dependencia_id, tipo_equipamento FROM opcoes_predefinidas ${onde} ORDER BY valor`)
      .all(...parametros) as OpcaoPredefinida[]

    return opcoes
  }

  const todas = banco
    .prepare(`SELECT id, categoria, valor, dependencia_id, tipo_equipamento FROM opcoes_predefinidas ${onde} ORDER BY categoria, valor`)
    .all(...parametros) as OpcaoPredefinida[]

  const agrupado: Record<string, OpcaoPredefinida[]> = {}
  for (const opcao of todas) {
    const lista = agrupado[opcao.categoria] ?? (agrupado[opcao.categoria] = [])
    lista.push(opcao)
  }

  return agrupado
}

export const adicionarOpcao = (
  categoria: string,
  valor: string,
  dependencia_id?: number | null,
  tipoEquipamento?: string | null,
) => {
  const comando = banco.prepare(
    'INSERT INTO opcoes_predefinidas (categoria, valor, dependencia_id, tipo_equipamento) VALUES (?, ?, ?, ?)',
  )
  const resultado = comando.run(categoria, valor, dependencia_id ?? null, tipoEquipamento ?? null)
  return resultado.lastInsertRowid
}

export const editarOpcao = (id: number, novoValor: string) => {
  const comando = banco.prepare('UPDATE opcoes_predefinidas SET valor = ? WHERE id = ?')
  const resultado = comando.run(novoValor, id)
  return resultado.changes
}

export const excluirOpcao = (id: number) => {
  const comando = banco.prepare('DELETE FROM opcoes_predefinidas WHERE id = ?')
  const resultado = comando.run(id)
  return resultado.changes
}
