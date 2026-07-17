import banco from '../database/conexao.js';

// 1. Definimos a interface com os dados exatos esperados
export interface DadosCriacaoComputador {
  mestre: {
    categoria: 'COMPUTADOR';
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
    usuario_alocado?: string;
    tag_patrimonio?: string;
    numero_serie?: string;
    processador?: string;
    memoria?: string;
    armazenamento?: string;
    sistema_operacional?: string;
    antivirus_instalado?: boolean;
  };
  interfaces?: Array<{
    nome_interface: string;
    ip?: string;
    mac?: string;
  }>;
}

// 2. Substituímos o "qualquerInterfaceSua" pela interface real
export const criarComputador = (dadosEntrada: DadosCriacaoComputador) => {
  
  // Adicionamos o tipo na variável 'dados' dentro dos parênteses
  const transacao = banco.transaction((dados: DadosCriacaoComputador) => {
    
    // Inserir na tabela mestre
    const comandoMestre = banco.prepare(`
      INSERT INTO equipamentos (categoria, marca, modelo, status, localizacao_id, cadastrado_por)
      VALUES (@categoria, @marca, @modelo, @status, @localizacao_id, @cadastrado_por)
    `);
    const resultadoMestre = comandoMestre.run(dados.mestre);
    const idEquipamento = resultadoMestre.lastInsertRowid;

    // Inserir na tabela de detalhe (Computador)
    const comandoDetalhe = banco.prepare(`
      INSERT INTO eq_computadores (equipamento_id, usuario_alocado, tag_patrimonio, numero_serie, processador, memoria, armazenamento, sistema_operacional)
      VALUES (@equipamento_id, @usuario_alocado, @tag_patrimonio, @numero_serie, @processador, @memoria, @armazenamento, @sistema_operacional)
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
      throw new Error('IP ou MAC já cadastrado em outro dispositivo na rede.');
    }
    throw erro;
  }
};