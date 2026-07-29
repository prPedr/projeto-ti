import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { Layout } from '../components/Layout/Layout';
import { Login } from '../pages/Login/Login';
import Cadastro from '../pages/Equipamentos/Cadastro';
import Opcoes from '../pages/Admin/Opcoes';
import ComputadoresOpcoes from '../pages/Admin/Opcoes/Computadores';
import SwitchesOpcoes from '../pages/Admin/Opcoes/Switches';
import CelularesOpcoes from '../pages/Admin/Opcoes/Celulares';
import NvrsOpcoes from '../pages/Admin/Opcoes/Nvrs';
import CamerasOpcoes from '../pages/Admin/Opcoes/Cameras';
import ImpressorasOpcoes from '../pages/Admin/Opcoes/Impressoras';
import AntenasOpcoes from '../pages/Admin/Opcoes/Antenas';
import Localizacoes from '../pages/Admin/Localizacoes';
import Usuarios from '../pages/Admin/Usuarios';
import Listagem from '../pages/Equipamentos/Listagem';
import Detalhes from '../pages/Equipamentos/Detalhes';
import Dashboard from '../pages/Dashboard';
import MapeamentoRede from '../pages/MapeamentoRede';
import SwitchesListagem from '../pages/Switches/Listagem';
import SwitchesPortas from '../pages/Switches/Portas';

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
          <Route path="/mapeamento-rede" element={<MapeamentoRede />} />
          <Route path="/switches" element={<SwitchesListagem />} />
          <Route path="/switches/:id" element={<SwitchesPortas />} />

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
            <Route path="/admin/opcoes/nvrs" element={<NvrsOpcoes />} />
            <Route path="/admin/opcoes/cameras" element={<CamerasOpcoes />} />
            <Route path="/admin/opcoes/impressoras" element={<ImpressorasOpcoes />} />
            <Route path="/admin/opcoes/antenas" element={<AntenasOpcoes />} />
            <Route path="/admin/localizacoes" element={<Localizacoes />} />
            <Route path="/admin/usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
