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

  return fetchComToken(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listarLocalizacoes() {
  const resposta = await fetchComToken('/api/localizacoes');
  return resposta.dados;
}
