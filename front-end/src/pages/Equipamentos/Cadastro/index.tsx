import { useEffect, useState, useMemo } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ComboBoxSelect from '../../../components/ComboBoxSelect';
import { criarEquipamento, enviarAnexoEquipamento, listarLocalizacoes } from '../../../services/equipamentos';
import type { CategoriaEquipamento } from '../../../services/equipamentos';
import { listarOpcoes } from '../../../services/opcoes';
import type { OpcoesAgrupadas } from '../../../services/opcoes';
import { formatarMAC, formatarIMEI, formatarIP, formatarTag } from '../../../utils/formatadores';
import styles from './Cadastro.module.css';

type Categoria = 'COMPUTADOR' | 'SWITCH' | 'CELULAR' | 'NVR' | 'CAMERA';

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
    case 'CAMERA':
      return 'cftv';
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
    case 'CAMERA':
      return 'NVR_CAMERA';
  }
}

export default function Cadastro() {
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState<Categoria>('COMPUTADOR');
  const [dadosMestre, setDadosMestre] = useState<DadosMestre>(DADOS_MESTRE_INICIAIS);
  const [dadosDetalhe, setDadosDetalhe] = useState<Record<string, string>>({});
  const [interfacesRede, setInterfacesRede] = useState<InterfaceRede[]>([{ ...INTERFACE_REDE_INICIAL }]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [opcoesSugeridas, setOpcoesSugeridas] = useState<OpcoesAgrupadas>({});
  const [arquivoTermo, setArquivoTermo] = useState<File | null>(null);
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);

  // Deriva o id da marca escolhida pelo texto digitado — usado para filtrar os modelos
  const marcaId =
    opcoesSugeridas.MARCA?.find(
      (m) => m.valor.toLowerCase() === dadosMestre.marca.trim().toLowerCase(),
    )?.id ?? null;

  useEffect(() => {
    listarLocalizacoes()
      .then((dados) => setLocalizacoes(dados))
      .catch((erro) => console.error('Erro ao carregar localizações:', erro));
  }, []);

  useEffect(() => {
    setDadosDetalhe({});
    setDadosMestre((anterior) => ({ ...anterior, marca: '', modelo: '' }));

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

  function handleArquivoTermoChange(event: ChangeEvent<HTMLInputElement>) {
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

    const detalhe: Record<string, string | boolean | number> = {};

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
      if ('portas_em_uso' in detalhe && typeof detalhe.portas_em_uso === 'string') {
        detalhe.portas_em_uso = Number(detalhe.portas_em_uso);
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
      interfaces: interfacesRede
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

      if (arquivoTermo && idNovoEquipamento) {
        try {
          await enviarAnexoEquipamento(idNovoEquipamento, arquivoTermo, 'TERMO_RESPONSABILIDADE');
        } catch (erroAnexo) {
          console.error('Erro ao anexar termo de responsabilidade:', erroAnexo);
          alert(
            'Equipamento cadastrado, mas houve um erro ao anexar o termo de responsabilidade. Você pode anexar depois pela tela de detalhes.',
          );
        }
      }

      navigate('/equipamentos');
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao cadastrar equipamento.');
    }
  }

  return (
    <div className={styles.cartao}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.areaRolagem}>
          <div className={styles.secaoMonobloco}>
            <h2 className={styles.secaoTitulo}>Dados Básicos</h2>
            <div className={styles.grid2}>
              <div className={styles.campo}>
                <label htmlFor="categoria">Categoria</label>
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
                  aoMudar={(val) => setDadosMestre((ant) => ({ ...ant, marca: val }))}
                  placeholder="Selecione ou digite a marca"
                  obrigatorio
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
                  <label htmlFor="portas_em_uso">Portas em Uso</label>
                  <input
                    id="portas_em_uso"
                    name="portas_em_uso"
                    type="number"
                    className={styles.input}
                    value={dadosDetalhe.portas_em_uso ?? ''}
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

          {(categoria === 'NVR' || categoria === 'CAMERA') && (
            <div className={styles.secaoMonobloco}>
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
            </div>
          )}

          <div className={styles.secaoMonobloco}>
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
                {interfacesRede.length > 1 && (
                  <div className={styles.campo}>
                    <label>&nbsp;</label>
                    <button type="button" className={styles.botaoCancelar} onClick={() => removerInterface(indice)}>
                      Remover Interface
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" className={styles.botaoCancelar} onClick={adicionarInterface}>
                + Adicionar Interface
              </button>
            </div>
          </div>
        </div>

        <div className={styles.botoesAcao}>
          <button type="button" className={styles.botaoCancelar} onClick={() => navigate('/equipamentos')}>
            Cancelar
          </button>
          <button type="submit" className={styles.botaoSalvar}>
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
