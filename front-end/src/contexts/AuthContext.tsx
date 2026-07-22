/**
 * ARCHITECTURE DECISION / SECURITY NOTE:
 * O token JWT é armazenado em `localStorage` por simplicidade de implementação
 * e conveniência em aplicações SPA desacopladas.
 * 
 * TRADE-OFF DE SEGURANÇA:
 * Tokens em localStorage ficam acessíveis via JavaScript no navegador e, portanto,
 * seriam suscetíveis a roubo em caso de vulnerabilidade de XSS (Cross-Site Scripting).
 * Para mitigar esse risco:
 * 1. Todos os inputs no front-end são renderizados via JSX com auto-escaping nativo do React.
 * 2. Nenhum componente faz uso de `dangerouslySetInnerHTML`, `innerHTML`, `eval()` ou dinâmicas similares.
 * 3. O back-end utiliza cabeçalhos de segurança (Helmet/CSP) e sanitização estrita de dados.
 * 
 * Se no futuro a aplicação demandar proteção contra XSS de nível bancário/financeiro,
 * o token pode ser migrado para Cookie HTTP-Only com SameSite=Strict/Lax.
 */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextData, Usuario } from '../types/auth';

const TOKEN_KEY = '@AppTI:token';
const USUARIO_KEY = '@AppTI:usuario';

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Lidos via inicializador "preguiçoso" (em vez de useEffect) para que
  // token/usuario já estejam corretos na primeira renderização — se a leitura
  // ficasse num useEffect, o PrivateRoute veria token=null nesse primeiro
  // render e redirecionaria para /login mesmo com uma sessão válida salva.
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const usuarioArmazenado = localStorage.getItem(USUARIO_KEY);

    if (!usuarioArmazenado) {
      return null;
    }

    try {
      return JSON.parse(usuarioArmazenado);
    } catch {
      // Dado corrompido/inválido não deve derrubar a aplicação inteira.
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  function login(token: string, usuario: Usuario) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));

    setToken(token);
    setUsuario(usuario);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);

    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }

  return context;
}
