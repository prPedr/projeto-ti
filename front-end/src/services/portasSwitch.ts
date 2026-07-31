import { fetchComToken } from './api';

export interface PortaSwitch {
  id: number;
  switch_id: number;
  numero_porta: number;
  equipamento_conectado_id: number | null;
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

export async function listarPortasSwitch(switchId: number): Promise<PortaSwitch[]> {
  const resposta = await fetchComToken(`/api/switches/${switchId}/portas`);
  return resposta.dados;
}

export async function atualizarPorta(
  switchId: number,
  numeroPorta: number,
  dados: { equipamento_conectado_id?: number | null; descricao?: string | null }
): Promise<void> {
  await fetchComToken(`/api/switches/${switchId}/portas/${numeroPorta}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}
