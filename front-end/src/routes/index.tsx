import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { Layout } from '../components/Layout/Layout';
import { Login } from '../pages/Login/Login';
import Cadastro from '../pages/Equipamentos/Cadastro';
import Opcoes from '../pages/Admin/Opcoes';
import ComputadoresOpcoes from '../pages/Admin/Opcoes/Computadores';
import SwitchesOpcoes from '../pages/Admin/Opcoes/Switches';
import CelularesOpcoes from '../pages/Admin/Opcoes/Celulares';
import NvrCameraOpcoes from '../pages/Admin/Opcoes/NvrCamera';
import Localizacoes from '../pages/Admin/Localizacoes';
import Usuarios from '../pages/Admin/Usuarios';
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

          <Route
            element={
              <PrivateRoute perfilExigido="ADMIN">
                <Outlet />
              </PrivateRoute>
            }
          >
            <Route path="/admin/opcoes" element={<Opcoes />} />
            <Route path="/admin/opcoes/computadores" element={<ComputadoresOpcoes />} />
            <Route path="/admin/opcoes/switches" element={<SwitchesOpcoes />} />
            <Route path="/admin/opcoes/celulares" element={<CelularesOpcoes />} />
            <Route path="/admin/opcoes/nvr-camera" element={<NvrCameraOpcoes />} />
            <Route path="/admin/localizacoes" element={<Localizacoes />} />
            <Route path="/admin/usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
