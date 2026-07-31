import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ComboBoxSelect from '../../components/ComboBoxSelect';
import { buscarEquipamentoPorId } from '../../services/equipamentos';
import { listarCanaisNvr, atualizarCanal, listarCamerasConectaveis } from '../../services/nvrs';
import type { CanalNvr, CameraConectavel } from '../../services/nvrs';
import { useToast } from '../../contexts/ToastContext';
import ModalConfirmacao from '../../components/ModalConfirmacao';
import styles from './Canais.module.css';

interface NvrMestre {
  id: number;
  categoria: string;
  nome: string | null;
  marca: string;
  modelo: string;
  filial?: string | null;
  sala?: string | null;
}

export default function NvrsCanais() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const nvrId = Number(id);
  const { mostrarToast } = useToast();

  const [nvrInfo, setNvrInfo] = useState<NvrMestre | null>(null);
  const [canais, setCanais] = useState<CanalNvr[]>([]);
  const [camerasDisponiveis, setCamerasDisponiveis] = useState<CameraConectavel[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Estado do modo de visualização ('grade' | 'lista')
  const [modoVisualizacao, setModoVisualizacao] = useState<'grade' | 'lista'>('grade');

  // Estado do filtro client-side de busca de canais
  const [filtroCanal, setFiltroCanal] = useState('');

  // Estado do modal / edição de canal
  const [canalEdicao, setCanalEdicao] = useState<CanalNvr | null>(null);
  const [cameraSelecionadaId, setCameraSelecionadaId] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [salvando, setSalvando] = useState(false);
  const [canalParaLimpar, setCanalParaLimpar] = useState<CanalNvr | null>(null);

  const carregarDados = async () => {
    if (!nvrId || isNaN(nvrId)) return;
    setCarregando(true);
    try {
      const [dadosNvr, listaCanais, listaCameras] = await Promise.all([
        buscarEquipamentoPorId(nvrId),
        listarCanaisNvr(nvrId),
        listarCamerasConectaveis(nvrId),
      ]);

      if (dadosNvr && dadosNvr.mestre) {
        setNvrInfo(dadosNvr.mestre);
      }
      setCanais(listaCanais);
      setCamerasDisponiveis(listaCameras || []);
    } catch (erro) {
      console.error('Erro ao carregar canais do NVR:', erro);
      mostrarToast('Não foi possível carregar as informações do NVR.', 'erro');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nvrId]);

  const handleAbrirModal = (canal: CanalNvr) => {
    setCanalEdicao(canal);
    setCameraSelecionadaId(
      canal.camera_conectada_id ? String(canal.camera_conectada_id) : ''
    );
    setDescricao(canal.descricao || '');
  };

  const handleFecharModal = () => {
    setCanalEdicao(null);
    setCameraSelecionadaId('');
    setDescricao('');
  };

  const handleSalvar = async () => {
    if (!canalEdicao) return;
    setSalvando(true);
    try {
      const camId = cameraSelecionadaId ? Number(cameraSelecionadaId) : null;
      await atualizarCanal(nvrId, canalEdicao.numero_canal, {
        camera_conectada_id: camId,
        descricao: descricao.trim() || null,
      });

      mostrarToast('Alterações do canal salvas com sucesso.', 'sucesso');
      handleFecharModal();
      await carregarDados();
    } catch (erro) {
      console.error('Erro ao atualizar canal:', erro);
      mostrarToast('Não foi possível salvar as alterações do canal.', 'erro');
    } finally {
      setSalvando(false);
    }
  };

  const handleLimparCanal = (canal: CanalNvr) => {
    setCanalParaLimpar(canal);
  };

  const confirmarLimpezaCanal = async () => {
    if (!canalParaLimpar) return;

    setSalvando(true);
    try {
      await atualizarCanal(nvrId, canalParaLimpar.numero_canal, {
        camera_conectada_id: null,
        descricao: null,
      });

      mostrarToast(`Canal #${canalParaLimpar.numero_canal} limpo com sucesso.`, 'sucesso');
      handleFecharModal();
      await carregarDados();
    } catch (erro) {
      console.error('Erro ao limpar canal:', erro);
      mostrarToast('Não foi possível limpar o canal.', 'erro');
    } finally {
      setSalvando(false);
      setCanalParaLimpar(null);
    }
  };

  // Lista derivada filtrada (client-side, sem chamada à API)
  const canaisFiltrados = useMemo(() => {
    if (!filtroCanal.trim()) return canais;
    const termo = filtroCanal.toLowerCase();
    return canais.filter((canal) => {
      const texto = `${canal.conectado_nome ?? ''} ${canal.conectado_marca ?? ''} ${canal.conectado_modelo ?? ''} ${(canal.conectado_ips ?? []).join(' ')} ${(canal.conectado_macs ?? []).join(' ')} ${canal.descricao ?? ''}`.toLowerCase();
      return texto.includes(termo);
    });
  }, [canais, filtroCanal]);

  const totalCanais = canais.length;
  const canaisEmUso = canais.filter(
    (c) => c.camera_conectada_id !== null || (c.descricao && c.descricao.trim() !== '')
  ).length;

  return (
    <>
      <div className={styles.cartao} style={{ padding: '1.5rem' }}>
        <div className={styles.cabecalhoAcoes}>
          <div className={styles.tituloArea}>
            <h2>
              Canais do NVR {nvrInfo?.nome ? `— ${nvrInfo.nome}` : `#${nvrId}`}
            </h2>
            <span className={styles.subtitulo}>
              {nvrInfo
                ? `${nvrInfo.marca} ${nvrInfo.modelo}`
                : 'Carregando detalhes...'}
            </span>
          </div>

          <button
            type="button"
            className={styles.botaoVoltar}
            onClick={() => navigate('/nvrs')}
          >
            ← Voltar para NVRs
          </button>
        </div>

        <div className={styles.areaRolagem}>
          {carregando ? (
            <p>Carregando canais...</p>
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
                    <span>Ocupado</span>
                  </div>
                </div>

                <input
                  className={styles.inputFiltroCanal}
                  type="search"
                  value={filtroCanal}
                  onChange={(e) => setFiltroCanal(e.target.value)}
                  placeholder="Buscar por IP, MAC, marca, modelo ou equipamento..."
                />

                <div className={styles.grupoAlternancia}>
                  <div className={styles.resumoUso}>
                    {filtroCanal.trim()
                      ? `Mostrando ${canaisFiltrados.length} de ${totalCanais} canais`
                      : `${canaisEmUso} de ${totalCanais} canais em uso`}
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

              {canais.length === 0 ? (
                <p>Nenhum canal cadastrado para este NVR.</p>
              ) : canaisFiltrados.length === 0 ? (
                <p className={styles.textoVazio}>Nenhum canal encontrado para essa busca.</p>
              ) : modoVisualizacao === 'grade' ? (
                <div className={styles.gridPortas}>
                  {canaisFiltrados.map((canal) => {
                    const estaOcupado =
                      canal.camera_conectada_id !== null ||
                      (canal.descricao && canal.descricao.trim() !== '');

                    let textoConexao = '';
                    if (canal.conectado_nome) {
                      textoConexao = canal.conectado_nome;
                    } else if (canal.conectado_marca || canal.conectado_modelo) {
                      textoConexao = `${canal.conectado_marca || ''} ${canal.conectado_modelo || ''}`.trim();
                    } else if (canal.descricao) {
                      textoConexao = canal.descricao;
                    }

                    return (
                      <div
                        key={canal.id}
                        className={`${styles.blocoPorta} ${
                          estaOcupado ? styles.ocupada : styles.livre
                        }`}
                        onClick={() => handleAbrirModal(canal)}
                        title={`Canal ${canal.numero_canal} - Clique para editar`}
                      >
                        <div className={styles.numeroPorta}>
                          <span>#{canal.numero_canal}</span>
                          <span className={styles.iconeConexao} />
                        </div>

                        <div className={styles.detalhePorta}>
                          {estaOcupado ? (
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
                        <th>Canal</th>
                        <th>Status</th>
                        <th>Câmera Conectada</th>
                        <th>IP</th>
                        <th>Descrição</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {canaisFiltrados.map((canal) => {
                        const estaOcupado =
                          canal.camera_conectada_id !== null ||
                          (canal.descricao && canal.descricao.trim() !== '');

                        const ipsTexto =
                          canal.conectado_ips && canal.conectado_ips.length > 0
                            ? canal.conectado_ips.join(', ')
                            : '—';

                        return (
                          <tr key={canal.id}>
                            <td className={styles.tdMono}>
                              <strong>#{canal.numero_canal}</strong>
                            </td>
                            <td>
                              <span
                                className={styles.statusBadge}
                                style={
                                  estaOcupado
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
                                {estaOcupado ? 'Ocupado' : 'Livre'}
                              </span>
                            </td>
                            <td>
                              {canal.conectado_nome ? (
                                <div>
                                  <div>{canal.conectado_nome}</div>
                                  {canal.conectado_categoria && (
                                    <span className={styles.subtextoEquipamento}>
                                      {canal.conectado_categoria}
                                    </span>
                                  )}
                                </div>
                              ) : canal.conectado_marca || canal.conectado_modelo ? (
                                <div>
                                  <div>
                                    {`${canal.conectado_marca || ''} ${canal.conectado_modelo || ''}`.trim()}
                                  </div>
                                  {canal.conectado_categoria && (
                                    <span className={styles.subtextoEquipamento}>
                                      {canal.conectado_categoria}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className={styles.textoVazio}>—</span>
                              )}
                            </td>
                            <td className={styles.tdMono}>{ipsTexto}</td>
                            <td>{canal.descricao || '—'}</td>
                            <td>
                              <button
                                type="button"
                                className={styles.botaoIcone}
                                onClick={() => handleAbrirModal(canal)}
                                title={`Editar Canal #${canal.numero_canal}`}
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

        {/* Modal de edição de canal */}
        {canalEdicao && (
          <div className={styles.modalOverlay} onClick={handleFecharModal}>
            <div className={styles.modalConteudo} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Gerenciar Canal #{canalEdicao.numero_canal}</h3>
                <button
                  type="button"
                  className={styles.botaoFechar}
                  onClick={handleFecharModal}
                >
                  ✕
                </button>
              </div>

              <div className={styles.formGrupo}>
                <label htmlFor="camera-conectada">Vincular Câmera:</label>
                <ComboBoxSelect
                  id="camera-conectada"
                  opcoes={camerasDisponiveis.map((c) => ({
                    valor: String(c.id),
                    rotulo: `${c.nome || `${c.marca} ${c.modelo}`} — ${c.categoria}${c.ips.length ? ` — ${c.ips.join(', ')}` : ''}`,
                  }))}
                  valor={cameraSelecionadaId}
                  aoMudar={setCameraSelecionadaId}
                  placeholder="Buscar por nome, marca ou IP (deixe vazio para não vincular)"
                />
              </div>

              <div className={styles.formGrupo}>
                <label htmlFor="inputDesc">Descrição / Observação:</label>
                <input
                  id="inputDesc"
                  className={styles.input}
                  type="text"
                  maxLength={200}
                  placeholder="Ex: Câmera Portaria, Câmera Estacionamento 01..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              <div className={styles.modalAcoes}>
                <button
                  type="button"
                  className={styles.botaoLimpar}
                  onClick={() => handleLimparCanal(canalEdicao)}
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

      <ModalConfirmacao
        aberto={canalParaLimpar !== null}
        titulo="Desconectar / Limpar Canal?"
        mensagem={`Deseja realmente desconectar/limpar o Canal #${canalParaLimpar?.numero_canal}?`}
        textoConfirmar="Desconectar / Limpar"
        textoCancelar="Cancelar"
        variante="perigo"
        aoConfirmar={confirmarLimpezaCanal}
        aoCancelar={() => setCanalParaLimpar(null)}
      />
    </>
  );
}
