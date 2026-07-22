import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
  perfilExigido?: string;
}

export function PrivateRoute({ children, perfilExigido }: PrivateRouteProps) {
  const { token, usuario } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (perfilExigido && usuario?.perfil !== perfilExigido) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
