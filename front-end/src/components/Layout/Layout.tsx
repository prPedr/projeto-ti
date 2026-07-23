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
  subItens?: ItemMenu[];
}

const CHAVE_SIDEBAR_RECOLHIDA = 'appti:sidebar-recolhida';

const ITENS_MENU: ItemMenu[] = [
  { to: '/', rotulo: 'Dashboard', inicial: 'D' },
  { to: '/equipamentos', rotulo: 'Equipamentos', inicial: 'E' },
  { to: '/equipamentos/cadastro', rotulo: 'Novo', inicial: 'N' },
];

const ITENS_MENU_ADMIN: ItemMenu[] = [
  {
    to: '/admin/opcoes',
    rotulo: 'Opções',
    inicial: 'O',
    subItens: [
      { to: '/admin/opcoes/computadores', rotulo: 'Computadores', inicial: 'C' },
      { to: '/admin/opcoes/switches', rotulo: 'Switches', inicial: 'S' },
      { to: '/admin/opcoes/celulares', rotulo: 'Celulares', inicial: 'M' },
      { to: '/admin/opcoes/nvr-camera', rotulo: 'NVR/Câmeras', inicial: 'N' },
    ],
  },
  { to: '/admin/localizacoes', rotulo: 'Localizações', inicial: 'L' },
  { to: '/admin/usuarios', rotulo: 'Usuários', inicial: 'U' },
];

export function Layout({ children }: LayoutProps) {
  const { usuario } = useAuth();
  const location = useLocation();

  const [recolhida, setRecolhida] = useState(
    () => localStorage.getItem(CHAVE_SIDEBAR_RECOLHIDA) === 'true',
  );

  const [itemExpandido, setItemExpandido] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(CHAVE_SIDEBAR_RECOLHIDA, String(recolhida));
  }, [recolhida]);

  const itens = usuario?.perfil === 'ADMIN' ? [...ITENS_MENU, ...ITENS_MENU_ADMIN] : ITENS_MENU;

  // Auto-expande se a rota atual for um dos subitens
  useEffect(() => {
    for (const item of itens) {
      if (item.subItens?.some((sub) => sub.to === location.pathname)) {
        setItemExpandido(item.to);
        break;
      }
    }
  }, [location.pathname, itens]);

  return (
    <div className={`${styles.container} ${recolhida ? styles.recolhida : ''}`}>
      <aside className={styles.sidebar}>
        <div className={styles.cabecalhoSidebar}>
          <div className={styles.logo}>
            <span className={styles.logoMarca} aria-hidden="true">TI</span>
            {!recolhida && <span className={styles.logoTexto}>AppTI</span>}
          </div>

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
            const temSubItens = Boolean(item.subItens && item.subItens.length > 0);
            const ehFilhoAtivo = temSubItens && item.subItens!.some((sub) => sub.to === location.pathname);
            const paiAtivo = location.pathname === item.to || ehFilhoAtivo;
            const expandido = !recolhida && itemExpandido === item.to;

            return (
              <li className={styles.menuItem} key={item.to}>
                {temSubItens ? (
                  <button
                    type="button"
                    className={`${styles.menuItemBotao} ${paiAtivo ? styles.ativo : ''}`}
                    title={recolhida ? item.rotulo : undefined}
                    onClick={() => {
                      if (recolhida) {
                        setRecolhida(false);
                        setItemExpandido(item.to);
                      } else {
                        setItemExpandido((prev) => (prev === item.to ? null : item.to));
                      }
                    }}
                  >
                    <span className={styles.iconeInicial}>{item.inicial}</span>
                    {!recolhida && <span className={styles.rotulo}>{item.rotulo}</span>}
                    {!recolhida && (
                      <span className={`${styles.indicadorSeta} ${expandido ? styles.expandido : ''}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.to}
                    className={paiAtivo ? styles.ativo : undefined}
                    title={recolhida ? item.rotulo : undefined}
                  >
                    <span className={styles.iconeInicial}>{item.inicial}</span>
                    {!recolhida && <span className={styles.rotulo}>{item.rotulo}</span>}
                  </Link>
                )}

                {expandido && temSubItens && (
                  <ul className={styles.subMenu}>
                    {item.subItens!.map((subItem) => {
                      const subAtivo = location.pathname === subItem.to;
                      return (
                        <li className={styles.subMenuItem} key={subItem.to}>
                          <Link
                            to={subItem.to}
                            className={subAtivo ? styles.ativo : undefined}
                          >
                            <span className={styles.iconeInicialSub}>{subItem.inicial}</span>
                            <span className={styles.rotulo}>{subItem.rotulo}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
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
