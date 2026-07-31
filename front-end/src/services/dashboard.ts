import { fetchComToken } from './api';

// Espelha ResumoDashboard de back-end/src/services/dashboardService.ts.
// O controller faz spread direto: { sucesso: true, ...dados }
// então os campos ficam na raiz da resposta — sem envelope ".dados".

export interface AtivoPorCategoria {
  categoria: string;
  quantidade: number;
}

export interface GarantiaVencendo {
  id: number;
  nome: string | null;
  marca: string;
  modelo: string;
  categoria: string;
  data_garantia: string;
}

export interface RedeMetrica {
  total: number;
  emUso: number;
}

export interface CameraMetrica {
  total: number;
  ativas: number;
  inativas: number;
}

export interface ImpressoraMetrica {
  total: number;
}

export interface ResumoDashboard {
  sucesso: boolean;
  totalAtivos: number;
  totalEmManutencao: number;
  totalEstoque: number;
  totalDescartados: number;
  ativosPorCategoria: AtivoPorCategoria[];
  garantiasVencendo: GarantiaVencendo[];
  garantiasVencendoTotal: number;
  rede: RedeMetrica;
  cameras: CameraMetrica;
  impressoras: ImpressoraMetrica;
}

export async function buscarResumoDashboard(): Promise<ResumoDashboard> {
  return fetchComToken('/api/dashboard') as Promise<ResumoDashboard>;
}
