import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buscarResumoDashboard, type ResumoDashboard } from '../../services/dashboard';
import styles from './Dashboard.module.css';

// Rótulos legíveis para cada categoria vinda do banco (uppercase, sem acento)
const ROTULOS_CATEGORIA: Record<string, string> = {
  COMPUTADOR: 'Computadores',
  SWITCH:     'Switches',
  CELULAR:    'Celulares',
  NVR:        'NVRs',
  CAMERA:     'Câmeras',
  IMPRESSORA: 'Impressoras',
  ANTENA:     'Antenas Wi-Fi',
};

export default function Dashboard() {
  const [dados, setDados] = useState<ResumoDashboard | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setCarregando(true);
    setErro(null);

    buscarResumoDashboard()
      .then(setDados)
      .catch((e: unknown) => {
        setErro(e instanceof Error ? e.message : 'Erro ao carregar o dashboard.');
      })
      .finally(() => setCarregando(false));
  }, []);

  // ── Skeleton de carregamento ──────────────────────────────────────────────
  if (carregando) {
    return (
      <div>
        <div className={styles.cabecalho}>
          <h1 className={styles.titulo}>Visão Geral</h1>
          <p className={styles.subtitulo}>Carregando dados…</p>
        </div>
        <div className={styles.skeleton}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  // ── Estado de erro ────────────────────────────────────────────────────────
  if (erro) {
    return (
      <div>
        <div className={styles.cabecalho}>
          <h1 className={styles.titulo}>Visão Geral</h1>
        </div>
        <div className={styles.erroContainer}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {erro}
        </div>
      </div>
    );
  }

  // ── Dashboard com dados ───────────────────────────────────────────────────
  const cardsMetrica = [
    {
      label: 'Equipamentos ativos',
      valor: dados?.totalAtivos ?? 0,
      pip: 'var(--status-ativo-texto)',
    },
    {
      label: 'Em manutenção',
      valor: dados?.totalEmManutencao ?? 0,
      pip: 'var(--status-manutencao-texto)',
    },
    {
      label: 'Em estoque',
      valor: dados?.totalEstoque ?? 0,
      pip: 'var(--status-estoque-texto)',
    },
    {
      label: 'Descartados',
      valor: dados?.totalDescartados ?? 0,
      pip: 'var(--status-descartado-texto)',
    },
    {
      label: 'Total no inventário',
      valor: (dados?.totalAtivos ?? 0) + (dados?.totalEmManutencao ?? 0) + (dados?.totalEstoque ?? 0),
      pip: 'var(--cor-acento)',
    },
  ];

  return (
    <div>
      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <div className={styles.cabecalho}>
        <h1 className={styles.titulo}>Visão Geral</h1>
        <p className={styles.subtitulo}>Resumo do inventário de equipamentos de TI</p>
      </div>

      {/* ── Cards de métrica principal ────────────────────────────────────── */}
      <div className={styles.gradeMetricas}>
        {cardsMetrica.map((card) => (
          <div key={card.label} className={styles.cardMetrica}>
            <div className={styles.cardPip} style={{ backgroundColor: card.pip }} />
            <span className={styles.cardValor}>{card.valor}</span>
            <span className={styles.cardLabel}>{card.label}</span>
          </div>
        ))}
      </div>

      {/* ── Ativos por categoria ──────────────────────────────────────────── */}
      {dados && dados.ativosPorCategoria.length > 0 && (
        <section className={styles.secao}>
          <h2 className={styles.secaoTitulo}>Ativos por categoria</h2>
          <div className={styles.gradeCategorias}>
            {dados.ativosPorCategoria.map((item) => (
              <div key={item.categoria} className={styles.cardCategoria}>
                <span className={styles.categoriaValor}>{item.quantidade}</span>
                <span className={styles.categoriaLabel}>
                  {ROTULOS_CATEGORIA[item.categoria] ?? item.categoria.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Seção "Garantias Vencendo" ────────────────────────────────────── */}
      {dados && (dados.garantiasVencendoTotal ?? 0) > 0 && (
        <section className={styles.secao}>
          <h2 className={`${styles.secaoTitulo} ${styles.secaoTituloAviso}`}>
            Garantias vencendo nos próximos 30 dias ({dados.garantiasVencendoTotal})
          </h2>
          <div className={styles.listaGarantias}>
            {dados.garantiasVencendo.map((item) => {
              const dataFormatada = item.data_garantia
                ? item.data_garantia.split('-').reverse().join('/')
                : '—';
              const tituloItem = [item.nome, `${item.marca} ${item.modelo}`].filter(Boolean).join(' - ');
              const rotuloCat = ROTULOS_CATEGORIA[item.categoria] ?? item.categoria;

              return (
                <Link
                  key={item.id}
                  to={`/equipamentos/${item.id}`}
                  className={styles.cardGarantia}
                >
                  <div className={styles.garantiaInfo}>
                    <span className={styles.garantiaTitulo}>{tituloItem}</span>
                    <span className={styles.garantiaCategoria}>{rotuloCat}</span>
                  </div>
                  <div className={styles.garantiaDataContainer}>
                    <span className={styles.garantiaDataLabel}>Vence em</span>
                    <span className={styles.garantiaData}>{dataFormatada}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          {dados.garantiasVencendoTotal > (dados.garantiasVencendo?.length ?? 0) && (
            <p className={styles.garantiasMaisInfo}>
              + {dados.garantiasVencendoTotal - dados.garantiasVencendo.length} outros equipamentos com garantia a vencer.
            </p>
          )}
        </section>
      )}

      {/* ── Seção "Infraestrutura e Dispositivos" (Monobloco Flat) ─────────── */}
      {dados && (
        <section className={styles.secao}>
          <h2 className={styles.secaoTitulo}>Infraestrutura e Dispositivos</h2>
          <div className={styles.gridCards}>
            {/* Card 1: Mapeamento de Rede */}
            <div className={styles.cardMetrica}>
              <div className={styles.cardTopHeader}>
                <span className={styles.cardLabel}>Mapeamento de Rede</span>
                <div className={styles.cardIconeContainer}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                </div>
              </div>
              <span className={styles.cardValor}>
                {dados.rede?.emUso ?? 0} / {dados.rede?.total ?? 254} IPs em Uso
              </span>
              <div className={styles.barraProgressoTrilho}>
                <div
                  className={styles.barraProgressoPreenchimento}
                  style={{
                    width: `${Math.min(
                      Math.round(((dados.rede?.emUso ?? 0) / (dados.rede?.total || 1)) * 100),
                      100
                    )}%`,
                  }}
                />
              </div>
              <span className={styles.infraValorText}>
                {Math.round(((dados.rede?.emUso ?? 0) / (dados.rede?.total || 1)) * 100)}% da capacidade utilizada
              </span>
            </div>

            {/* Card 2: Câmeras de Segurança */}
            <div className={styles.cardMetrica}>
              <div className={styles.cardTopHeader}>
                <span className={styles.cardLabel}>Câmeras de Segurança</span>
                <div className={styles.cardIconeContainer}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
              <span className={styles.cardValor}>{dados.cameras?.total ?? 0} Câmeras</span>
              <div className={styles.badgeGroup}>
                <span className={styles.badgeFlatAtivo}>Ativas: {dados.cameras?.ativas ?? 0}</span>
                <span className={styles.badgeFlatInativo}>Inativas: {dados.cameras?.inativas ?? 0}</span>
              </div>
            </div>

            {/* Card 3: Impressoras */}
            <div className={styles.cardMetrica}>
              <div className={styles.cardTopHeader}>
                <span className={styles.cardLabel}>Impressoras</span>
                <div className={styles.cardIconeContainer}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                </div>
              </div>
              <span className={styles.cardValor}>{dados.impressoras?.total ?? 0} Impressoras</span>
              <span className={styles.cardLabel}>Equipamentos inventariados</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
