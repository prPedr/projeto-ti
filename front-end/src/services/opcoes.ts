import { fetchComToken } from './api';

export interface OpcaoItem {
  id: number;
  categoria: string;
  valor: string;
  dependencia_id: number | null;
}

export type OpcoesAgrupadas = Record<string, OpcaoItem[]>;

export async function listarOpcoes(): Promise<OpcoesAgrupadas> {
  const resposta = await fetchComToken('/api/opcoes');
  return resposta.dados;
}

export async function criarOpcao(
  categoria: string,
  valor: string,
  dependencia_id?: number | null,
) {
  return fetchComToken('/api/opcoes', {
    method: 'POST',
    body: JSON.stringify({ categoria, valor, dependencia_id: dependencia_id ?? null }),
  });
}

export async function editarOpcao(id: number, valor: string) {
  return fetchComToken(`/api/opcoes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ valor }),
  });
}

export async function excluirOpcao(id: number) {
  return fetchComToken(`/api/opcoes/${id}`, {
    method: 'DELETE',
  });
}
