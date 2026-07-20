import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { Layout } from '../components/Layout/Layout';
import { Login } from '../pages/Login/Login';
import Cadastro from '../pages/Equipamentos/Cadastro';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

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

        <Route
          path="/equipamentos/cadastro"
          element={
            <PrivateRoute>
              <Layout>
                <Cadastro />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
