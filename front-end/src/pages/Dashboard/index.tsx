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

  const temInfraestrutura =
    dados &&
    ((dados.portasSwitch?.total ?? 0) > 0 || (dados.canaisNvr?.total ?? 0) > 0);

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

      {/* ── Seção "Utilização de infraestrutura" ──────────────────────────── */}
      {temInfraestrutura && (
        <section className={styles.secao}>
          <h2 className={styles.secaoTitulo}>Utilização de infraestrutura</h2>
          <div className={styles.gradeInfraestrutura}>
            {(dados.portasSwitch?.total ?? 0) > 0 && (() => {
              const { total, ocupadas } = dados.portasSwitch;
              const perc = Math.round((ocupadas / total) * 100);
              return (
                <div className={styles.cardInfraestrutura}>
                  <div className={styles.infraCabecalho}>
                    <span className={styles.infraTitulo}>Portas de Switch em uso</span>
                    <span className={styles.infraValorText}>
                      {ocupadas} de {total} ({perc}%)
                    </span>
                  </div>
                  <div className={styles.barraProgressoTrilho}>
                    <div
                      className={styles.barraProgressoPreenchimento}
                      style={{ width: `${Math.min(perc, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {(dados.canaisNvr?.total ?? 0) > 0 && (() => {
              const { total, ocupadas } = dados.canaisNvr;
              const perc = Math.round((ocupadas / total) * 100);
              return (
                <div className={styles.cardInfraestrutura}>
                  <div className={styles.infraCabecalho}>
                    <span className={styles.infraTitulo}>Canais de NVR em uso</span>
                    <span className={styles.infraValorText}>
                      {ocupadas} de {total} ({perc}%)
                    </span>
                  </div>
                  <div className={styles.barraProgressoTrilho}>
                    <div
                      className={styles.barraProgressoPreenchimento}
                      style={{ width: `${Math.min(perc, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}
    </div>
  );
}
