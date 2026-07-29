import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarNvrs } from '../../../services/nvrs';
import type { NvrResumo } from '../../../services/nvrs';
import { useToast } from '../../../contexts/ToastContext';
import styles from './Listagem.module.css';

function corDoStatus(status: string): React.CSSProperties {
  const mapa: Record<string, React.CSSProperties> = {
    ATIVO: { backgroundColor: 'var(--status-ativo-fundo)', color: 'var(--status-ativo-texto)' },
    ESTOQUE: { backgroundColor: 'var(--status-estoque-fundo)', color: 'var(--status-estoque-texto)' },
    MANUTENCAO: { backgroundColor: 'var(--status-manutencao-fundo)', color: 'var(--status-manutencao-texto)' },
    DESCARTADO: { backgroundColor: 'var(--status-descartado-fundo)', color: 'var(--status-descartado-texto)' },
  };
  return mapa[status] ?? { backgroundColor: 'var(--cor-input-borda)', color: 'var(--cor-texto)' };
}

function rotuloStatus(status: string): string {
  const rotulos: Record<string, string> = {
    ATIVO: 'Ativo',
    ESTOQUE: 'Em estoque',
    MANUTENCAO: 'Manutenção',
    DESCARTADO: 'Descartado',
  };
  return rotulos[status] ?? status;
}

export default function NvrsListagem() {
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const [nvrs, setNvrs] = useState<NvrResumo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarNvrs()
      .then(setNvrs)
      .catch((erro) => {
        console.error('Erro ao carregar NVRs:', erro);
        mostrarToast('Não foi possível carregar a lista de NVRs.', 'erro');
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className={styles.cartao} style={{ padding: '1.5rem' }}>
      <div className={styles.cabecalhoAcoes}>
        <h2>NVRs</h2>
      </div>

      <div className={styles.areaRolagem}>
        {carregando ? (
          <p>Carregando NVRs...</p>
        ) : nvrs.length === 0 ? (
          <p className={styles.listaVazia}>Nenhum NVR cadastrado.</p>
        ) : (
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Nome / Equipamento</th>
                <th>Localização</th>
                <th>Canais</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {nvrs.map((item) => {
                const totalCanais = item.quantidade_canais ?? 0;
                const emUso = item.canais_ocupados ?? 0;
                const textoLocalizacao =
                  [item.filial, item.sala].filter(Boolean).join(' - ') || 'Não definida';

                return (
                  <tr
                    key={item.id}
                    className={styles.linhaClicavel}
                    onClick={() => navigate(`/nvrs/${item.id}`)}
                  >
                    <td>
                      <strong>{item.nome || `${item.marca} ${item.modelo}`}</strong>
                      <br />
                      <small style={{ color: 'var(--cor-texto-suave)' }}>
                        {item.marca} {item.modelo}
                      </small>
                    </td>
                    <td>{textoLocalizacao}</td>
                    <td>
                      <span className={styles.tagPortas}>
                        {emUso}/{totalCanais} em uso
                      </span>
                    </td>
                    <td>
                      <span className={styles.statusBadge} style={corDoStatus(item.status)}>
                        {rotuloStatus(item.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
