import { TOKEN_KEY, USUARIO_KEY } from '../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface RespostaErro {
  sucesso: false;
  mensagem: string;
}

interface OpcoesFetch extends RequestInit {
  /**
   * Login usa fetchComToken sem token nenhum: um 401 ali é "senha incorreta",
   * não sessão expirada, então não deve limpar storage nem redirecionar.
   */
  pularTratamento401?: boolean;
}

export async function fetchComToken(url: string, opcoes: OpcoesFetch = {}) {
  const { pularTratamento401, ...opcoesFetch } = opcoes;
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opcoesFetch.headers,
  };

  const resposta = await fetch(`${BASE_URL}${url}`, {
    ...opcoesFetch,
    headers,
  });

  if (resposta.status === 401 && !pularTratamento401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);

    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }

    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const erro = corpo as RespostaErro | null;
    throw new Error(erro?.mensagem ?? 'Erro ao comunicar com o servidor.');
  }

  return corpo;
}
