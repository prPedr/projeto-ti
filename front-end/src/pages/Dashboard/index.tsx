import { useEffect, useState } from 'react';
import { buscarResumoDashboard, type ResumoDashboard } from '../../services/dashboard';
import styles from './Dashboard.module.css';

// Rótulos legíveis para cada categoria vinda do banco (uppercase, sem acento)
const ROTULOS_CATEGORIA: Record<string, string> = {
  COMPUTADOR: 'Computadores',
  SWITCH:     'Switches',
  CELULAR:    'Celulares',
  NVR:        'NVRs',
  CAMERA:     'Câmeras',
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
          {Array.from({ length: 4 }).map((_, i) => (
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
  const totalDescartados = 0; // backend não expõe ainda — placeholder tipado

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
      label: 'Total no inventário',
      valor: (dados?.totalAtivos ?? 0) + (dados?.totalEmManutencao ?? 0),
      pip: 'var(--cor-acento)',
    },
  ];

  void totalDescartados; // silencia lint enquanto o backend não expõe o campo

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
    </div>
  );
}
