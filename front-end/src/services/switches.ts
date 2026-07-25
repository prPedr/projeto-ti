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
}

export async function listarSwitches(): Promise<SwitchResumo[]> {
  const resposta = await fetchComToken('/api/switches');
  return resposta.dados;
}
