import { fetchComToken } from './api';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  ativo: number;
}

export interface DadosCriacaoUsuario {
  nome: string;
  email: string;
  senha: string;
  perfil: string;
}

export interface DadosEdicaoUsuario {
  nome?: string;
  perfil?: string;
  ativo?: boolean;
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const resposta = await fetchComToken('/api/usuarios');
  return resposta.dados;
}

export async function criarUsuario(dados: DadosCriacaoUsuario) {
  return fetchComToken('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function editarUsuario(id: number, dados: DadosEdicaoUsuario) {
  return fetchComToken(`/api/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export async function redefinirSenha(id: number, novaSenha: string) {
  return fetchComToken(`/api/usuarios/${id}/senha`, {
    method: 'PUT',
    body: JSON.stringify({ senha: novaSenha }),
  });
}
