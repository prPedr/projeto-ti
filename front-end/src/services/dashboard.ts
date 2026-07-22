import { fetchComToken } from './api';

// Espelha ResumoDashboard de back-end/src/services/dashboardService.ts.
// O controller faz spread direto: { sucesso: true, ...dados }
// então os campos ficam na raiz da resposta — sem envelope ".dados".

export interface AtivoPorCategoria {
  categoria: string;
  quantidade: number;
}

export interface ResumoDashboard {
  sucesso: boolean;
  totalAtivos: number;
  totalEmManutencao: number;
  ativosPorCategoria: AtivoPorCategoria[];
}

export async function buscarResumoDashboard(): Promise<ResumoDashboard> {
  return fetchComToken('/api/dashboard') as Promise<ResumoDashboard>;
}
