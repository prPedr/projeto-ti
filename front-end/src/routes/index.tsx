import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Tela de Login</div>} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <div>Dashboard Protegido</div>
            </PrivateRoute>
          }
        />

        <Route
          path="/equipamentos"
          element={
            <PrivateRoute>
              <div>Listagem de Equipamentos</div>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
