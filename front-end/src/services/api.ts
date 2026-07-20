const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface RespostaErro {
  sucesso: false;
  mensagem: string;
}

export async function fetchComToken(url: string, opcoes: RequestInit = {}) {
  const token = localStorage.getItem('@AppTI:token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opcoes.headers,
  };

  const resposta = await fetch(`${BASE_URL}${url}`, {
    ...opcoes,
    headers,
  });

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const erro = corpo as RespostaErro | null;
    throw new Error(erro?.mensagem ?? 'Erro ao comunicar com o servidor.');
  }

  return corpo;
}
