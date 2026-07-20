import banco from '../database/conexao.js';

// 1. Definimos a interface com os dados exatos esperados
export interface DadosCriacaoCelular {
  mestre: {
    categoria: 'CELULAR';
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
    imei?: string;
    numero_serie?: string;
    memoria?: string;
    armazenamento?: string;
    operadora_numero?: string;
    modalidade?: 'CORPORATIVO' | 'BYOD';
    sistema_operacional?: string;
  };
  interfaces?: Array<{
    nome_interface: string;
    ip?: string;
    mac?: string;
  }>;
}

// 2. Substituímos o "qualquerInterfaceSua" pela interface real
export const criarCelular = (dadosEntrada: DadosCriacaoCelular) => {

  // Adicionamos o tipo na variável 'dados' dentro dos parênteses
  const transacao = banco.transaction((dados: DadosCriacaoCelular) => {

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

    // Inserir na tabela de detalhe (Celular)
    const comandoDetalhe = banco.prepare(`
      INSERT INTO eq_celulares (equipamento_id, usuario_alocado, imei, numero_serie, memoria, armazenamento, operadora_numero, modalidade, sistema_operacional)
      VALUES (@equipamento_id, @usuario_alocado, @imei, @numero_serie, @memoria, @armazenamento, @operadora_numero, @modalidade, @sistema_operacional)
    `);
    comandoDetalhe.run({
      usuario_alocado: dados.detalhe.usuario_alocado ?? null,
      imei: dados.detalhe.imei ?? null,
      numero_serie: dados.detalhe.numero_serie ?? null,
      memoria: dados.detalhe.memoria ?? null,
      armazenamento: dados.detalhe.armazenamento ?? null,
      operadora_numero: dados.detalhe.operadora_numero ?? null,
      modalidade: dados.detalhe.modalidade ?? null,
      sistema_operacional: dados.detalhe.sistema_operacional ?? null,
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
      if (erro.message.includes('eq_celulares.imei')) {
        throw new Error('IMEI já cadastrado em outro dispositivo.');
      }
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
