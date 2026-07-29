import { fetchComToken } from './api';

export interface ComputadorConectavel {
  id: number;
  nome: string | null;
  marca: string;
  modelo: string;
}

export async function listarComputadoresConectaveis() {
  return fetchComToken('/api/impressoras/computadores-conectaveis').then(
    (r) => r.dados as ComputadorConectavel[],
  );
}
