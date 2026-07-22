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

export interface RespostaListagemLocalizacoes {
  dados: Localizacao[];
  metadados: MetadadosPaginacao;
}

export async function listarLocalizacoesAdmin(
  pagina = 1,
  limite = 20,
  busca?: string,
): Promise<RespostaListagemLocalizacoes> {
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
