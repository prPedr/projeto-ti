import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { Layout } from '../components/Layout/Layout';
import { Login } from '../pages/Login/Login';
import Cadastro from '../pages/Equipamentos/Cadastro';
import Opcoes from '../pages/Admin/Opcoes';
import Localizacoes from '../pages/Admin/Localizacoes';
import Listagem from '../pages/Equipamentos/Listagem';
import Detalhes from '../pages/Equipamentos/Detalhes';
import Dashboard from '../pages/Dashboard';

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
          <Route index element={<Dashboard />} />
          <Route path="/equipamentos" element={<Listagem />} />
          <Route path="/equipamentos/cadastro" element={<Cadastro />} />
          <Route path="/equipamentos/:id" element={<Detalhes />} />
          <Route path="/admin/opcoes" element={<Opcoes />} />
          <Route path="/admin/localizacoes" element={<Localizacoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
