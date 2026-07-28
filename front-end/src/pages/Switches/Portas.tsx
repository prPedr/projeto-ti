import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ComboBoxSelect from '../../components/ComboBoxSelect';
import { buscarEquipamentoPorId } from '../../services/equipamentos';
import { listarPortasSwitch, atualizarPorta } from '../../services/portasSwitch';
import type { PortaSwitch } from '../../services/portasSwitch';
import { listarEquipamentosConectaveis } from '../../services/switches';
import type { EquipamentoConectavel } from '../../services/switches';
import { useToast } from '../../contexts/ToastContext';
import styles from './Portas.module.css';

interface SwitchMestre {
  id: number;
  categoria: string;
  nome: string | null;
  marca: string;
  modelo: string;
  filial?: string | null;
  sala?: string | null;
}

export default function SwitchesPortas() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const switchId = Number(id);
  const { mostrarToast } = useToast();

  const [switchInfo, setSwitchInfo] = useState<SwitchMestre | null>(null);
  const [portas, setPortas] = useState<PortaSwitch[]>([]);
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState<EquipamentoConectavel[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Estado do modo de visualização ('grade' | 'lista')
  const [modoVisualizacao, setModoVisualizacao] = useState<'grade' | 'lista'>('grade');

  // Estado do modal / edição de porta
  const [portaEdicao, setPortaEdicao] = useState<PortaSwitch | null>(null);
  const [equipamentoSelecionadoId, setEquipamentoSelecionadoId] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [salvando, setSalvando] = useState(false);

  const carregarDados = async () => {
    if (!switchId || isNaN(switchId)) return;
    setCarregando(true);
    try {
      const [dadosSwitch, listaPortas, listaEquipamentos] = await Promise.all([
        buscarEquipamentoPorId(switchId),
        listarPortasSwitch(switchId),
        listarEquipamentosConectaveis(switchId),
      ]);

      if (dadosSwitch && dadosSwitch.mestre) {
        setSwitchInfo(dadosSwitch.mestre);
      }
      setPortas(listaPortas);
      setEquipamentosDisponiveis(listaEquipamentos || []);
    } catch (erro) {
      console.error('Erro ao carregar portas do switch:', erro);
      mostrarToast('Não foi possível carregar as informações do switch.', 'erro');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchId]);

  const handleAbrirModal = (porta: PortaSwitch) => {
    setPortaEdicao(porta);
    setEquipamentoSelecionadoId(
      porta.equipamento_conectado_id ? String(porta.equipamento_conectado_id) : ''
    );
    setDescricao(porta.descricao || '');
  };

  const handleFecharModal = () => {
    setPortaEdicao(null);
    setEquipamentoSelecionadoId('');
    setDescricao('');
  };

  const handleSalvar = async () => {
    if (!portaEdicao) return;
    setSalvando(true);
    try {
      const eqId = equipamentoSelecionadoId ? Number(equipamentoSelecionadoId) : null;
      await atualizarPorta(switchId, portaEdicao.numero_porta, {
        equipamento_conectado_id: eqId,
        descricao: descricao.trim() || null,
      });

      handleFecharModal();
      await carregarDados();
    } catch (erro) {
      console.error('Erro ao atualizar porta:', erro);
      mostrarToast('Não foi possível salvar as alterações da porta.', 'erro');
    } finally {
      setSalvando(false);
    }
  };

  const handleLimparPorta = async () => {
    if (!portaEdicao) return;
    const confirma = window.confirm(
      `Deseja realmente desconectar/limpar a Porta ${portaEdicao.numero_porta}?`
    );
    if (!confirma) return;

    setSalvando(true);
    try {
      await atualizarPorta(switchId, portaEdicao.numero_porta, {
        equipamento_conectado_id: null,
        descricao: null,
      });

      handleFecharModal();
      await carregarDados();
    } catch (erro) {
      console.error('Erro ao limpar porta:', erro);
      mostrarToast('Não foi possível limpar a porta.', 'erro');
    } finally {
      setSalvando(false);
    }
  };

  const totalPortas = portas.length;
  const portasEmUso = portas.filter(
    (p) => p.equipamento_conectado_id !== null || (p.descricao && p.descricao.trim() !== '')
  ).length;

  return (
    <div className={styles.cartao} style={{ padding: '1.5rem' }}>
      <div className={styles.cabecalhoAcoes}>
        <div className={styles.tituloArea}>
          <h2>
            Portas do Switch {switchInfo?.nome ? `— ${switchInfo.nome}` : `#${switchId}`}
          </h2>
          <span className={styles.subtitulo}>
            {switchInfo
              ? `${switchInfo.marca} ${switchInfo.modelo}`
              : 'Carregando detalhes...'}
          </span>
        </div>

        <button
          type="button"
          className={styles.botaoVoltar}
          onClick={() => navigate('/switches')}
        >
          ← Voltar para Switches
        </button>
      </div>

      <div className={styles.areaRolagem}>
        {carregando ? (
          <p>Carregando portas...</p>
        ) : (
          <>
            <div className={styles.linhaTopo}>
              <div className={styles.legenda}>
                <div className={styles.itemLegenda}>
                  <div className={styles.quadradoLivre} />
                  <span>Livre</span>
                </div>
                <div className={styles.itemLegenda}>
                  <div className={styles.quadradoOcupado} />
                  <span>Ocupada</span>
                </div>
              </div>

              <div className={styles.grupoAlternancia}>
                <div className={styles.resumoUso}>
                  {portasEmUso} de {totalPortas} portas em uso
                </div>

                <div className={styles.botoesAlternancia}>
                  <button
                    type="button"
                    className={`${styles.botaoAlternancia} ${
                      modoVisualizacao === 'grade' ? styles.ativo : ''
                    }`}
                    onClick={() => setModoVisualizacao('grade')}
                    title="Visualizar em Grade"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span>Grade</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.botaoAlternancia} ${
                      modoVisualizacao === 'lista' ? styles.ativo : ''
                    }`}
                    onClick={() => setModoVisualizacao('lista')}
                    title="Visualizar em Lista"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    <span>Lista</span>
                  </button>
                </div>
              </div>
            </div>

            {portas.length === 0 ? (
              <p>Nenhuma porta cadastrada para este switch.</p>
            ) : modoVisualizacao === 'grade' ? (
              <div className={styles.gridPortas}>
                {portas.map((porta) => {
                  const estaOcupada =
                    porta.equipamento_conectado_id !== null ||
                    (porta.descricao && porta.descricao.trim() !== '');

                  let textoConexao = '';
                  if (porta.conectado_nome) {
                    textoConexao = porta.conectado_nome;
                  } else if (porta.conectado_marca || porta.conectado_modelo) {
                    textoConexao = `${porta.conectado_marca || ''} ${porta.conectado_modelo || ''}`.trim();
                  } else if (porta.descricao) {
                    textoConexao = porta.descricao;
                  }

                  return (
                    <div
                      key={porta.id}
                      className={`${styles.blocoPorta} ${
                        estaOcupada ? styles.ocupada : styles.livre
                      }`}
                      onClick={() => handleAbrirModal(porta)}
                      title={`Porta ${porta.numero_porta} - Clique para editar`}
                    >
                      <div className={styles.numeroPorta}>
                        <span>#{porta.numero_porta}</span>
                        <span className={styles.iconeConexao} />
                      </div>

                      <div className={styles.detalhePorta}>
                        {estaOcupada ? (
                          <span>{textoConexao}</span>
                        ) : (
                          <span className={styles.textoVazio}>Livre</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.tabelaWrapper}>
                <table className={styles.tabela}>
                  <thead>
                    <tr>
                      <th>Porta</th>
                      <th>Status</th>
                      <th>Equipamento Conectado</th>
                      <th>IP</th>
                      <th>Descrição</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portas.map((porta) => {
                      const estaOcupada =
                        porta.equipamento_conectado_id !== null ||
                        (porta.descricao && porta.descricao.trim() !== '');

                      const ipsTexto =
                        porta.conectado_ips && porta.conectado_ips.length > 0
                          ? porta.conectado_ips.join(', ')
                          : '—';

                      return (
                        <tr key={porta.id}>
                          <td className={styles.tdMono}>
                            <strong>#{porta.numero_porta}</strong>
                          </td>
                          <td>
                            <span
                              className={styles.statusBadge}
                              style={
                                estaOcupada
                                  ? {
                                      backgroundColor: 'var(--status-ativo-fundo)',
                                      color: 'var(--status-ativo-texto)',
                                      border: '1px solid var(--status-ativo-texto)',
                                    }
                                  : {
                                      backgroundColor: 'var(--cor-input-fundo)',
                                      color: 'var(--cor-texto-suave)',
                                      border: '1px solid var(--cor-borda)',
                                    }
                              }
                            >
                              {estaOcupada ? 'Ocupada' : 'Livre'}
                            </span>
                          </td>
                          <td>
                            {porta.conectado_nome ? (
                              <div>
                                <div>{porta.conectado_nome}</div>
                                {porta.conectado_categoria && (
                                  <span className={styles.subtextoEquipamento}>
                                    {porta.conectado_categoria}
                                  </span>
                                )}
                              </div>
                            ) : porta.conectado_marca || porta.conectado_modelo ? (
                              <div>
                                <div>
                                  {`${porta.conectado_marca || ''} ${porta.conectado_modelo || ''}`.trim()}
                                </div>
                                {porta.conectado_categoria && (
                                  <span className={styles.subtextoEquipamento}>
                                    {porta.conectado_categoria}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className={styles.textoVazio}>—</span>
                            )}
                          </td>
                          <td className={styles.tdMono}>{ipsTexto}</td>
                          <td>{porta.descricao || '—'}</td>
                          <td>
                            <button
                              type="button"
                              className={styles.botaoIcone}
                              onClick={() => handleAbrirModal(porta)}
                              title={`Editar Porta #${porta.numero_porta}`}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de edição de porta */}
      {portaEdicao && (
        <div className={styles.modalOverlay} onClick={handleFecharModal}>
          <div className={styles.modalConteudo} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Gerenciar Porta #{portaEdicao.numero_porta}</h3>
              <button
                type="button"
                className={styles.botaoFechar}
                onClick={handleFecharModal}
              >
                ✕
              </button>
            </div>

            <div className={styles.formGrupo}>
              <label htmlFor="equipamento-conectado">Vincular Equipamento:</label>
              <ComboBoxSelect
                id="equipamento-conectado"
                opcoes={equipamentosDisponiveis.map((e) => ({
                  valor: String(e.id),
                  rotulo: `${e.nome || `${e.marca} ${e.modelo}`} — ${e.categoria}${e.ips.length ? ` — ${e.ips.join(', ')}` : ''}`,
                }))}
                valor={equipamentoSelecionadoId}
                aoMudar={setEquipamentoSelecionadoId}
                placeholder="Buscar por nome, categoria ou IP (deixe vazio para não vincular)"
              />
            </div>

            <div className={styles.formGrupo}>
              <label htmlFor="inputDesc">Descrição / Observação:</label>
              <input
                id="inputDesc"
                className={styles.input}
                type="text"
                maxLength={200}
                placeholder="Ex: Uplink Sala 02, Roteador Principal, Patch Panel A..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className={styles.modalAcoes}>
              <button
                type="button"
                className={styles.botaoLimpar}
                onClick={handleLimparPorta}
                disabled={salvando}
              >
                Desconectar / Limpar
              </button>

              <div className={styles.grupoSalvar}>
                <button
                  type="button"
                  className={styles.botaoCancelar}
                  onClick={handleFecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.botaoSalvar}
                  onClick={handleSalvar}
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
