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

    // Inserir na tabela de detalhe (Computador)
    const comandoDetalhe = banco.prepare(`
      INSERT INTO eq_computadores (equipamento_id, usuario_alocado, tag_patrimonio, numero_serie, processador, memoria, armazenamento, sistema_operacional, antivirus_instalado)
      VALUES (@equipamento_id, @usuario_alocado, @tag_patrimonio, @numero_serie, @processador, @memoria, @armazenamento, @sistema_operacional, @antivirus_instalado)
    `);
    comandoDetalhe.run({
      usuario_alocado: dados.detalhe.usuario_alocado ?? null,
      tag_patrimonio: dados.detalhe.tag_patrimonio ?? null,
      numero_serie: dados.detalhe.numero_serie ?? null,
      processador: dados.detalhe.processador ?? null,
      memoria: dados.detalhe.memoria ?? null,
      armazenamento: dados.detalhe.armazenamento ?? null,
      sistema_operacional: dados.detalhe.sistema_operacional ?? null,
      // better-sqlite3 não aceita boolean como parâmetro; a coluna é BOOLEAN (0/1) no schema.
      antivirus_instalado: dados.detalhe.antivirus_instalado === undefined ? null : Number(dados.detalhe.antivirus_instalado),
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