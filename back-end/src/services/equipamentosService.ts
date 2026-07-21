import banco from '../database/conexao.js'

export interface EquipamentoListado {
  id: number
  categoria: 'COMPUTADOR' | 'SWITCH' | 'CELULAR' | 'NVR' | 'CAMERA'
  nome: string | null
  marca: string
  modelo: string
  status: 'ATIVO' | 'ESTOQUE' | 'MANUTENCAO' | 'DESCARTADO'
  fornecedor: string | null
  data_garantia: string | null
  observacao: string | null
  data_cadastro: string
  localizacao_id: number | null
  filial: string | null
  sala: string | null
  cadastrado_por: number
  cadastrado_por_nome: string | null
}

export interface FiltrosListagem {
  pagina: number
  limite: number
  busca?: string
  status?: string
}

export interface ResultadoListagemEquipamentos {
  dados: EquipamentoListado[]
  metadados: {
    totalRegistros: number
    paginaAtual: number
    limite: number
    totalPaginas: number
  }
}

export const listarEquipamentos = (filtros: FiltrosListagem): ResultadoListagemEquipamentos => {
  const condicoes: string[] = []
  const parametros: any = {}

  if (filtros.status) {
    condicoes.push('e.status = @status')
    parametros.status = filtros.status
  } else {
    // Sem filtro explícito, esconde os descartados das listagens/dashboard por
    // padrão; quem quiser vê-los, filtra status=DESCARTADO de propósito.
    condicoes.push("e.status != 'DESCARTADO'")
  }

  if (filtros.busca) {
    condicoes.push('(e.nome LIKE @busca OR e.marca LIKE @busca OR e.modelo LIKE @busca OR eqc.tag_patrimonio LIKE @busca)')
    parametros.busca = `%${filtros.busca}%`
  }

  const clausulaWhere = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : ''

  // Junta eq_computadores só para permitir buscar por tag_patrimonio; os demais
  // campos pesquisados (nome, marca, modelo) já vivem na tabela mestre.
  const consultaContagem = banco.prepare(`
    SELECT COUNT(e.id) AS total
    FROM equipamentos e
    LEFT JOIN eq_computadores eqc ON eqc.equipamento_id = e.id
    ${clausulaWhere}
  `)
  const { total: totalRegistros } = consultaContagem.get(parametros) as { total: number }

  const offset = (filtros.pagina - 1) * filtros.limite
  parametros.limite = filtros.limite
  parametros.offset = offset

  const consulta = banco.prepare(`
    SELECT
      e.id,
      e.categoria,
      e.nome,
      e.marca,
      e.modelo,
      e.status,
      e.fornecedor,
      e.data_garantia,
      e.observacao,
      e.data_cadastro,
      e.localizacao_id,
      l.filial AS filial,
      l.sala AS sala,
      e.cadastrado_por,
      u.nome AS cadastrado_por_nome
    FROM equipamentos e
    LEFT JOIN localizacoes l ON l.id = e.localizacao_id
    LEFT JOIN usuarios_sistema u ON u.id = e.cadastrado_por
    LEFT JOIN eq_computadores eqc ON eqc.equipamento_id = e.id
    ${clausulaWhere}
    ORDER BY e.data_cadastro DESC
    LIMIT @limite OFFSET @offset
  `)

  const dados = consulta.all(parametros) as EquipamentoListado[]

  return {
    dados,
    metadados: {
      totalRegistros,
      paginaAtual: filtros.pagina,
      limite: filtros.limite,
      totalPaginas: Math.ceil(totalRegistros / filtros.limite),
    },
  }
}

export type ResultadoDescarte = 'NAO_ENCONTRADO' | 'JA_DESCARTADO' | 'DESCARTADO'

export const descartarEquipamento = (id: number, usuarioId: number): ResultadoDescarte => {
  // Checa o status antes de gravar: sem isso, descartar duas vezes o mesmo
  // equipamento reescreve data_descarte e duplica o texto em observacao a
  // cada chamada (changes sempre voltava 1, escondendo o problema).
  const equipamento = banco.prepare('SELECT status FROM equipamentos WHERE id = @id').get({ id }) as
    | { status: string }
    | undefined

  if (!equipamento) {
    return 'NAO_ENCONTRADO'
  }

  if (equipamento.status === 'DESCARTADO') {
    return 'JA_DESCARTADO'
  }

  const transacao = banco.transaction(() => {
    const interfaces = banco.prepare('SELECT ip, mac FROM interfaces_rede WHERE equipamento_id = @id').all({ id }) as Array<{
      ip: string | null
      mac: string | null
    }>

    const enderecosLiberados = interfaces.flatMap((interfaceRede) => [interfaceRede.ip, interfaceRede.mac]).filter((valor): valor is string => valor !== null)

    const notaEnderecos = enderecosLiberados.length > 0 ? ` (IP/MAC liberados para reuso: ${enderecosLiberados.join(', ')})` : ''

    // Zera ip/mac em vez de deletar a interface: libera o UNIQUE(ip)/UNIQUE(mac)
    // para outro equipamento (ex.: reaproveitar a placa wifi de um notebook
    // quebrado em outro), já que o SQLite trata cada NULL como valor distinto
    // e não bloqueia a constraint. O valor liberado fica registrado abaixo.
    banco.prepare('UPDATE interfaces_rede SET ip = NULL, mac = NULL WHERE equipamento_id = @id').run({ id })

    banco
      .prepare(
        `
        UPDATE equipamentos
        SET
          status = 'DESCARTADO',
          data_descarte = CURRENT_TIMESTAMP,
          observacao = COALESCE(observacao || ' ', '') || 'Descartado pelo usuário ID ' || CAST(@usuarioId AS INTEGER) || @notaEnderecos
        WHERE id = @id
      `
      )
      .run({ id, usuarioId, notaEnderecos })
  })

  transacao()

  return 'DESCARTADO'
}

export const buscarEquipamentoPorId = (id: number) => {
  // Ajuste: A tabela real é 'equipamentos' e a coluna de exclusão é 'data_descarte'
  const mestre = banco.prepare('SELECT * FROM equipamentos WHERE id = ? AND data_descarte IS NULL').get(id) as any;
  
  if (!mestre) {
    throw new Error('Equipamento não encontrado');
  }

  let detalhe = null;
  switch (mestre.categoria) {
    case 'COMPUTADOR':
      detalhe = banco.prepare('SELECT * FROM eq_computadores WHERE equipamento_id = ?').get(id);
      break;
    case 'SWITCH':
      detalhe = banco.prepare('SELECT * FROM eq_switches WHERE equipamento_id = ?').get(id);
      break;
    case 'CELULAR':
      detalhe = banco.prepare('SELECT * FROM eq_celulares WHERE equipamento_id = ?').get(id);
      break;
    case 'NVR':
    case 'CAMERA':
      detalhe = banco.prepare('SELECT * FROM eq_cftv WHERE equipamento_id = ?').get(id);
      break;
  }

  const interfaces = banco.prepare('SELECT * FROM interfaces_rede WHERE equipamento_id = ?').all(id);

  return { mestre, detalhe, interfaces };
}

export const atualizarEquipamento = (id: number, payload: any) => {
  const higienizarValores = (valores: any[]) => valores.map(v => typeof v === 'boolean' ? (v ? 1 : 0) : v);

  const transacao = banco.transaction(() => {
    // 1. Atualizar Mestre
    if (payload.mestre && Object.keys(payload.mestre).length > 0) {
      const keysMestre = Object.keys(payload.mestre);
      const setMestre = keysMestre.map(k => `${k} = ?`).join(', ');
      const valoresMestre = higienizarValores([...Object.values(payload.mestre), id]);
      banco.prepare(`UPDATE equipamentos SET ${setMestre} WHERE id = ?`).run(...valoresMestre);
    }

    // 2. Atualizar Detalhes
    if (payload.detalhe && Object.keys(payload.detalhe).length > 0) {
      // Se a categoria não vier no payload, buscamos do banco para saber qual tabela atualizar
      let categoria = payload.mestre?.categoria;
      if (!categoria) {
        const equipamento = banco.prepare('SELECT categoria FROM equipamentos WHERE id = ?').get(id) as any;
        categoria = equipamento?.categoria;
      }

      let tabelaDetalhe = '';
      switch (categoria) {
        case 'COMPUTADOR': tabelaDetalhe = 'eq_computadores'; break;
        case 'SWITCH': tabelaDetalhe = 'eq_switches'; break;
        case 'CELULAR': tabelaDetalhe = 'eq_celulares'; break;
        case 'NVR':
        case 'CAMERA': tabelaDetalhe = 'eq_cftv'; break;
      }

      if (tabelaDetalhe) {
        const keysDetalhe = Object.keys(payload.detalhe);
        const setDetalhe = keysDetalhe.map(k => `${k} = ?`).join(', ');
        const valoresDetalhe = higienizarValores([...Object.values(payload.detalhe), id]);
        banco.prepare(`UPDATE ${tabelaDetalhe} SET ${setDetalhe} WHERE equipamento_id = ?`).run(...valoresDetalhe);
      }
    }

    // 3. Atualizar Interfaces de Rede
    if (payload.interfaces) {
      banco.prepare('DELETE FROM interfaces_rede WHERE equipamento_id = ?').run(id);
      
      const insertInterface = banco.prepare(`
        INSERT INTO interfaces_rede (equipamento_id, nome_interface, ip, mac)
        VALUES (@equipamento_id, @nome_interface, @ip, @mac)
      `);
      
      for (const intf of payload.interfaces) {
        insertInterface.run({
          equipamento_id: id,
          nome_interface: intf.nome_interface,
          ip: intf.ip || null,
          mac: intf.mac || null
        });
      }
    }
  });

  transacao();
}
