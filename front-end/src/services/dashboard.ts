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

export interface UtilizacaoRecurso {
  total: number;
  ocupadas: number;
}

export interface ResumoDashboard {
  sucesso: boolean;
  totalAtivos: number;
  totalEmManutencao: number;
  totalEstoque: number;
  totalDescartados: number;
  ativosPorCategoria: AtivoPorCategoria[];
  portasSwitch: UtilizacaoRecurso;
  canaisNvr: UtilizacaoRecurso;
  garantiasVencendo: GarantiaVencendo[];
  garantiasVencendoTotal: number;
}

export async function buscarResumoDashboard(): Promise<ResumoDashboard> {
  return fetchComToken('/api/dashboard') as Promise<ResumoDashboard>;
}
