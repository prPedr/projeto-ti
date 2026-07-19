import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { Layout } from '../components/Layout/Layout';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Tela de Login</div>} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <div>Dashboard Protegido</div>
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/equipamentos"
          element={
            <PrivateRoute>
              <Layout>
                <div>Listagem de Equipamentos</div>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
