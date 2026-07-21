import { fetchComToken } from './api';

export interface Localizacao {
  id: number;
  filial: string;
  predio: string | null;
  sala: string | null;
  descricao: string | null;
}

export interface DadosCriacaoLocalizacao {
  filial: string;
  predio?: string;
  sala?: string;
  descricao?: string;
}

export interface MetadadosPaginacao {
  totalRegistros: number;
  paginaAtual: number;
  limite: number;
  totalPaginas: number;
}

export async function listarLocalizacoesAdmin(
  pagina: number,
  limite: number,
  busca?: string,
): Promise<{ dados: Localizacao[]; metadados: MetadadosPaginacao }> {
  const parametros = new URLSearchParams({
    pagina: String(pagina),
    limite: String(limite),
  });

  if (busca) {
    parametros.set('busca', busca);
  }

  const resposta = await fetchComToken(`/api/localizacoes?${parametros.toString()}`);
  return { dados: resposta.dados, metadados: resposta.metadados };
}

export async function criarLocalizacao(dados: DadosCriacaoLocalizacao) {
  return fetchComToken('/api/localizacoes', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}
