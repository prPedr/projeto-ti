import { fetchComToken } from './api';

export type CategoriaEquipamento = 'computador' | 'switch' | 'celular' | 'nvr' | 'camera' | 'impressora' | 'antena';

export async function criarEquipamento(categoria: CategoriaEquipamento, payload: unknown) {
  let endpoint: string;

  switch (categoria) {
    case 'computador':
      endpoint = '/api/computadores';
      break;
    case 'switch':
      endpoint = '/api/switches';
      break;
    case 'celular':
      endpoint = '/api/celulares';
      break;
    case 'nvr':
      endpoint = '/api/nvrs';
      break;
    case 'camera':
      endpoint = '/api/cameras';
      break;
    case 'impressora':
      endpoint = '/api/impressoras';
      break;
    case 'antena':
      endpoint = '/api/antenas';
      break;
    default:
      throw new Error(`Categoria de equipamento desconhecida: ${categoria}`);
  }

  try {
    return await fetchComToken(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error: any) {
    if (error.response && error.response.data) {
      console.error('Erro de Validação do Back-end:', error.response.data);
    } else {
      console.error('Erro na requisição:', error);
    }
    throw error;
  }
}

export interface Equipamento {
  id: number;
  categoria: string;
  nome: string | null;
  marca: string;
  modelo: string;
  status: string;
  filial: string | null;
  sala: string | null;
  cadastrado_por_nome: string | null;
  ip: string | null;
  usuario_alocado: string | null;
  termo_anexo_id: number | null;
  termo_url_download: string | null;
}

export async function listarLocalizacoes() {
  const resposta = await fetchComToken('/api/localizacoes');
  return resposta.dados;
}

export interface RespostaListagemEquipamentos {
  dados: Equipamento[];
  metadados: {
    totalRegistros: number;
    paginaAtual: number;
    limite: number;
    totalPaginas: number;
  };
}

export async function listarEquipamentos(
  pagina = 1,
  limite = 20,
  busca?: string,
  marca?: string,
  modelo?: string,
  categoria?: string,
): Promise<RespostaListagemEquipamentos> {
  const parametros = new URLSearchParams({ pagina: String(pagina), limite: String(limite) });
  if (busca)     parametros.set('busca',     busca);
  if (marca)     parametros.set('marca',     marca);
  if (modelo)    parametros.set('modelo',    modelo);
  if (categoria) parametros.set('categoria', categoria);
  const resposta = await fetchComToken(`/api/equipamentos?${parametros.toString()}`);
  return { dados: resposta.dados, metadados: resposta.metadados };
}

export async function listarFiltrosDisponiveis(categoria?: string, marca?: string) {
  const parametros = new URLSearchParams();
  if (categoria) parametros.set('categoria', categoria);
  if (marca)     parametros.set('marca',     marca);
  const qs = parametros.toString();
  const resposta = await fetchComToken(`/api/equipamentos/filtros-disponiveis${qs ? `?${qs}` : ''}`);
  return { marcas: resposta.marcas as string[], modelos: resposta.modelos as string[] };
}

export async function excluirEquipamento(id: number) {
  return fetchComToken(`/api/equipamentos/${id}`, {
    method: 'DELETE',
  });
}

export async function buscarEquipamentoPorId(id: number) {
  const resposta = await fetchComToken(`/api/equipamentos/${id}`);
  return resposta.dados;
}

export async function atualizarEquipamento(id: number, _categoria: string, payload: unknown) {
  return fetchComToken(`/api/equipamentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function enviarAnexoEquipamento(
  equipamentoId: number,
  arquivo: File,
  tipoDocumento: 'NOTA_FISCAL' | 'TERMO_RESPONSABILIDADE' | 'CONTRATO' | 'OUTRO',
) {
  const formData = new FormData();
  formData.append('arquivo', arquivo);
  formData.append('tipo_documento', tipoDocumento);

  return fetchComToken(`/api/equipamentos/${equipamentoId}/anexos`, {
    method: 'POST',
    body: formData,
  });
}
