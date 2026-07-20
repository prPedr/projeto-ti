import { fetchComToken } from './api';
import type { Usuario } from '../types/auth';

interface RespostaLogin {
  token: string;
  usuario: Usuario;
}

export async function realizarLogin(email: string, senha: string): Promise<RespostaLogin> {
  return fetchComToken('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}
