export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  login(token: string, usuario: Usuario): void;
  logout(): void;
}
