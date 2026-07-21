import { useEffect, useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarEquipamento, listarLocalizacoes } from '../../../services/equipamentos';
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
  fornecedor: string;
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
  fornecedor: '',
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

export default function Cadastro() {
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState<Categoria>('COMPUTADOR');
  const [dadosMestre, setDadosMestre] = useState<DadosMestre>(DADOS_MESTRE_INICIAIS);
  const [dadosDetalhe, setDadosDetalhe] = useState<Record<string, string>>({});
  const [interfacesRede, setInterfacesRede] = useState<InterfaceRede[]>([{ ...INTERFACE_REDE_INICIAL }]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [opcoesSugeridas, setOpcoesSugeridas] = useState<OpcoesAgrupadas>({});

  // Deriva o id da marca escolhida pelo texto digitado — usado para filtrar os modelos
  const marcaId =
    opcoesSugeridas.MARCA?.find(
      (m) => m.valor.toLowerCase() === dadosMestre.marca.trim().toLowerCase(),
    )?.id ?? null;

  useEffect(() => {
    listarLocalizacoes()
      .then((dados) => setLocalizacoes(dados))
      .catch((erro) => console.error('Erro ao carregar localizações:', erro));

    listarOpcoes()
      .then((dados) => setOpcoesSugeridas(dados))
      .catch((erro) => console.error('Erro ao carregar opções sugeridas:', erro));
  }, []);

  useEffect(() => {
    setDadosDetalhe({});
  }, [categoria]);

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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    // O <select> só produz strings; o back-end espera booleano de verdade
    // para antivirus_instalado, então convertemos só na hora de montar o payload.
    const detalhe: Record<string, string | boolean> = { ...dadosDetalhe };
    if (categoria === 'COMPUTADOR' && 'antivirus_instalado' in detalhe) {
      detalhe.antivirus_instalado = detalhe.antivirus_instalado === 'true';
    }

    const payload = {
      mestre: {
        categoria,
        marca: dadosMestre.marca,
        modelo: dadosMestre.modelo,
        status: dadosMestre.status,
        localizacao_id: Number(dadosMestre.localizacao_id),
        ...(dadosMestre.nome && { nome: dadosMestre.nome }),
        ...(dadosMestre.fornecedor && { fornecedor: dadosMestre.fornecedor }),
        ...(dadosMestre.data_garantia && { data_garantia: dadosMestre.data_garantia }),
        ...(dadosMestre.observacao && { observacao: dadosMestre.observacao }),
      },
      detalhe,
      interfaces: interfacesRede.filter((item) => item.nome_interface || item.ip || item.mac),
    };

    try {
      await criarEquipamento(mapCategoriaParaEndpoint(categoria), payload);
      navigate('/equipamentos');
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao cadastrar equipamento.');
    }
  }

  return (
    <div className={styles.cartao}>
      <form onSubmit={handleSubmit}>
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
            <input
              id="marca"
              name="marca"
              className={styles.input}
              list="lista-marcas"
              value={dadosMestre.marca}
              onChange={handleMestreChange}
              required
            />
            <datalist id="lista-marcas">
              {(opcoesSugeridas.MARCA ?? []).map((opcao) => (
                <option key={opcao.id} value={opcao.valor} />
              ))}
            </datalist>
          </div>

          <div className={styles.campo}>
            <label htmlFor="modelo">Modelo</label>
            <input
              id="modelo"
              name="modelo"
              className={styles.input}
              list="lista-modelos"
              value={dadosMestre.modelo}
              onChange={handleMestreChange}
              required
            />
            <datalist id="lista-modelos">
              {(opcoesSugeridas.MODELO ?? [])
                .filter((m) => marcaId === null || m.dependencia_id === marcaId)
                .map((opcao) => (
                  <option key={opcao.id} value={opcao.valor} />
                ))}
            </datalist>
          </div>

          <div className={styles.campo}>
            <label htmlFor="localizacao_id">Localização</label>
            <select
              id="localizacao_id"
              name="localizacao_id"
              className={styles.select}
              value={dadosMestre.localizacao_id}
              onChange={handleMestreChange}
              required
            >
              <option value="" disabled>
                Selecione...
              </option>
              {localizacoes.map((localizacao) => (
                <option key={localizacao.id} value={localizacao.id}>
                  {[localizacao.filial, localizacao.predio, localizacao.sala].filter(Boolean).join(' - ')}
                </option>
              ))}
            </select>
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
            <label htmlFor="fornecedor">Fornecedor</label>
            <input
              id="fornecedor"
              name="fornecedor"
              className={styles.input}
              value={dadosMestre.fornecedor}
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
                  className={styles.input}
                  value={dadosDetalhe.numero_serie ?? ''}
                  onChange={handleDetalheChange}
                />
              </div>
              <div className={styles.campo}>
                <label htmlFor="processador">Processador</label>
                <input
                  id="processador"
                  name="processador"
                  className={styles.input}
                  list="lista-processadores"
                  value={dadosDetalhe.processador ?? ''}
                  onChange={handleDetalheChange}
                />
                <datalist id="lista-processadores">
                  {(opcoesSugeridas.PROCESSADOR ?? []).map((opcao) => (
                    <option key={opcao.id} value={opcao.valor} />
                  ))}
                </datalist>
              </div>
              <div className={styles.campo}>
                <label htmlFor="memoria">Memória</label>
                <input
                  id="memoria"
                  name="memoria"
                  className={styles.input}
                  list="lista-memorias"
                  placeholder="Ex: 16GB DDR4"
                  value={dadosDetalhe.memoria ?? ''}
                  onChange={handleDetalheChange}
                />
                <datalist id="lista-memorias">
                  {(opcoesSugeridas.MEMORIA ?? []).map((opcao) => (
                    <option key={opcao.id} value={opcao.valor} />
                  ))}
                </datalist>
              </div>
              <div className={styles.campo}>
                <label htmlFor="armazenamento">Armazenamento</label>
                <input
                  id="armazenamento"
                  name="armazenamento"
                  className={styles.input}
                  list="lista-armazenamentos"
                  placeholder="Ex: 512GB NVMe"
                  value={dadosDetalhe.armazenamento ?? ''}
                  onChange={handleDetalheChange}
                />
                <datalist id="lista-armazenamentos">
                  {(opcoesSugeridas.ARMAZENAMENTO ?? []).map((opcao) => (
                    <option key={opcao.id} value={opcao.valor} />
                  ))}
                </datalist>
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
                  className={styles.input}
                  value={dadosDetalhe.firmware ?? ''}
                  onChange={handleDetalheChange}
                />
              </div>
              <div className={styles.campo}>
                <label htmlFor="vlans_configuradas">VLANs Configuradas</label>
                <input
                  id="vlans_configuradas"
                  name="vlans_configuradas"
                  className={styles.input}
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
                  className={styles.input}
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
                  className={styles.input}
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
                  className={styles.input}
                  value={dadosDetalhe.firmware ?? ''}
                  onChange={handleDetalheChange}
                />
              </div>
            </div>
          </>
        )}

        <h2 className={styles.secaoTitulo}>Interface de Rede</h2>
        {interfacesRede.map((interfaceRede, indice) => (
          <div className={styles.grid2} key={indice}>
            <div className={styles.campo}>
              <label htmlFor={`nome_interface_${indice}`}>Nome da Interface</label>
              <input
                id={`nome_interface_${indice}`}
                className={styles.input}
                placeholder="Ex: LAN 1, Wi-Fi"
                value={interfaceRede.nome_interface}
                onChange={(event) => handleInterfaceChange(indice, 'nome_interface', event.target.value)}
              />
            </div>
            <div className={styles.campo}>
              <label htmlFor={`ip_${indice}`}>IP</label>
              <input
                id={`ip_${indice}`}
                className={styles.input}
                placeholder="Ex: 192.168.0.10"
                value={interfaceRede.ip}
                onChange={(event) => handleInterfaceChange(indice, 'ip', event.target.value)}
              />
            </div>
            <div className={styles.campo}>
              <label htmlFor={`mac_${indice}`}>MAC</label>
              <input
                id={`mac_${indice}`}
                className={styles.input}
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

        <div className={styles.botoesAcao}>
          <button type="button" className={styles.botaoCancelar} onClick={adicionarInterface}>
            + Adicionar Interface
          </button>
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
