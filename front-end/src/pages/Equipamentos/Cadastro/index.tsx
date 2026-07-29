import { useEffect, useState, useMemo, useRef } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ComboBoxSelect from '../../../components/ComboBoxSelect';
import ModalConfirmacao from '../../../components/ModalConfirmacao';
import { criarEquipamento, enviarAnexoEquipamento, listarLocalizacoes } from '../../../services/equipamentos';
import type { CategoriaEquipamento } from '../../../services/equipamentos';
import { listarComputadoresConectaveis } from '../../../services/impressoras';
import type { ComputadorConectavel } from '../../../services/impressoras';
import { listarOpcoes } from '../../../services/opcoes';
import type { OpcoesAgrupadas } from '../../../services/opcoes';
import { formatarMAC, formatarIMEI, formatarIP, formatarTag } from '../../../utils/formatadores';
import styles from './Cadastro.module.css';

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

function mapCategoriaParaEndpoint(categoria: Categoria): CategoriaEquipamento {
  switch (categoria) {
    case 'COMPUTADOR':
      return 'computador';
    case 'SWITCH':
      return 'switch';
    case 'CELULAR':
      return 'celular';
    case 'NVR':
      return 'nvr';
    case 'CAMERA':
      return 'camera';
    case 'IMPRESSORA':
      return 'impressora';
    case 'ANTENA':
      return 'antena';
  }
}

function mapCategoriaParaTipoOpcao(categoria: Categoria): string {
  switch (categoria) {
    case 'COMPUTADOR':
      return 'COMPUTADOR';
    case 'SWITCH':
      return 'SWITCH';
    case 'CELULAR':
      return 'CELULAR';
    case 'NVR':
      return 'NVR';
    case 'CAMERA':
      return 'CAMERA';
    case 'IMPRESSORA':
      return 'IMPRESSORA';
    case 'ANTENA':
      return 'ANTENA';
  }
}

export default function Cadastro() {
  const navigate = useNavigate();

  const acaoAposSalvarRef = useRef<'listagem' | 'continuar'>('listagem');
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const [categoria, setCategoria] = useState<Categoria>('COMPUTADOR');
  const [dadosMestre, setDadosMestre] = useState<DadosMestre>(DADOS_MESTRE_INICIAIS);
  const [dadosDetalhe, setDadosDetalhe] = useState<Record<string, string>>({});
  const [interfacesRede, setInterfacesRede] = useState<InterfaceRede[]>([{ ...INTERFACE_REDE_INICIAL }]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [opcoesSugeridas, setOpcoesSugeridas] = useState<OpcoesAgrupadas>({});
  const [arquivoTermo, setArquivoTermo] = useState<File | null>(null);
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);
  const [mensagemStatus, setMensagemStatus] = useState<{
    tipo: 'sucesso' | 'aviso' | 'erro';
    texto: string;
  } | null>(null);
  const [erroInterfaces, setErroInterfaces] = useState<{ mensagem: string; campo?: 'ip' | 'mac' } | null>(null);
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

  // Deriva o id da marca escolhida pelo texto digitado — usado para filtrar os modelos
  const marcaId =
    opcoesSugeridas.MARCA?.find(
      (m) => m.valor.toLowerCase() === dadosMestre.marca.trim().toLowerCase(),
    )?.id ?? null;

  const linhasComCampoPreenchido = useMemo(() => {
    if (!erroInterfaces?.campo) return 0;
    const campo = erroInterfaces.campo;
    return interfacesRede.filter((item) => item[campo]?.trim() !== '').length;
  }, [erroInterfaces, interfacesRede]);

  useEffect(() => {
    listarLocalizacoes()
      .then((dados) => setLocalizacoes(dados))
      .catch((erro) => console.error('Erro ao carregar localizações:', erro));
  }, []);

  useEffect(() => {
    setDadosDetalhe({});
    setDadosMestre((anterior) => ({ ...anterior, marca: '', modelo: '' }));
    setMensagemStatus(null);
    setTipoConexao('REDE');
    setComputadorConectadoId('');

    if (categoria === 'CELULAR') {
      setInterfacesRede([{ nome_interface: 'Wi-Fi', ip: '', mac: '' }]);
    } else if (categoria === 'SWITCH') {
      setInterfacesRede([{ nome_interface: 'Ethernet', ip: '', mac: '' }]);
    } else {
      setInterfacesRede([{ ...INTERFACE_REDE_INICIAL }]);
    }

    listarOpcoes(mapCategoriaParaTipoOpcao(categoria))
      .then((dados) => setOpcoesSugeridas(dados))
      .catch((erro) => console.error('Erro ao carregar opções sugeridas:', erro));
  }, [categoria]);

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

  function formularioTemDadosRelevantes(): boolean {
    const mestreAlterado =
      dadosMestre.marca.trim() !== '' ||
      dadosMestre.modelo.trim() !== '' ||
      dadosMestre.nome.trim() !== '' ||
      dadosMestre.data_garantia.trim() !== '' ||
      dadosMestre.observacao.trim() !== '' ||
      dadosMestre.status !== 'ATIVO';

    const detalheAlterado = Object.values(dadosDetalhe).some(
      (valor) => typeof valor === 'string' && valor.trim() !== '',
    );

    const interfacesAlteradas = interfacesRede.some((i) => {
      if (categoria === 'CELULAR' && i.nome_interface === 'Wi-Fi') {
        return i.ip.trim() !== '' || i.mac.trim() !== '';
      }
      if (categoria === 'SWITCH' && i.nome_interface === 'Ethernet') {
        return i.ip.trim() !== '' || i.mac.trim() !== '';
      }
      return i.nome_interface.trim() !== '' || i.ip.trim() !== '' || i.mac.trim() !== '';
    });

    return mestreAlterado || detalheAlterado || interfacesAlteradas || arquivoTermo !== null;
  }

  function rolarParaTopo() {
    document.querySelector(`.${styles.areaRolagem}`)?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetarFormularioMantendoContexto() {
    setDadosMestre((anterior) => ({
      ...DADOS_MESTRE_INICIAIS,
      localizacao_id: anterior.localizacao_id,
    }));
    setDadosDetalhe({});
    setTipoConexao('REDE');
    setComputadorConectadoId('');
    if (categoria === 'CELULAR') {
      setInterfacesRede([{ nome_interface: 'Wi-Fi', ip: '', mac: '' }]);
    } else if (categoria === 'SWITCH') {
      setInterfacesRede([{ nome_interface: 'Ethernet', ip: '', mac: '' }]);
    } else {
      setInterfacesRede([{ ...INTERFACE_REDE_INICIAL }]);
    }
    setArquivoTermo(null);
    setErroArquivo(null);
    setErroInterfaces(null);
    setMensagemStatus(null);
    if (inputArquivoRef.current) {
      inputArquivoRef.current.value = '';
    }
  }

  function handleMestreChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    if (mensagemStatus) setMensagemStatus(null);
    const { name, value } = event.target;
    setDadosMestre((anterior) => ({ ...anterior, [name]: value }));
  }

  function handleDetalheChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    if (mensagemStatus) setMensagemStatus(null);
    const { name, value } = event.target;

    let valorFormatado = value;
    if (name === 'imei') {
      valorFormatado = formatarIMEI(value);
    } else if (name === 'tag_patrimonio') {
      valorFormatado = formatarTag(value);
    }

    setDadosDetalhe((anterior) => ({ ...anterior, [name]: valorFormatado }));
  }

  function handleArquivoTermoChange(event: ChangeEvent<HTMLInputElement>) {
    if (mensagemStatus) setMensagemStatus(null);
    setErroArquivo(null);
    const arquivo = event.target.files?.[0];
    if (!arquivo) {
      setArquivoTermo(null);
      return;
    }

    if (arquivo.type !== 'application/pdf' && !arquivo.name.toLowerCase().endsWith('.pdf')) {
      setErroArquivo('O Termo de Responsabilidade deve ser um arquivo PDF.');
      setArquivoTermo(null);
      event.target.value = '';
      return;
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      setErroArquivo('O arquivo do termo de responsabilidade não pode exceder 10MB.');
      setArquivoTermo(null);
      event.target.value = '';
      return;
    }

    setArquivoTermo(arquivo);
  }

  function handleInterfaceChange(indice: number, campo: keyof InterfaceRede, valor: string) {
    if (mensagemStatus) setMensagemStatus(null);
    if (erroInterfaces) setErroInterfaces(null);
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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

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

      if (categoria === 'NVR') {
        if ('quantidade_canais' in detalhe && typeof detalhe.quantidade_canais === 'string') {
          detalhe.quantidade_canais = Number(detalhe.quantidade_canais);
        }
      }
    }

    const payload = {
      mestre: {
        categoria,
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
      const resposta = await criarEquipamento(mapCategoriaParaEndpoint(categoria), payload);
      const idNovoEquipamento = resposta.id_equipamento ?? resposta.id;

      let falhouAnexo = false;

      if (arquivoTermo && idNovoEquipamento) {
        try {
          await enviarAnexoEquipamento(idNovoEquipamento, arquivoTermo, 'TERMO_RESPONSABILIDADE');
        } catch (erroAnexo) {
          console.error('Erro ao anexar termo de responsabilidade:', erroAnexo);
          falhouAnexo = true;
          setMensagemStatus({
            tipo: 'aviso',
            texto:
              'Equipamento cadastrado, mas houve um erro ao anexar o termo de responsabilidade. Você pode anexar depois pela tela de detalhes.',
          });
          rolarParaTopo();
        }
      }

      if (falhouAnexo) {
        return;
      }

      if (acaoAposSalvarRef.current === 'continuar') {
        resetarFormularioMantendoContexto();
        setMensagemStatus({
          tipo: 'sucesso',
          texto: 'Equipamento cadastrado! Cadastre o próximo.',
        });
        rolarParaTopo();
        document.getElementById('marca')?.focus();
      } else {
        navigate('/equipamentos');
      }
    } catch (erro) {
      const dadosErro = (erro as any)?.response?.data as { mensagem?: string; campo?: string } | undefined;
      const campo = (dadosErro?.campo ?? (erro as any)?.campo) as 'ip' | 'mac' | undefined;
      const mensagem = dadosErro?.mensagem ?? (erro instanceof Error ? erro.message : undefined);

      if (campo === 'ip' || campo === 'mac') {
        setErroInterfaces({
          mensagem: mensagem ?? 'Endereço já cadastrado em outro equipamento.',
          campo,
        });
        document.getElementById('secao-interfaces-rede')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      setMensagemStatus({
        tipo: 'erro',
        texto: erro instanceof Error ? erro.message : 'Erro ao cadastrar equipamento.',
      });
      rolarParaTopo();
    }
  }

  return (
    <div className={styles.cartao}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.areaRolagem}>
          {mensagemStatus && (
            <div
              className={`${styles.banner} ${
                mensagemStatus.tipo === 'sucesso'
                  ? styles.bannerSucesso
                  : mensagemStatus.tipo === 'aviso'
                  ? styles.bannerAviso
                  : styles.bannerErro
              }`}
            >
              {mensagemStatus.texto}
            </div>
          )}

          <p className={styles.legendaObrigatorio}>
            <span className={styles.obrigatorio}>*</span> Campos obrigatórios
          </p>

          <div className={styles.secaoMonobloco}>
            <h2 className={styles.secaoTitulo}>Dados Básicos</h2>
            <div className={styles.grid2}>
              <div className={styles.campo}>
                <label htmlFor="categoria">
                  Categoria <span className={styles.obrigatorio}>*</span>
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  className={styles.select}
                  value={categoria}
                  onChange={(event) => setCategoria(event.target.value as Categoria)}
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
                <label htmlFor="status">
                  Status <span className={styles.obrigatorio}>*</span>
                </label>
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
                <label htmlFor="marca">
                  Marca <span className={styles.obrigatorio}>*</span>
                </label>
                <ComboBoxSelect
                  id="marca"
                  opcoes={opcoesMarca}
                  valor={dadosMestre.marca}
                  aoMudar={(val) => setDadosMestre((ant) => ({ ...ant, marca: val, modelo: '' }))}
                  placeholder="Selecione ou digite a marca"
                  obrigatorio
                />
              </div>

              <div className={styles.campo}>
                <label htmlFor="modelo">
                  Modelo <span className={styles.obrigatorio}>*</span>
                </label>
                <ComboBoxSelect
                  id="modelo"
                  opcoes={opcoesModelo}
                  valor={dadosMestre.modelo}
                  aoMudar={(val) => setDadosMestre((ant) => ({ ...ant, modelo: val }))}
                  placeholder="Selecione ou digite o modelo"
                  obrigatorio
                />
              </div>

              <div className={styles.campo}>
                <label htmlFor="localizacao_id">
                  Localização <span className={styles.obrigatorio}>*</span>
                </label>
                <ComboBoxSelect
                  id="localizacao_id"
                  opcoes={opcoesLocalizacao}
                  valor={dadosMestre.localizacao_id}
                  aoMudar={(val) => setDadosMestre((ant) => ({ ...ant, localizacao_id: val }))}
                  placeholder="Selecione a localização"
                  obrigatorio
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
                <label htmlFor="termo_responsabilidade">Termo de Responsabilidade (PDF)</label>
                <input
                  id="termo_responsabilidade"
                  ref={inputArquivoRef}
                  type="file"
                  accept="application/pdf"
                  className={styles.input}
                  onChange={handleArquivoTermoChange}
                />
                {erroArquivo && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{erroArquivo}</span>}
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
          </div>

          {categoria === 'COMPUTADOR' && (
            <div className={styles.secaoMonobloco}>
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
                  />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="antivirus_instalado">Antivírus Instalado</label>
                  <select
                    id="antivirus_instalado"
                    name="antivirus_instalado"
                    className={styles.select}
                    value={dadosDetalhe.antivirus_instalado ?? ''}
                    onChange={handleDetalheChange}
                  >
                    <option value="">Selecione...</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {categoria === 'SWITCH' && (
            <div className={styles.secaoMonobloco}>
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
            </div>
          )}

          {categoria === 'CELULAR' && (
            <div className={styles.secaoMonobloco}>
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
            </div>
          )}

          {categoria === 'NVR' && (
            <div className={styles.secaoMonobloco}>
              <h2 className={styles.secaoTitulo}>Detalhes Técnicos</h2>
              <div className={styles.grid2}>
                <div className={styles.campo}>
                  <label htmlFor="quantidade_canais">Quantidade de Canais</label>
                  <input
                    id="quantidade_canais"
                    name="quantidade_canais"
                    type="number"
                    className={styles.input}
                    placeholder="Ex: 8, 16, 32"
                    value={dadosDetalhe.quantidade_canais ?? ''}
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
                  <label htmlFor="identificacao_extra">Identificação Extra</label>
                  <input
                    id="identificacao_extra"
                    name="identificacao_extra"
                    className={styles.input}
                    value={dadosDetalhe.identificacao_extra ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
              </div>
            </div>
          )}

          {categoria === 'CAMERA' && (
            <div className={styles.secaoMonobloco}>
              <h2 className={styles.secaoTitulo}>Detalhes Técnicos</h2>
              <div className={styles.grid2}>
                <div className={styles.campo}>
                  <label htmlFor="resolucao">Resolução</label>
                  <input
                    id="resolucao"
                    name="resolucao"
                    className={styles.input}
                    placeholder="Ex: 1080p ou 4K"
                    value={dadosDetalhe.resolucao ?? ''}
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
                  <label htmlFor="identificacao_extra">Identificação Extra</label>
                  <input
                    id="identificacao_extra"
                    name="identificacao_extra"
                    className={styles.input}
                    value={dadosDetalhe.identificacao_extra ?? ''}
                    onChange={handleDetalheChange}
                  />
                </div>
              </div>
            </div>
          )}

          {categoria === 'IMPRESSORA' && (
            <div className={styles.secaoMonobloco}>
              <h2 className={styles.secaoTitulo}>Detalhes Técnicos</h2>
              <div className={styles.grid2}>
                <div className={styles.campo}>
                  <label htmlFor="tipo_conexao">
                    Tipo de Conexão <span className={styles.obrigatorio}>*</span>
                  </label>
                  <select
                    id="tipo_conexao"
                    name="tipo_conexao"
                    className={styles.select}
                    value={tipoConexao}
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
                    <label htmlFor="computador_conectado_id">
                      Computador Conectado <span className={styles.obrigatorio}>*</span>
                    </label>
                    <ComboBoxSelect
                      id="computador_conectado_id"
                      opcoes={opcoesComputadoresConectaveis}
                      valor={computadorConectadoId}
                      aoMudar={(val) => setComputadorConectadoId(val)}
                      placeholder="Selecione o computador conectado"
                      obrigatorio
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {!(categoria === 'IMPRESSORA' && tipoConexao === 'USB') && (
            <div className={styles.secaoMonobloco} id="secao-interfaces-rede">
            <h2 className={styles.secaoTitulo}>Interface de Rede</h2>
            {erroInterfaces && (
              <span className={styles.textoErroSecao}>
                {erroInterfaces.mensagem}
              </span>
            )}
            {interfacesRede.map((interfaceRede, indice) => {
              const deveDestacarIp =
                erroInterfaces?.campo === 'ip' &&
                linhasComCampoPreenchido === 1 &&
                interfaceRede.ip.trim() !== '';

              const deveDestacarMac =
                erroInterfaces?.campo === 'mac' &&
                linhasComCampoPreenchido === 1 &&
                interfaceRede.mac.trim() !== '';

              return (
                <div className={styles.grid2} key={indice}>
                  <div className={styles.campo}>
                    <label htmlFor={`nome_interface_${indice}`}>Nome da Interface</label>
                    <ComboBoxSelect
                      id={`nome_interface_${indice}`}
                      opcoes={opcoesTipoInterface}
                      valor={interfaceRede.nome_interface}
                      aoMudar={(novoValor) => handleInterfaceChange(indice, 'nome_interface', novoValor)}
                      placeholder="Selecione o tipo de interface"
                      desabilitado={categoria === 'CELULAR' || categoria === 'SWITCH'}
                    />
                  </div>
                  <div className={styles.campo}>
                    <label htmlFor={`ip_${indice}`}>IP</label>
                    <input
                      id={`ip_${indice}`}
                      className={`${styles.input} ${styles.inputMono} ${deveDestacarIp ? styles.inputComErro : ''}`}
                      placeholder="Ex: 192.168.0.10"
                      value={interfaceRede.ip}
                      onChange={(event) => handleInterfaceChange(indice, 'ip', event.target.value)}
                    />
                  </div>
                  <div className={styles.campo}>
                    <label htmlFor={`mac_${indice}`}>MAC</label>
                    <input
                      id={`mac_${indice}`}
                      className={`${styles.input} ${styles.inputMono} ${deveDestacarMac ? styles.inputComErro : ''}`}
                      placeholder="AA:BB:CC:DD:EE:FF"
                      value={interfaceRede.mac}
                      onChange={(event) => handleInterfaceChange(indice, 'mac', event.target.value)}
                    />
                  </div>
                  {interfacesRede.length > 1 && (
                    <div className={styles.campo}>
                      <label>&nbsp;</label>
                      <button type="button" className={styles.botaoCancelar} onClick={() => removerInterface(indice)}>
                        Remover Interface
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {categoria !== 'CELULAR' && categoria !== 'SWITCH' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className={styles.botaoCancelar} onClick={adicionarInterface}>
                  + Adicionar Interface
                </button>
              </div>
            )}
          </div>
          )}
        </div>

        <div className={styles.botoesAcao}>
          <button
            type="button"
            className={styles.botaoCancelar}
            onClick={() => {
              if (formularioTemDadosRelevantes()) {
                setModalCancelarAberto(true);
              } else {
                navigate('/equipamentos');
              }
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.botaoSalvarNovo}
            onClick={() => (acaoAposSalvarRef.current = 'continuar')}
          >
            Salvar e cadastrar outro
          </button>
          <button
            type="submit"
            className={styles.botaoSalvar}
            onClick={() => (acaoAposSalvarRef.current = 'listagem')}
          >
            Salvar
          </button>
        </div>
      </form>

      <ModalConfirmacao
        aberto={modalCancelarAberto}
        titulo="Sair sem salvar?"
        mensagem="Você tem alterações não salvas neste cadastro. Se sair agora, tudo o que foi preenchido será perdido."
        textoConfirmar="Sair sem salvar"
        textoCancelar="Continuar editando"
        variante="perigo"
        aoConfirmar={() => navigate('/equipamentos')}
        aoCancelar={() => setModalCancelarAberto(false)}
      />
    </div>
  );
}
