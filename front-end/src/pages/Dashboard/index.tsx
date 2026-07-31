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

      {/* ── Seção "Infraestrutura e Dispositivos" ──────────────────────────── */}
      {dados && (dados.rede || dados.cameras || dados.impressoras) && (
        <section className={styles.secao}>
          <h2 className={styles.secaoTitulo}>Infraestrutura e Dispositivos</h2>
          <div className={styles.gradeInfraestrutura}>
            {dados.rede && (
              <div className={styles.cardInfraestrutura}>
                <div className={styles.infraCabecalho}>
                  <span className={styles.infraTitulo}>Mapeamento de Rede</span>
                  <span className={styles.infraValorText}>
                    {dados.rede.emUso} de {dados.rede.total} IPs em uso (
                    {Math.round((dados.rede.emUso / (dados.rede.total || 1)) * 100)}%)
                  </span>
                </div>
                <div className={styles.barraProgressoTrilho}>
                  <div
                    className={styles.barraProgressoPreenchimento}
                    style={{
                      width: `${Math.min(
                        Math.round((dados.rede.emUso / (dados.rede.total || 1)) * 100),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {dados.cameras && (
              <div className={styles.cardInfraestrutura}>
                <div className={styles.infraCabecalho}>
                  <span className={styles.infraTitulo}>Câmeras de Segurança</span>
                  <span className={styles.infraValorText}>
                    {dados.cameras.total} total ({dados.cameras.ativas} ativas, {dados.cameras.inativas} inativas)
                  </span>
                </div>
                <div className={styles.barraProgressoTrilho}>
                  <div
                    className={styles.barraProgressoPreenchimento}
                    style={{
                      width: `${Math.min(
                        Math.round((dados.cameras.ativas / (dados.cameras.total || 1)) * 100),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {dados.impressoras && (
              <div className={styles.cardInfraestrutura}>
                <div className={styles.infraCabecalho}>
                  <span className={styles.infraTitulo}>Impressoras Cadastradas</span>
                  <span className={styles.infraValorText}>{dados.impressoras.total} unidades</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
