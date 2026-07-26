import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ComboBoxSelect from '../../components/ComboBoxSelect';
import { buscarEquipamentoPorId } from '../../services/equipamentos';
import { listarPortasSwitch, atualizarPorta } from '../../services/portasSwitch';
import type { PortaSwitch } from '../../services/portasSwitch';
import { listarEquipamentosConectaveis } from '../../services/switches';
import type { EquipamentoConectavel } from '../../services/switches';
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

  const [switchInfo, setSwitchInfo] = useState<SwitchMestre | null>(null);
  const [portas, setPortas] = useState<PortaSwitch[]>([]);
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState<EquipamentoConectavel[]>([]);
  const [carregando, setCarregando] = useState(true);

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
      alert('Não foi possível carregar as informações do switch.');
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
      alert('Não foi possível salvar as alterações da porta.');
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
      alert('Não foi possível limpar a porta.');
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

              <div className={styles.resumoUso}>
                {portasEmUso} de {totalPortas} portas em uso
              </div>
            </div>

            {portas.length === 0 ? (
              <p>Nenhuma porta cadastrada para este switch.</p>
            ) : (
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
                opcoes={[
                  { valor: '', rotulo: '— Nenhum equipamento (só descrição) —' },
                  ...equipamentosDisponiveis.map((e) => ({
                    valor: String(e.id),
                    rotulo: `${e.nome || `${e.marca} ${e.modelo}`} — ${e.categoria}${e.ips.length ? ` — ${e.ips.join(', ')}` : ''}`,
                  })),
                ]}
                valor={equipamentoSelecionadoId}
                aoMudar={setEquipamentoSelecionadoId}
                placeholder="Buscar por nome, categoria ou IP..."
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
