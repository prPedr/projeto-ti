import { useEffect, useState, useMemo, useRef } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { listarLocalizacoes, buscarEquipamentoPorId, atualizarEquipamento } from '../../../services/equipamentos';
import type { CategoriaEquipamento } from '../../../services/equipamentos';
import { listarComputadoresConectaveis } from '../../../services/impressoras';
import type { ComputadorConectavel } from '../../../services/impressoras';
import { listarOpcoes } from '../../../services/opcoes';
import type { OpcoesAgrupadas } from '../../../services/opcoes';
import { formatarMAC, formatarIMEI, formatarIP, formatarTag } from '../../../utils/formatadores';
import ComboBoxSelect from '../../../components/ComboBoxSelect';
import ModalConfirmacao from '../../../components/ModalConfirmacao';
import { useToast } from '../../../contexts/ToastContext';
import styles from '../Cadastro/Cadastro.module.css';

type Categoria = 'COMPUTADOR' | 'SWITCH' | 'CELULAR' | 'NVR' | 'CAMERA' | 'IMPRESSORA' | 'ANTENA';

interface Localizacao {
  id: number;
  filial: string;
  predio: string | null;
  sala: string | null;
}

interface DadosMestre {
  marca: string;
  modelo: string;
  status: string;
  localizacao_id: string;
  nome: string;
  data_garantia: string;
  observacao: string;
}

interface InterfaceRede {
  nome_interface: string;
  ip: string;
  mac: string;
}

const DADOS_MESTRE_INICIAIS: DadosMestre = {
  marca: '',
  modelo: '',
  status: 'ATIVO',
  localizacao_id: '',
  nome: '',
  data_garantia: '',
  observacao: '',
};

const INTERFACE_REDE_INICIAL: InterfaceRede = { nome_interface: '', ip: '', mac: '' };

function mapCategoriaParaTipoOpcao(categoria: Categoria): string {
  switch (categoria) {
    case 'COMPUTADOR':
      return 'COMPUTADOR';
    case 'SWITCH':
      return 'SWITCH';
    case 'CELULAR':
      return 'CELULAR';
    case 'NVR':
    case 'CAMERA':
      return 'NVR_CAMERA';
    case 'IMPRESSORA':
      return 'IMPRESSORA';
    case 'ANTENA':
      return 'ANTENA';
  }
}

export default function Detalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const modo = state?.modo || 'visualizar';
  const desabilitado = modo === 'visualizar';
  const { mostrarToast } = useToast();

  const [categoria, setCategoria] = useState<Categoria>('COMPUTADOR');
  const [dadosMestre, setDadosMestre] = useState<DadosMestre>(DADOS_MESTRE_INICIAIS);
  const [dadosDetalhe, setDadosDetalhe] = useState<Record<string, string>>({});
  const [interfacesRede, setInterfacesRede] = useState<InterfaceRede[]>([{ ...INTERFACE_REDE_INICIAL }]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [opcoesSugeridas, setOpcoesSugeridas] = useState<OpcoesAgrupadas>({});
  const [carregando, setCarregando] = useState(true);
  const [modalCancelarAberto, setModalCancelarAberto] = useState(false);

  const [tipoConexao, setTipoConexao] = useState<'REDE' | 'USB'>('REDE');
  const [computadorConectadoId, setComputadorConectadoId] = useState('');
  const [computadoresConectaveis, setComputadoresConectaveis] = useState<ComputadorConectavel[]>([]);

  useEffect(() => {
    if (categoria === 'IMPRESSORA') {
      listarComputadoresConectaveis()
        .then(setComputadoresConectaveis)
        .catch((erro) => console.error('Erro ao carregar computadores conectáveis:', erro));
    }
  }, [categoria]);

  // Snapshot dos dados carregados do banco — usado para detectar alterações
  const [dadosOriginais, setDadosOriginais] = useState<{
    mestre: DadosMestre;
    detalhe: Record<string, string>;
    interfaces: InterfaceRede[];
    tipoConexao?: 'REDE' | 'USB';
    computadorConectadoId?: string;
  } | null>(null);

  // Deriva o id da marca escolhida — usado para filtrar os modelos por dependência
  const marcaId =
    opcoesSugeridas.MARCA?.find(
      (m) => m.valor.toLowerCase() === dadosMestre.marca.trim().toLowerCase(),
    )?.id ?? null;

  const opcoesMarca = useMemo(
    () => (opcoesSugeridas.MARCA ?? []).map((o) => ({ valor: o.valor, rotulo: o.valor })),
    [opcoesSugeridas.MARCA],
  );

  const opcoesModelo = useMemo(
    () =>
      (opcoesSugeridas.MODELO ?? [])
        .filter((m) => marcaId === null || m.dependencia_id === marcaId)
        .map((o) => ({ valor: o.valor, rotulo: o.valor })),
    [opcoesSugeridas.MODELO, marcaId],
  );

  const opcoesLocalizacao = useMemo(
    () =>
      localizacoes.map((loc) => ({
        valor: String(loc.id),
        rotulo: [loc.filial, loc.predio, loc.sala].filter(Boolean).join(' - '),
      })),
    [localizacoes],
  );

  const opcoesProcessador = useMemo(
    () => (opcoesSugeridas.PROCESSADOR ?? []).map((o) => ({ valor: o.valor, rotulo: o.valor })),
    [opcoesSugeridas.PROCESSADOR],
  );

  const opcoesMemoria = useMemo(
    () => (opcoesSugeridas.MEMORIA ?? []).map((o) => ({ valor: o.valor, rotulo: o.valor })),
    [opcoesSugeridas.MEMORIA],
  );

  const opcoesArmazenamento = useMemo(
    () => (opcoesSugeridas.ARMAZENAMENTO ?? []).map((o) => ({ valor: o.valor, rotulo: o.valor })),
    [opcoesSugeridas.ARMAZENAMENTO],
  );

  const opcoesSistemaOperacional = useMemo(
    () => (opcoesSugeridas.SISTEMA_OPERACIONAL ?? []).map((o) => ({ valor: o.valor, rotulo: o.valor })),
    [opcoesSugeridas.SISTEMA_OPERACIONAL],
  );

  const opcoesTipoInterface = useMemo(
    () => (opcoesSugeridas.TIPO_INTERFACE ?? []).map((o) => ({ valor: o.valor, rotulo: o.valor })),
    [opcoesSugeridas.TIPO_INTERFACE],
  );

  const opcoesComputadoresConectaveis = useMemo(
    () =>
      computadoresConectaveis.map((c) => ({
        valor: String(c.id),
        rotulo: [c.nome, `${c.marca} ${c.modelo}`].filter(Boolean).join(' - '),
      })),
    [computadoresConectaveis],
  );

  // Ref para saber se o carregamento inicial já concluiu.
  // Enquanto false, o useEffect de categoria não reseta interfacesRede
  // (evita apagar IP/MAC recém-carregados do banco).
  const dadosJaCarregadosRef = useRef(false);

  useEffect(() => {
    listarLocalizacoes()
      .then((dados) => setLocalizacoes(dados))
      .catch((erro) => console.error('Erro ao carregar localizações:', erro));
  }, []);

  useEffect(() => {
    listarOpcoes(mapCategoriaParaTipoOpcao(categoria))
      .then((dados) => setOpcoesSugeridas(dados))
      .catch((erro) => console.error('Erro ao carregar opções sugeridas:', erro));
  }, [categoria]);

  // Aplica nome_interface fixo ao trocar categoria manualmente.
  // No carregamento inicial (dadosJaCarregadosRef ainda false), não faz nada
  // pois o .then de buscarEquipamentoPorId já cuida de preservar ip/mac.
  useEffect(() => {
    if (!dadosJaCarregadosRef.current) return;

    if (categoria === 'CELULAR') {
      setInterfacesRede([{ nome_interface: 'Wi-Fi', ip: '', mac: '' }]);
    } else if (categoria === 'SWITCH') {
      setInterfacesRede([{ nome_interface: 'Ethernet', ip: '', mac: '' }]);
    } else {
      setInterfacesRede([{ ...INTERFACE_REDE_INICIAL }]);
    }
  }, [categoria]);

  useEffect(() => {
    if (id) {
      setCarregando(true);
      buscarEquipamentoPorId(Number(id))
        .then((dados) => {
          const categoriaCarregada = dados.mestre.categoria.toUpperCase() as Categoria;
          setCategoria(categoriaCarregada);
          const mestreCarregado: DadosMestre = {
            marca: dados.mestre.marca,
            modelo: dados.mestre.modelo,
            status: dados.mestre.status,
            localizacao_id: String(dados.mestre.localizacao_id),
            nome: dados.mestre.nome || '',
            data_garantia: dados.mestre.data_garantia || '',
            observacao: dados.mestre.observacao || '',
          };
          const detalheCarregado: Record<string, string> = dados.detalhe || {};

          setDadosMestre(mestreCarregado);
          setDadosDetalhe(detalheCarregado);

          let tipoConexaoCarregado: 'REDE' | 'USB' = 'REDE';
          let computadorConectadoIdCarregado = '';

          if (categoriaCarregada === 'IMPRESSORA') {
            const detalheImp = dados.detalhe as { tipo_conexao?: 'REDE' | 'USB'; computador_conectado_id?: number | null } | undefined;
            if (detalheImp?.tipo_conexao) {
              tipoConexaoCarregado = detalheImp.tipo_conexao;
              setTipoConexao(detalheImp.tipo_conexao);
            }
            if (detalheImp?.computador_conectado_id) {
              computadorConectadoIdCarregado = String(detalheImp.computador_conectado_id);
              setComputadorConectadoId(computadorConectadoIdCarregado);
            }
          }

          // Carrega interfaces preservando ip/mac do banco.
          // Para CELULAR e SWITCH, força o nome_interface fixo sem apagar os valores já salvos.
          const interfacesCarregadas =
            dados.interfaces && dados.interfaces.length > 0
              ? dados.interfaces
              : [{ ...INTERFACE_REDE_INICIAL }];

          let interfacesFinais: InterfaceRede[];
          if (categoriaCarregada === 'CELULAR') {
            interfacesFinais = interfacesCarregadas.map((iface: InterfaceRede) => ({ ...iface, nome_interface: 'Wi-Fi' }));
          } else if (categoriaCarregada === 'SWITCH') {
            interfacesFinais = interfacesCarregadas.map((iface: InterfaceRede) => ({ ...iface, nome_interface: 'Ethernet' }));
          } else {
            interfacesFinais = interfacesCarregadas;
          }

          setInterfacesRede(interfacesFinais);

          // Salva cópia imutável dos dados originais para comparar depois
          setDadosOriginais({
            mestre: { ...mestreCarregado },
            detalhe: { ...detalheCarregado },
            interfaces: interfacesFinais.map((i) => ({ ...i })),
            tipoConexao: tipoConexaoCarregado,
            computadorConectadoId: computadorConectadoIdCarregado,
          });
        })
        .catch((erro) => {
          console.error('Erro ao carregar equipamento:', erro);
          mostrarToast('Não foi possível carregar os dados do equipamento.', 'erro');
          navigate('/equipamentos');
        })
        .finally(() => {
          dadosJaCarregadosRef.current = true;
          setCarregando(false);
        });
    }
  }, [id, navigate]);

  function handleMestreChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setDadosMestre((anterior) => ({ ...anterior, [name]: value }));
  }

  function handleDetalheChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;

    let valorFormatado = value;
    if (name === 'imei') {
      valorFormatado = formatarIMEI(value);
    } else if (name === 'tag_patrimonio') {
      valorFormatado = formatarTag(value);
    }

    setDadosDetalhe((anterior) => ({ ...anterior, [name]: valorFormatado }));
  }

  function handleInterfaceChange(indice: number, campo: keyof InterfaceRede, valor: string) {
    let valorFormatado = valor;
    if (campo === 'mac') {
      valorFormatado = formatarMAC(valor);
    } else if (campo === 'ip') {
      valorFormatado = formatarIP(valor);
    }

    setInterfacesRede((anterior) =>
      anterior.map((item, i) => (i === indice ? { ...item, [campo]: valorFormatado } : item)),
    );
  }

  function adicionarInterface() {
    setInterfacesRede((anterior) => [...anterior, { nome_interface: '', ip: '', mac: '' }]);
  }

  function removerInterface(indice: number) {
    setInterfacesRede((anterior) => anterior.filter((_, i) => i !== indice));
  }

  function formularioTemAlteracoes(): boolean {
    if (!dadosOriginais) return false;
    const impressoraAlterada =
      categoria === 'IMPRESSORA' &&
      (tipoConexao !== dadosOriginais.tipoConexao ||
        computadorConectadoId !== dadosOriginais.computadorConectadoId);

    return (
      JSON.stringify(dadosMestre) !== JSON.stringify(dadosOriginais.mestre) ||
      JSON.stringify(dadosDetalhe) !== JSON.stringify(dadosOriginais.detalhe) ||
      JSON.stringify(interfacesRede) !== JSON.stringify(dadosOriginais.interfaces) ||
      impressoraAlterada
    );
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (modo === 'visualizar') return;

    let detalhe: Record<string, string | boolean | number> = {};

    if (categoria === 'IMPRESSORA') {
      detalhe = {
        tipo_conexao: tipoConexao,
        ...(tipoConexao === 'USB' && computadorConectadoId && { computador_conectado_id: Number(computadorConectadoId) }),
      };
    } else {
      Object.entries(dadosDetalhe).forEach(([chave, valor]) => {
        if (typeof valor === 'string' && valor.trim() !== '') {
          detalhe[chave] = valor.trim();
        }
      });

      if (categoria === 'COMPUTADOR' && 'antivirus_instalado' in detalhe) {
        detalhe.antivirus_instalado = detalhe.antivirus_instalado === 'true';
      }

      if (categoria === 'SWITCH') {
        if ('numero_portas' in detalhe && typeof detalhe.numero_portas === 'string') {
          detalhe.numero_portas = Number(detalhe.numero_portas);
        }
      }
    }

    const payload = {
      mestre: {
        marca: dadosMestre.marca.trim(),
        modelo: dadosMestre.modelo.trim(),
        status: dadosMestre.status,
        localizacao_id: Number(dadosMestre.localizacao_id),
        ...(dadosMestre.nome.trim() && { nome: dadosMestre.nome.trim() }),
        ...(dadosMestre.data_garantia.trim() && { data_garantia: dadosMestre.data_garantia.trim() }),
        ...(dadosMestre.observacao.trim() && { observacao: dadosMestre.observacao.trim() }),
      },
      detalhe,
      interfaces: (categoria === 'IMPRESSORA' && tipoConexao === 'USB')
        ? []
        : interfacesRede
            .map((item) => ({
              nome_interface: item.nome_interface.trim(),
              ...(item.ip.trim() && { ip: item.ip.trim() }),
              ...(item.mac.trim() && { mac: item.mac.trim() }),
            }))
            .filter((item) => item.nome_interface || item.ip || item.mac),
    };

    try {
      await atualizarEquipamento(Number(id), categoria.toLowerCase() as CategoriaEquipamento, payload);
      navigate('/equipamentos');
    } catch (erro) {
      mostrarToast(erro instanceof Error ? erro.message : 'Erro ao atualizar equipamento.', 'erro');
    }
  }

  if (carregando) return <p>Carregando dados...</p>;

  return (
    <>
      <form onSubmit={handleSubmit}>
          <fieldset disabled={desabilitado} style={{ border: 'none', padding: 0, margin: 0 }}>
          <h2 className={styles.secaoTitulo}>Dados Básicos</h2>
          <div className={styles.grid2}>
            <div className={styles.campo}>
              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                name="categoria"
                className={styles.select}
                value={categoria}
                disabled // Categoria não pode ser alterada na edição
                required
              >
                <option value="COMPUTADOR">Computador</option>
                <option value="SWITCH">Switch</option>
                <option value="CELULAR">Celular</option>
                <option value="NVR">NVR</option>
                <option value="CAMERA">Câmera</option>
                <option value="IMPRESSORA">Impressora</option>
                <option value="ANTENA">Antena Wi-Fi</option>
              </select>
            </div>

            <div className={styles.campo}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className={styles.select}
                value={dadosMestre.status}
                onChange={handleMestreChange}
                required
              >
                <option value="ATIVO">Ativo</option>
                <option value="ESTOQUE">Estoque</option>
                <option value="MANUTENCAO">Manutenção</option>
                <option value="DESCARTADO">Descartado</option>
              </select>
            </div>

            <div className={styles.campo}>
              <label htmlFor="marca">Marca</label>
              <ComboBoxSelect
                id="marca"
                opcoes={opcoesMarca}
                valor={dadosMestre.marca}
                aoMudar={(val) => setDadosMestre((ant) => ({ ...ant, marca: val, modelo: '' }))}
                placeholder="Selecione ou digite a marca"
                obrigatorio
                desabilitado={desabilitado}
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="modelo">Modelo</label>
              <ComboBoxSelect
                id="modelo"
                opcoes={opcoesModelo}
                valor={dadosMestre.modelo}
                aoMudar={(val) => setDadosMestre((ant) => ({ ...ant, modelo: val }))}
                placeholder="Selecione ou digite o modelo"
                obrigatorio
                desabilitado={desabilitado}
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="localizacao_id">Localização</label>
              <ComboBoxSelect
                id="localizacao_id"
                opcoes={opcoesLocalizacao}
                valor={dadosMestre.localizacao_id}
                aoMudar={(val) => setDadosMestre((ant) => ({ ...ant, localizacao_id: val }))}
                placeholder="Selecione a localização"
                obrigatorio
                desabilitado={desabilitado}
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="nome">Nome (opcional)</label>
              <input
                id="nome"
                name="nome"
                className={styles.input}
                value={dadosMestre.nome}
                onChange={handleMestreChange}
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="data_garantia">Data de Garantia</label>
              <input
                id="data_garantia"
                name="data_garantia"
                type="date"
                className={styles.input}
                value={dadosMestre.data_garantia}
                onChange={handleMestreChange}
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="observacao">Observação</label>
              <input
                id="observacao"
                name="observacao"
                className={styles.input}
                value={dadosMestre.observacao}
                onChange={handleMestreChange}
              />
            </div>
          </div>

          {categoria === 'COMPUTADOR' && (
            <>
              <h2 className={styles.secaoTitulo}>Detalhes Técnicos</h2>
              <div className={styles.grid2}>
                <div className={styles.campo}>
                  <label htmlFor="usuario_alocado">Usuário Alocado</label>
                  <input
                    id="usuario_alocado"
                    name="usuario_alocado"
                    className={styles.input}
                    value={dadosDetalhe.usuario_alocado ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="tag_patrimonio">Tag de Patrimônio</label>
                  <input
                    id="tag_patrimonio"
                    name="tag_patrimonio"
                    className={styles.input}
                    value={dadosDetalhe.tag_patrimonio ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="numero_serie">Número de Série</label>
                  <input
                    id="numero_serie"
                    name="numero_serie"
                    className={`${styles.input} ${styles.inputMono}`}
                    value={dadosDetalhe.numero_serie ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="processador">Processador</label>
                  <ComboBoxSelect
                    id="processador"
                    opcoes={opcoesProcessador}
                    valor={dadosDetalhe.processador ?? ''}
                    aoMudar={(val) => setDadosDetalhe((ant) => ({ ...ant, processador: val }))}
                    placeholder="Selecione o processador"
                    desabilitado={desabilitado}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="memoria">Memória</label>
                  <ComboBoxSelect
                    id="memoria"
                    opcoes={opcoesMemoria}
                    valor={dadosDetalhe.memoria ?? ''}
                    aoMudar={(val) => setDadosDetalhe((ant) => ({ ...ant, memoria: val }))}
                    placeholder="Ex: 16GB DDR4"
                    desabilitado={desabilitado}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="armazenamento">Armazenamento</label>
                  <ComboBoxSelect
                    id="armazenamento"
                    opcoes={opcoesArmazenamento}
                    valor={dadosDetalhe.armazenamento ?? ''}
                    aoMudar={(val) => setDadosDetalhe((ant) => ({ ...ant, armazenamento: val }))}
                    placeholder="Ex: 512GB NVMe"
                    desabilitado={desabilitado}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="sistema_operacional">Sistema Operacional</label>
                  <ComboBoxSelect
                    id="sistema_operacional"
                    opcoes={opcoesSistemaOperacional}
                    valor={dadosDetalhe.sistema_operacional ?? ''}
                    aoMudar={(val) => setDadosDetalhe((ant) => ({ ...ant, sistema_operacional: val }))}
                    placeholder="Selecione o sistema operacional"
                    desabilitado={desabilitado}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="antivirus_instalado">Antivírus Instalado</label>
                  <select
                    id="antivirus_instalado"
                    name="antivirus_instalado"
                    className={styles.select}
                    value={String(dadosDetalhe.antivirus_instalado ?? '')}
                    onChange={handleDetalheChange}
                  >
                    <option value="">Selecione...</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {categoria === 'SWITCH' && (
            <>
              <h2 className={styles.secaoTitulo}>Detalhes Técnicos</h2>
              <div className={styles.grid2}>
                <div className={styles.campo}>
                  <label htmlFor="numero_portas">Número de Portas</label>
                  <input
                    id="numero_portas"
                    name="numero_portas"
                    type="number"
                    className={styles.input}
                    value={dadosDetalhe.numero_portas ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="firmware">Firmware</label>
                  <input
                    id="firmware"
                    name="firmware"
                    className={`${styles.input} ${styles.inputMono}`}
                    value={dadosDetalhe.firmware ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="vlans_configuradas">VLANs Configuradas</label>
                  <input
                    id="vlans_configuradas"
                    name="vlans_configuradas"
                    className={`${styles.input} ${styles.inputMono}`}
                    value={dadosDetalhe.vlans_configuradas ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
              </div>
            </>
          )}

          {categoria === 'CELULAR' && (
            <>
              <h2 className={styles.secaoTitulo}>Detalhes Técnicos</h2>
              <div className={styles.grid2}>
                <div className={styles.campo}>
                  <label htmlFor="usuario_alocado">Usuário Alocado</label>
                  <input
                    id="usuario_alocado"
                    name="usuario_alocado"
                    className={styles.input}
                    value={dadosDetalhe.usuario_alocado ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="imei">IMEI</label>
                  <input
                    id="imei"
                    name="imei"
                    className={`${styles.input} ${styles.inputMono}`}
                    placeholder="15 dígitos"
                    value={dadosDetalhe.imei ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="numero_serie">Número de Série</label>
                  <input
                    id="numero_serie"
                    name="numero_serie"
                    className={`${styles.input} ${styles.inputMono}`}
                    value={dadosDetalhe.numero_serie ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="memoria">Memória</label>
                  <input
                    id="memoria"
                    name="memoria"
                    className={styles.input}
                    value={dadosDetalhe.memoria ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="armazenamento">Armazenamento</label>
                  <input
                    id="armazenamento"
                    name="armazenamento"
                    className={styles.input}
                    value={dadosDetalhe.armazenamento ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="operadora_numero">Operadora / Número</label>
                  <input
                    id="operadora_numero"
                    name="operadora_numero"
                    className={styles.input}
                    value={dadosDetalhe.operadora_numero ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="modalidade">Modalidade</label>
                  <select
                    id="modalidade"
                    name="modalidade"
                    className={styles.select}
                    value={dadosDetalhe.modalidade ?? ''}
                    onChange={handleDetalheChange}
                  >
                    <option value="">Selecione...</option>
                    <option value="CORPORATIVO">Corporativo</option>
                    <option value="BYOD">BYOD</option>
                  </select>
                </div>
                <div className={styles.campo}>
                  <label htmlFor="sistema_operacional">Sistema Operacional</label>
                  <input
                    id="sistema_operacional"
                    name="sistema_operacional"
                    className={styles.input}
                    value={dadosDetalhe.sistema_operacional ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
              </div>
            </>
          )}

          {(categoria === 'NVR' || categoria === 'CAMERA') && (
            <>
              <h2 className={styles.secaoTitulo}>Detalhes Técnicos</h2>
              <div className={styles.grid2}>
                <div className={styles.campo}>
                  <label htmlFor="identificacao_extra">Identificação Extra</label>
                  <input
                    id="identificacao_extra"
                    name="identificacao_extra"
                    className={styles.input}
                    value={dadosDetalhe.identificacao_extra ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="capacidade_armazenamento">Capacidade de Armazenamento</label>
                  <input
                    id="capacidade_armazenamento"
                    name="capacidade_armazenamento"
                    className={styles.input}
                    placeholder="Ex: HD 4TB"
                    value={dadosDetalhe.capacidade_armazenamento ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="quantidade_canais_resolucao">Canais / Resolução</label>
                  <input
                    id="quantidade_canais_resolucao"
                    name="quantidade_canais_resolucao"
                    className={styles.input}
                    placeholder="Ex: 16 Canais ou 1080p"
                    value={dadosDetalhe.quantidade_canais_resolucao ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="firmware">Firmware</label>
                  <input
                    id="firmware"
                    name="firmware"
                    className={`${styles.input} ${styles.inputMono}`}
                    value={dadosDetalhe.firmware ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
              </div>
            </>
          )}

          {categoria === 'IMPRESSORA' && (
            <>
              <h2 className={styles.secaoTitulo}>Detalhes Técnicos</h2>
              <div className={styles.grid2}>
                <div className={styles.campo}>
                  <label htmlFor="tipo_conexao">Tipo de Conexão</label>
                  <select
                    id="tipo_conexao"
                    name="tipo_conexao"
                    className={styles.select}
                    value={tipoConexao}
                    disabled={desabilitado}
                    onChange={(event) => {
                      const novoTipo = event.target.value as 'REDE' | 'USB';
                      setTipoConexao(novoTipo);
                      if (novoTipo === 'REDE') {
                        setComputadorConectadoId('');
                      }
                    }}
                  >
                    <option value="REDE">Rede</option>
                    <option value="USB">USB</option>
                  </select>
                </div>

                {tipoConexao === 'USB' && (
                  <div className={styles.campo}>
                    <label htmlFor="computador_conectado_id">Computador Conectado</label>
                    <ComboBoxSelect
                      id="computador_conectado_id"
                      opcoes={opcoesComputadoresConectaveis}
                      valor={computadorConectadoId}
                      aoMudar={(val) => setComputadorConectadoId(val)}
                      placeholder="Selecione o computador conectado"
                      obrigatorio
                      desabilitado={desabilitado}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {!(categoria === 'IMPRESSORA' && tipoConexao === 'USB') && (
            <>
              <h2 className={styles.secaoTitulo}>Interface de Rede</h2>
          {interfacesRede.map((interfaceRede, indice) => (
            <div className={styles.grid2} key={indice}>
              <div className={styles.campo}>
                <label htmlFor={`nome_interface_${indice}`}>Nome da Interface</label>
                <ComboBoxSelect
                  id={`nome_interface_${indice}`}
                  opcoes={opcoesTipoInterface}
                  valor={interfaceRede.nome_interface}
                  aoMudar={(novoValor) => handleInterfaceChange(indice, 'nome_interface', novoValor)}
                  placeholder="Selecione o tipo de interface"
                  desabilitado={desabilitado || categoria === 'CELULAR' || categoria === 'SWITCH'}
                />
              </div>
              <div className={styles.campo}>
                <label htmlFor={`ip_${indice}`}>IP</label>
                <input
                  id={`ip_${indice}`}
                  className={`${styles.input} ${styles.inputMono}`}
                  placeholder="Ex: 192.168.0.10"
                  value={interfaceRede.ip}
                  onChange={(event) => handleInterfaceChange(indice, 'ip', event.target.value)}
                />
              </div>
              <div className={styles.campo}>
                <label htmlFor={`mac_${indice}`}>MAC</label>
                <input
                  id={`mac_${indice}`}
                  className={`${styles.input} ${styles.inputMono}`}
                  placeholder="AA:BB:CC:DD:EE:FF"
                  value={interfaceRede.mac}
                  onChange={(event) => handleInterfaceChange(indice, 'mac', event.target.value)}
                />
              </div>
              {interfacesRede.length > 1 && !desabilitado && (
                <div className={styles.campo}>
                  <label>&nbsp;</label>
                  <button type="button" className={styles.botaoCancelar} onClick={() => removerInterface(indice)}>
                    Remover Interface
                  </button>
                </div>
              )}
            </div>
          ))}

          {!desabilitado && categoria !== 'CELULAR' && categoria !== 'SWITCH' && (
            <div className={styles.botoesAcao}>
              <button type="button" className={styles.botaoCancelar} onClick={adicionarInterface}>
                + Adicionar Interface
              </button>
            </div>
          )}
          </>
          )}
        </fieldset>

        <div className={styles.botoesAcao}>
          {categoria === 'SWITCH' && (
            <button
              type="button"
              className={styles.botaoAdicionar}
              onClick={() => navigate(`/switches/${id}`)}
            >
              🔌 Ver mapa de portas
            </button>
          )}

          {modo === 'visualizar' ? (
            <button type="button" className={styles.botaoCancelar} onClick={() => navigate('/equipamentos')}>
              Voltar
            </button>
          ) : (
            <>
              <button
                type="button"
                className={styles.botaoCancelar}
                onClick={() => {
                  if (formularioTemAlteracoes()) {
                    setModalCancelarAberto(true);
                  } else {
                    navigate('/equipamentos');
                  }
                }}
              >
                Cancelar
              </button>
              <button type="submit" className={styles.botaoSalvar}>
                Salvar Alterações
              </button>
            </>
          )}
        </div>
      </form>

      <ModalConfirmacao
        aberto={modalCancelarAberto}
        titulo="Sair sem salvar?"
        mensagem="Você tem alterações não salvas nesta edição. Se sair agora, as alterações serão perdidas."
        textoConfirmar="Sair sem salvar"
        textoCancelar="Continuar editando"
        variante="perigo"
        aoConfirmar={() => navigate('/equipamentos')}
        aoCancelar={() => setModalCancelarAberto(false)}
      />
    </>
  );
}
