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
    portas_em_uso?: number;
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
      INSERT INTO equipamentos (categoria, marca, modelo, status, localizacao_id, cadastrado_por)
      VALUES (@categoria, @marca, @modelo, @status, @localizacao_id, @cadastrado_por)
    `);
    const resultadoMestre = comandoMestre.run(dados.mestre);
    const idEquipamento = resultadoMestre.lastInsertRowid;

    // Inserir na tabela de detalhe (Switch)
    const comandoDetalhe = banco.prepare(`
      INSERT INTO eq_switches (equipamento_id, numero_portas, portas_em_uso, firmware, vlans_configuradas)
      VALUES (@equipamento_id, @numero_portas, @portas_em_uso, @firmware, @vlans_configuradas)
    `);
    comandoDetalhe.run({ ...dados.detalhe, equipamento_id: idEquipamento });

    // Inserir Interfaces de Rede
    if (dados.interfaces && dados.interfaces.length > 0) {
      const comandoRede = banco.prepare(`
        INSERT INTO interfaces_rede (equipamento_id, nome_interface, ip, mac)
        VALUES (@equipamento_id, @nome_interface, @ip, @mac)
      `);

      for (const interfaceRede of dados.interfaces) {
        comandoRede.run({ ...interfaceRede, equipamento_id: idEquipamento });
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
