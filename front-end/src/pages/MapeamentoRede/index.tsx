import React, { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarInterfacesRede } from '../../services/mapeamentoRede';
import type { InterfaceRede } from '../../services/mapeamentoRede';
import { useToast } from '../../contexts/ToastContext';
import styles from './MapeamentoRede.module.css';

function octetos(ip: string): number[] {
  return ip.split('.').map((parte) => Number(parte));
}

// ip é sempre comparado octeto a octeto como número — comparação de string
// colocaria "192.168.1.10" antes de "192.168.1.2".
function compararIp(a: string, b: string): number {
  const octetosA = octetos(a);
  const octetosB = octetos(b);

  for (let indice = 0; indice < 4; indice += 1) {
    if (octetosA[indice] !== octetosB[indice]) {
      return octetosA[indice] - octetosB[indice];
    }
  }

  return 0;
}

function subRedeDoIp(ip: string): string {
  return ip.split('.').slice(0, 3).join('.');
}

interface GrupoSubRede {
  subRede: string;
  interfaces: InterfaceRede[];
}

function agruparPorSubRede(interfaces: InterfaceRede[]): GrupoSubRede[] {
  const ordenadas = [...interfaces].sort((a, b) => compararIp(a.ip, b.ip));

  const gruposMap = new Map<string, InterfaceRede[]>();
  for (const item of ordenadas) {
    const subRede = subRedeDoIp(item.ip);
    if (!gruposMap.has(subRede)) {
      gruposMap.set(subRede, []);
    }
    gruposMap.get(subRede)!.push(item);
  }

  return Array.from(gruposMap.entries())
    .map(([subRede, itens]) => ({ subRede, interfaces: itens }))
    .sort((a, b) => compararIp(`${a.subRede}.0`, `${b.subRede}.0`));
}

/** Converte o valor uppercase do banco para rótulo legível em português. */
function rotuloStatus(status: string): string {
  const rotulos: Record<string, string> = {
    ATIVO: 'Ativo',
    ESTOQUE: 'Em estoque',
    MANUTENCAO: 'Manutenção',
    DESCARTADO: 'Descartado',
  };
  return rotulos[status] ?? status;
}

function corDoStatus(status: string): React.CSSProperties {
  const mapa: Record<string, React.CSSProperties> = {
    ATIVO: { backgroundColor: 'var(--status-ativo-fundo)', color: 'var(--status-ativo-texto)' },
    ESTOQUE: { backgroundColor: 'var(--status-estoque-fundo)', color: 'var(--status-estoque-texto)' },
    MANUTENCAO: { backgroundColor: 'var(--status-manutencao-fundo)', color: 'var(--status-manutencao-texto)' },
    DESCARTADO: { backgroundColor: 'var(--status-descartado-fundo)', color: 'var(--status-descartado-texto)' },
  };
  return mapa[status] ?? { backgroundColor: 'var(--cor-input-borda)', color: 'var(--cor-texto)' };
}

export default function MapeamentoRede() {
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const [interfaces, setInterfaces] = useState<InterfaceRede[]>([]);
  const [subredeBusca, setSubredeBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [gruposExpandidos, setGruposExpandidos] = useState<Set<string>>(new Set());

  function alternarGrupo(subRede: string) {
    setGruposExpandidos((anterior) => {
      const novo = new Set(anterior);
      if (novo.has(subRede)) {
        novo.delete(subRede);
      } else {
        novo.add(subRede);
      }
      return novo;
    });
  }

  function carregarDados(subrede?: string) {
    setCarregando(true);
    listarInterfacesRede(subrede || undefined)
      .then((dados) => {
        setInterfaces(dados);
        // Auto-expandir todos os grupos retornados quando há busca ativa.
        // Ao limpar a busca (subrede vazia/undefined), recolhe tudo.
        if (subrede) {
          const grupos = agruparPorSubRede(dados);
          setGruposExpandidos(new Set(grupos.map((g) => g.subRede)));
        } else {
          setGruposExpandidos(new Set());
        }
      })
      .catch((erro) => {
        console.error('Erro ao carregar mapeamento de rede:', erro);
        mostrarToast('Não foi possível carregar o mapeamento de rede.', 'erro');
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function handleBuscar(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    carregarDados(subredeBusca.trim());
  }

  const grupos = agruparPorSubRede(interfaces);

  const todosExpandidos = grupos.length > 0 && grupos.every((g) => gruposExpandidos.has(g.subRede));

  function alternarTodos() {
    if (todosExpandidos) {
      setGruposExpandidos(new Set());
    } else {
      setGruposExpandidos(new Set(grupos.map((g) => g.subRede)));
    }
  }

  return (
    <div className={styles.cartao}>
      <div className={styles.cabecalhoAcoes}>
        <h2>Mapeamento de Rede</h2>
        <form className={styles.barraBusca} onSubmit={handleBuscar}>
          <input
            className={styles.input}
            value={subredeBusca}
            onChange={(event) => setSubredeBusca(event.target.value)}
            placeholder="Filtrar por sub-rede, IP ou MAC (ex: 192.168.1 ou 192.168.1.42)"
          />
        </form>
      </div>

      <div className={styles.areaRolagem}>
        {carregando ? (
          <p>Carregando mapeamento de rede...</p>
        ) : interfaces.length === 0 ? (
          <p className={styles.listaVazia}>Nenhuma interface de rede cadastrada.</p>
        ) : (
          <>
            <div className={styles.controleExpansao}>
              <button
                type="button"
                className={styles.botaoExpansao}
                onClick={alternarTodos}
              >
                {todosExpandidos ? 'Recolher todos' : 'Expandir todos'}
              </button>
            </div>

            {grupos.map((grupo) => {
              const expandido = gruposExpandidos.has(grupo.subRede);
              return (
                <div key={grupo.subRede} className={styles.blocoSubRede}>
                  <button
                    type="button"
                    className={styles.cabecalhoGrupo}
                    onClick={() => alternarGrupo(grupo.subRede)}
                    aria-expanded={expandido}
                  >
                    <span className={styles.tituloSubRede}>
                      {grupo.subRede}.0/24
                      <span className={styles.contagem}>{grupo.interfaces.length} IP(s) em uso</span>
                    </span>
                    <svg
                      className={`${styles.setaExpansao} ${expandido ? styles.setaExpandida : ''}`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {expandido && (
                    <div className={styles.corpoGrupo}>
                      <table className={styles.tabela}>
                        <thead>
                          <tr>
                            <th>IP</th>
                            <th>MAC</th>
                            <th>Interface</th>
                            <th>Equipamento</th>
                            <th>Status</th>
                            <th>Localização</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grupo.interfaces.map((item) => (
                            <tr
                              key={item.id}
                              className={styles.linhaClicavel}
                              onClick={() =>
                                navigate(`/equipamentos/${item.equipamento_id}`, { state: { modo: 'visualizar' } })
                              }
                            >
                              <td className={styles.tdMono}>{item.ip}</td>
                              <td className={styles.tdMono}>{item.mac ?? '—'}</td>
                              <td>{item.nome_interface}</td>
                              <td>
                                {item.categoria} — {item.marca} {item.modelo}
                                {item.nome ? ` (${item.nome})` : ''}
                              </td>
                              <td>
                                <span className={styles.statusBadge} style={corDoStatus(item.status)}>
                                  {rotuloStatus(item.status)}
                                </span>
                              </td>
                              <td>{[item.filial, item.sala].filter(Boolean).join(' - ') || 'Não definida'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
