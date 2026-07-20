import banco from '../database/conexao.js'

export interface OpcaoPredefinida {
  id: number
  categoria: string
  valor: string
}

export const listarOpcoes = (categoria?: string): string[] | Record<string, string[]> => {
  if (categoria) {
    const opcoes = banco
      .prepare('SELECT valor FROM opcoes_predefinidas WHERE categoria = ? ORDER BY valor')
      .all(categoria) as Array<{ valor: string }>

    return opcoes.map((opcao) => opcao.valor)
  }

  const todas = banco
    .prepare('SELECT categoria, valor FROM opcoes_predefinidas ORDER BY categoria, valor')
    .all() as Array<Pick<OpcaoPredefinida, 'categoria' | 'valor'>>

  const agrupado: Record<string, string[]> = {}
  for (const opcao of todas) {
    const lista = agrupado[opcao.categoria] ?? (agrupado[opcao.categoria] = [])
    lista.push(opcao.valor)
  }

  return agrupado
}

export const adicionarOpcao = (categoria: string, valor: string) => {
  const comando = banco.prepare('INSERT INTO opcoes_predefinidas (categoria, valor) VALUES (?, ?)')
  const resultado = comando.run(categoria, valor)
  return resultado.lastInsertRowid
}
