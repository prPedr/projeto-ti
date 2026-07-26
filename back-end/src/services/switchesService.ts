import banco from '../database/conexao.js';

// 1. Definimos a interface com os dados exatos esperados
export interface DadosCriacaoSwitch {
  mestre: {
    categoria: 'SWITCH';
    marca: string;
    modelo: string;
    status: 'ATIVO' | 'ESTOQUE' | 'MANUTENCAO' | 'DESCARTADO';
    localizacao_id: number;
    cadastrado_por: number;
    nome?: string;
    fornecedor?: string;
    data_garantia?: string;
    observacao?: string;
  };
  detalhe: {
    numero_portas?: number;
    firmware?: string;
    vlans_configuradas?: string;
  };
  interfaces?: Array<{
    nome_interface: string;
    ip?: string;
    mac?: string;
  }>;
}

// 2. Substituímos o "qualquerInterfaceSua" pela interface real
export const criarSwitch = (dadosEntrada: DadosCriacaoSwitch) => {

  // Adicionamos o tipo na variável 'dados' dentro dos parênteses
  const transacao = banco.transaction((dados: DadosCriacaoSwitch) => {

    // Inserir na tabela mestre
    const comandoMestre = banco.prepare(`
      INSERT INTO equipamentos (categoria, marca, modelo, status, localizacao_id, cadastrado_por, nome, fornecedor, data_garantia, observacao)
      VALUES (@categoria, @marca, @modelo, @status, @localizacao_id, @cadastrado_por, @nome, @fornecedor, @data_garantia, @observacao)
    `);
    const resultadoMestre = comandoMestre.run({
      ...dados.mestre,
      nome: dados.mestre.nome ?? null,
      fornecedor: dados.mestre.fornecedor ?? null,
      data_garantia: dados.mestre.data_garantia ?? null,
      observacao: dados.mestre.observacao ?? null,
    });
    const idEquipamento = resultadoMestre.lastInsertRowid;

    // Inserir na tabela de detalhe (Switch)
    const comandoDetalhe = banco.prepare(`
      INSERT INTO eq_switches (equipamento_id, numero_portas, firmware, vlans_configuradas)
      VALUES (@equipamento_id, @numero_portas, @firmware, @vlans_configuradas)
    `);
    comandoDetalhe.run({
      numero_portas: dados.detalhe.numero_portas ?? null,
      firmware: dados.detalhe.firmware ?? null,
      vlans_configuradas: dados.detalhe.vlans_configuradas ?? null,
      equipamento_id: idEquipamento,
    });

    // Inserir Interfaces de Rede
    if (dados.interfaces && dados.interfaces.length > 0) {
      const comandoRede = banco.prepare(`
        INSERT INTO interfaces_rede (equipamento_id, nome_interface, ip, mac)
        VALUES (@equipamento_id, @nome_interface, @ip, @mac)
      `);

      for (const interfaceRede of dados.interfaces) {
        comandoRede.run({
          nome_interface: interfaceRede.nome_interface,
          ip: interfaceRede.ip ?? null,
          mac: interfaceRede.mac ?? null,
          equipamento_id: idEquipamento,
        });
      }
    }

    return idEquipamento;
  });

  try {
    const novoId = transacao(dadosEntrada);
    return novoId;
  } catch (erro: any) {
    if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      if (erro.message.includes('interfaces_rede.ip')) {
        throw new Error('IP já cadastrado em outro dispositivo na rede.');
      }
      if (erro.message.includes('interfaces_rede.mac')) {
        throw new Error('MAC já cadastrado em outro dispositivo na rede.');
      }
      throw new Error('IP ou MAC já cadastrado em outro dispositivo na rede.');
    }
    throw erro;
  }
};

export interface SwitchListado {
  id: number;
  nome: string | null;
  marca: string;
  modelo: string;
  status: string;
  numero_portas: number | null;
  filial: string | null;
  sala: string | null;
  portas_ocupadas: number;
}

export const listarSwitches = (): SwitchListado[] => {
  const consulta = banco.prepare(`
    SELECT
      e.id,
      e.nome,
      e.marca,
      e.modelo,
      e.status,
      es.numero_portas,
      l.filial,
      l.sala,
      (
        SELECT COUNT(*)
        FROM portas_switch ps
        WHERE ps.switch_id = e.id
          AND (ps.equipamento_conectado_id IS NOT NULL OR ps.descricao IS NOT NULL)
      ) AS portas_ocupadas
    FROM equipamentos e
    JOIN eq_switches es ON es.equipamento_id = e.id
    LEFT JOIN localizacoes l ON l.id = e.localizacao_id
    WHERE e.status != 'DESCARTADO'
    ORDER BY e.nome
  `)

  return consulta.all() as SwitchListado[]
}

export interface EquipamentoConectavel {
  id: number
  nome: string | null
  marca: string
  modelo: string
  categoria: string
  ips: string[]
}

export const listarEquipamentosConectaveis = (excluirId?: number): EquipamentoConectavel[] => {
  const parametros: Record<string, any> = {}
  let condicaoExcluir = ''

  if (excluirId) {
    condicaoExcluir = 'AND e.id != @excluirId'
    parametros.excluirId = excluirId
  }

  const consulta = banco.prepare(`
    SELECT
      e.id,
      e.nome,
      e.marca,
      e.modelo,
      e.categoria,
      GROUP_CONCAT(DISTINCT ir.ip) AS ips
    FROM equipamentos e
    LEFT JOIN interfaces_rede ir ON ir.equipamento_id = e.id
    WHERE e.categoria IN ('COMPUTADOR', 'SWITCH', 'NVR', 'CAMERA')
      AND e.status = 'ATIVO'
      ${condicaoExcluir}
    GROUP BY e.id
    ORDER BY e.nome
  `)

  const linhas = consulta.all(parametros) as Array<{
    id: number
    nome: string | null
    marca: string
    modelo: string
    categoria: string
    ips: string | null
  }>

  return linhas.map((linha) => ({
    id: linha.id,
    nome: linha.nome,
    marca: linha.marca,
    modelo: linha.modelo,
    categoria: linha.categoria,
    ips: linha.ips ? linha.ips.split(',') : [],
  }))
}
