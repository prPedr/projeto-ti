import React, { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listarInterfacesRede, listarSwitchesMapeamento } from '../../services/mapeamentoRede';
import type { InterfaceRede, SwitchMapeamento } from '../../services/mapeamentoRede';
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

  const [interfaces, setInterfaces] = useState<InterfaceRede[]>([]);
  const [switches, setSwitches] = useState<SwitchMapeamento[]>([]);
  const [subredeBusca, setSubredeBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  function carregarDados(subrede?: string) {
    setCarregando(true);
    Promise.all([
      listarInterfacesRede(subrede || undefined),
      listarSwitchesMapeamento(),
    ])
      .then(([dadosInterfaces, dadosSwitches]) => {
        setInterfaces(dadosInterfaces);
        setSwitches(dadosSwitches);
      })
      .catch((erro) => {
        console.error('Erro ao carregar mapeamento de rede:', erro);
        alert('Não foi possível carregar o mapeamento de rede.');
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

  return (
    <div className={styles.cartao} style={{ padding: '1.5rem' }}>
      <div className={styles.cabecalhoAcoes}>
        <h2>Mapeamento de Rede</h2>
        <form className={styles.barraBusca} onSubmit={handleBuscar}>
          <input
            className={styles.input}
            value={subredeBusca}
            onChange={(event) => setSubredeBusca(event.target.value)}
            placeholder="Filtrar por sub-rede (ex: 192.168.1)"
          />
        </form>
      </div>

      <div className={styles.areaRolagem}>
        {carregando ? (
          <p>Carregando mapeamento de rede...</p>
        ) : (
          <>
            {/* Seção de Switches */}
            {switches.length > 0 && (
              <div className={styles.secaoSwitches}>
                <h3 className={styles.tituloSubRede}>
                  Switches de Rede
                  <span className={styles.contagem}>{switches.length} switch(es) ativo(s)</span>
                </h3>

                <div className={styles.gridSwitches}>
                  {switches.map((item) => (
                    <Link
                      key={item.id}
                      to={`/mapeamento-rede/switches/${item.id}`}
                      className={styles.cardSwitch}
                    >
                      <div className={styles.cardSwitchHeader}>
                        <div>
                          <div className={styles.nomeSwitch}>
                            {item.nome || `${item.marca} ${item.modelo}`}
                          </div>
                          <div className={styles.modeloSwitch}>
                            {item.marca} {item.modelo}
                          </div>
                        </div>

                        {item.numero_portas != null && (
                          <span className={styles.tagPortas}>
                            {item.portas_em_uso ?? 0}/{item.numero_portas} portas
                          </span>
                        )}
                      </div>

                      <div className={styles.localizacaoSwitch}>
                        📍 {[item.filial, item.sala].filter(Boolean).join(' - ') || 'Localização não definida'}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {interfaces.length === 0 ? (
              <p className={styles.listaVazia}>Nenhuma interface de rede cadastrada.</p>
            ) : (
              grupos.map((grupo) => (
            <div key={grupo.subRede} className={styles.blocoSubRede}>
              <h3 className={styles.tituloSubRede}>
                {grupo.subRede}.0/24
                <span className={styles.contagem}>{grupo.interfaces.length} IP(s) em uso</span>
              </h3>

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
          ))
        )}
      </div>
    </div>
  );
}
