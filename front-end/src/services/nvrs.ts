import { fetchComToken } from './api';

export interface NvrResumo {
  id: number;
  nome: string | null;
  marca: string;
  modelo: string;
  status: string;
  quantidade_canais: number | null;
  canais_ocupados: number;
  filial: string | null;
  sala: string | null;
  ips: string[];
  macs: string[];
}

export interface CanalNvr {
  id: number;
  nvr_id: number;
  numero_canal: number;
  camera_conectada_id: number | null;
  descricao: string | null;
  data_atualizacao: string;
  conectado_nome: string | null;
  conectado_categoria: string | null;
  conectado_marca: string | null;
  conectado_modelo: string | null;
  conectado_status: string | null;
  conectado_ips: string[];
  conectado_macs: string[];
}

export interface CameraConectavel {
  id: number;
  nome: string | null;
  marca: string;
  modelo: string;
  categoria: string;
  ips: string[];
}

export async function listarNvrs(): Promise<NvrResumo[]> {
  const resposta = await fetchComToken('/api/nvrs');
  return resposta.dados;
}

export async function listarCanaisNvr(nvrId: number): Promise<CanalNvr[]> {
  const resposta = await fetchComToken(`/api/nvrs/${nvrId}/canais`);
  return resposta.dados;
}

export async function atualizarCanal(
  nvrId: number,
  numeroCanal: number,
  dados: { camera_conectada_id?: number | null; descricao?: string | null }
): Promise<void> {
  await fetchComToken(`/api/nvrs/${nvrId}/canais/${numeroCanal}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export async function listarCamerasConectaveis(excluirNvrId?: number): Promise<CameraConectavel[]> {
  const query = excluirNvrId ? `?excluirId=${excluirNvrId}` : '';
  const resposta = await fetchComToken(`/api/nvrs/cameras-conectaveis${query}`);
  return resposta.dados;
}
