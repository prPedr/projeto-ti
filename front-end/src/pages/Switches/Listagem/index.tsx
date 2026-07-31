import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarSwitches } from '../../../services/switches';
import type { SwitchResumo } from '../../../services/switches';
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

export default function SwitchesListagem() {
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const [switches, setSwitches] = useState<SwitchResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroSwitch, setFiltroSwitch] = useState('');

  useEffect(() => {
    listarSwitches()
      .then(setSwitches)
      .catch((erro) => {
        console.error('Erro ao carregar switches:', erro);
        mostrarToast('Não foi possível carregar a lista de switches.', 'erro');
      })
      .finally(() => setCarregando(false));
  }, []);

  const switchesFiltrados = useMemo(() => {
    if (!filtroSwitch.trim()) return switches;
    const termo = filtroSwitch.toLowerCase();
    return switches.filter((sw) => {
      const texto = `${sw.nome ?? ''} ${sw.marca} ${sw.modelo} ${(sw.ips ?? []).join(' ')} ${(sw.macs ?? []).join(' ')}`.toLowerCase();
      return texto.includes(termo);
    });
  }, [switches, filtroSwitch]);

  return (
    <div className={styles.cartao} style={{ padding: '1.5rem' }}>
      <div className={styles.cabecalhoAcoes}>
        <h2>Switches</h2>
      </div>

      <div className={styles.barraBusca}>
        <input
          className={styles.inputBusca}
          type="search"
          value={filtroSwitch}
          onChange={(e) => setFiltroSwitch(e.target.value)}
          placeholder="Buscar por nome, IP, MAC, marca ou modelo..."
        />
      </div>

      <div className={styles.areaRolagem}>
        {carregando ? (
          <p>Carregando switches...</p>
        ) : switches.length === 0 ? (
          <p className={styles.listaVazia}>Nenhum switch cadastrado.</p>
        ) : switchesFiltrados.length === 0 ? (
          <p className={styles.listaVazia}>Nenhum switch encontrado para essa busca.</p>
        ) : (
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Nome / Equipamento</th>
                <th>Localização</th>
                <th>Portas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {switchesFiltrados.map((item) => {
                const totalPortas = item.numero_portas ?? 0;
                const emUso = item.portas_ocupadas ?? 0;
                const textoLocalizacao =
                  [item.filial, item.sala].filter(Boolean).join(' - ') || 'Não definida';

                return (
                  <tr
                    key={item.id}
                    className={styles.linhaClicavel}
                    onClick={() => navigate(`/switches/${item.id}`)}
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
                        {emUso}/{totalPortas} em uso
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
