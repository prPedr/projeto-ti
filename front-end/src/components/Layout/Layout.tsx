import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { usuario } = useAuth();

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>AppTI</div>

        <ul className={styles.menu}>
          <li className={styles.menuItem}>
            <Link to="/">Dashboard</Link>
          </li>
          <li className={styles.menuItem}>
            <Link to="/equipamentos">Equipamentos</Link>
          </li>
          <li className={styles.menuItem}>
            <Link to="/equipamentos/cadastro">Novo Equipamento</Link>
          </li>
          {usuario?.perfil === 'ADMIN' && (
            <li className={styles.menuItem}>
              <Link to="/admin/opcoes">Opções Pré-definidas</Link>
            </li>
          )}
        </ul>
      </aside>

      <div className={styles.conteudoPrincipal}>
        <header className={styles.cabecalho}>
          <h1>Painel de Controle</h1>
        </header>

        <main className={styles.conteudo}>{children}</main>
      </div>
    </div>
  );
}
