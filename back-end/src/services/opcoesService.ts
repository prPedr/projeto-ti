import banco from '../database/conexao.js'

export interface OpcaoPredefinida {
  id: number
  categoria: string
  valor: string
  dependencia_id: number | null
}

export const listarOpcoes = (categoria?: string): OpcaoPredefinida[] | Record<string, OpcaoPredefinida[]> => {
  if (categoria) {
    const opcoes = banco
      .prepare('SELECT id, categoria, valor, dependencia_id FROM opcoes_predefinidas WHERE categoria = ? ORDER BY valor')
      .all(categoria) as OpcaoPredefinida[]

    return opcoes
  }

  const todas = banco
    .prepare('SELECT id, categoria, valor, dependencia_id FROM opcoes_predefinidas ORDER BY categoria, valor')
    .all() as OpcaoPredefinida[]

  const agrupado: Record<string, OpcaoPredefinida[]> = {}
  for (const opcao of todas) {
    const lista = agrupado[opcao.categoria] ?? (agrupado[opcao.categoria] = [])
    lista.push(opcao)
  }

  return agrupado
}

export const adicionarOpcao = (categoria: string, valor: string, dependencia_id?: number | null) => {
  const comando = banco.prepare(
    'INSERT INTO opcoes_predefinidas (categoria, valor, dependencia_id) VALUES (?, ?, ?)',
  )
  const resultado = comando.run(categoria, valor, dependencia_id ?? null)
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
