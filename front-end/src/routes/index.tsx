import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { Layout } from '../components/Layout/Layout';
import { Login } from '../pages/Login/Login';
import Cadastro from '../pages/Equipamentos/Cadastro';
import Opcoes from '../pages/Admin/Opcoes';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <PrivateRoute>
              <Layout>
                <Outlet />
              </Layout>
            </PrivateRoute>
          }
        >
          <Route index element={<div>Dashboard em construção</div>} />
          <Route
            path="/equipamentos"
            element={
              <div>
                <p>Listagem de Equipamentos</p>
                <Link to="/equipamentos/cadastro">+ Novo Equipamento</Link>
              </div>
            }
          />
          <Route path="/equipamentos/cadastro" element={<Cadastro />} />
          <Route path="/admin/opcoes" element={<Opcoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
