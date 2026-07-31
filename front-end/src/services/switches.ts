import { fetchComToken } from './api';

export interface SwitchResumo {
  id: number;
  nome: string | null;
  marca: string;
  modelo: string;
  status: string;
  numero_portas: number | null;
  portas_ocupadas: number;
  filial: string | null;
  sala: string | null;
  ips: string[];
  macs: string[];
}

export interface EquipamentoConectavel {
  id: number;
  nome: string | null;
  marca: string;
  modelo: string;
  categoria: string;
  ips: string[];
}

export async function listarSwitches(): Promise<SwitchResumo[]> {
  const resposta = await fetchComToken('/api/switches');
  return resposta.dados;
}

export async function listarEquipamentosConectaveis(excluirId: number): Promise<EquipamentoConectavel[]> {
  const resposta = await fetchComToken(`/api/switches/equipamentos-conectaveis?excluirId=${excluirId}`);
  return resposta.dados;
}
