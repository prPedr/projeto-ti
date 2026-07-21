import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

interface ItemMenu {
  to: string;
  rotulo: string;
  inicial: string;
}

const CHAVE_SIDEBAR_RECOLHIDA = 'appti:sidebar-recolhida';

const ITENS_MENU: ItemMenu[] = [
  { to: '/', rotulo: 'Dashboard', inicial: 'D' },
  { to: '/equipamentos', rotulo: 'Equipamentos', inicial: 'E' },
  { to: '/equipamentos/cadastro', rotulo: 'Novo Equipamento', inicial: 'N' },
];

const ITENS_MENU_ADMIN: ItemMenu[] = [
  { to: '/admin/opcoes', rotulo: 'Opções Pré-definidas', inicial: 'O' },
  { to: '/admin/localizacoes', rotulo: 'Localizações', inicial: 'L' },
];

export function Layout({ children }: LayoutProps) {
  const { usuario } = useAuth();
  const location = useLocation();

  const [recolhida, setRecolhida] = useState(
    () => localStorage.getItem(CHAVE_SIDEBAR_RECOLHIDA) === 'true',
  );

  useEffect(() => {
    localStorage.setItem(CHAVE_SIDEBAR_RECOLHIDA, String(recolhida));
  }, [recolhida]);

  const itens = usuario?.perfil === 'ADMIN' ? [...ITENS_MENU, ...ITENS_MENU_ADMIN] : ITENS_MENU;

  return (
    <div className={`${styles.container} ${recolhida ? styles.recolhida : ''}`}>
      <aside className={styles.sidebar}>
        <div className={styles.cabecalhoSidebar}>
          <span className={styles.logo}>{recolhida ? 'A' : 'AppTI'}</span>

          <button
            type="button"
            className={styles.botaoRecolher}
            onClick={() => setRecolhida((atual) => !atual)}
            aria-label={recolhida ? 'Expandir menu' : 'Recolher menu'}
            title={recolhida ? 'Expandir menu' : 'Recolher menu'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <ul className={styles.menu}>
          {itens.map((item) => {
            const ativo = location.pathname === item.to;

            return (
              <li className={styles.menuItem} key={item.to}>
                <Link
                  to={item.to}
                  className={ativo ? styles.ativo : undefined}
                  title={recolhida ? item.rotulo : undefined}
                >
                  <span className={styles.iconeInicial}>{item.inicial}</span>
                  {!recolhida && <span className={styles.rotulo}>{item.rotulo}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className={styles.conteudoPrincipal}>
        <main className={styles.conteudo}>{children}</main>
      </div>
    </div>
  );
}
