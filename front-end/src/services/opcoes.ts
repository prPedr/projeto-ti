import { fetchComToken } from './api';

export type OpcoesAgrupadas = Record<string, string[]>;

export async function listarOpcoes(): Promise<OpcoesAgrupadas> {
  const resposta = await fetchComToken('/api/opcoes');
  return resposta.dados;
}

export async function criarOpcao(categoria: string, valor: string) {
  return fetchComToken('/api/opcoes', {
    method: 'POST',
    body: JSON.stringify({ categoria, valor }),
  });
}
