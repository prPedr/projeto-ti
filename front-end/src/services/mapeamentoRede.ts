import { fetchComToken } from './api';

export interface InterfaceRede {
  id: number;
  equipamento_id: number;
  nome_interface: string;
  ip: string;
  mac: string | null;
  categoria: string;
  nome: string | null;
  marca: string;
  modelo: string;
  status: string;
  filial: string | null;
  sala: string | null;
}

export interface SwitchMapeamento {
  id: number;
  nome: string | null;
  marca: string;
  modelo: string;
  status: string;
  filial: string | null;
  sala: string | null;
  numero_portas: number | null;
  portas_em_uso: number | null;
}

export async function listarInterfacesRede(subrede?: string): Promise<InterfaceRede[]> {
  const query = subrede ? `?subrede=${encodeURIComponent(subrede)}` : '';
  const resposta = await fetchComToken(`/api/mapeamento-rede${query}`);
  return resposta.dados;
}

export async function listarSwitchesMapeamento(): Promise<SwitchMapeamento[]> {
  const resposta = await fetchComToken('/api/mapeamento-rede/switches');
  return resposta.dados;
}
