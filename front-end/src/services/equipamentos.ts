import { fetchComToken } from './api';

export type CategoriaEquipamento = 'computador' | 'switch' | 'celular' | 'cftv';

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
    case 'cftv':
      endpoint = '/api/cftv';
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

export async function listarLocalizacoes() {
  const resposta = await fetchComToken('/api/localizacoes');
  return resposta.dados;
}

export async function listarEquipamentos() {
  const resposta = await fetchComToken('/api/equipamentos');
  return resposta.dados;
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

export async function atualizarEquipamento(id: number, categoria: string, payload: unknown) {
  return fetchComToken(`/api/equipamentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
