import banco from '../database/conexao.js'
import type { AtualizarPortaBody } from '../schemas/portasSwitchSchema.js'

// ==========================================
// TIPOS
// ==========================================

export interface PortaSwitch {
  id: number
  switch_id: number
  numero_porta: number
  equipamento_conectado_id: number | null
  descricao: string | null
  data_atualizacao: string
  // Campos do equipamento conectado (NULL quando porta livre)
  conectado_nome: string | null
  conectado_categoria: string | null
  conectado_marca: string | null
  conectado_modelo: string | null
  conectado_status: string | null
}

// ==========================================
// HELPERS INTERNOS
// ==========================================

/** Lança um erro com statusCode anexado — mesmo padrão usado em equipamentosController. */
function criarErro(mensagem: string, statusCode: number): Error & { statusCode: number } {
  const erro = new Error(mensagem) as Error & { statusCode: number }
  erro.statusCode = statusCode
  return erro
}

/** Confirma que o equipamento existe e é um SWITCH. Lança 404 se não encontrado. */
function assertSwitchExiste(switchId: number): void {
  const row = banco
    .prepare("SELECT id FROM equipamentos WHERE id = @id AND categoria = 'SWITCH'")
    .get({ id: switchId }) as { id: number } | undefined

  if (!row) {
    throw criarErro(`Switch com id ${switchId} não encontrado.`, 404)
  }
}

/** Retorna numero_portas cadastrado em eq_switches, ou 0 se não houver registro. */
function obterNumeroPortas(switchId: number): number {
  const row = banco
    .prepare('SELECT numero_portas FROM eq_switches WHERE equipamento_id = @id')
    .get({ id: switchId }) as { numero_portas: number | null } | undefined

  return row?.numero_portas ?? 0
}

// ==========================================
// listarPortasSwitch
// ==========================================

export const listarPortasSwitch = (switchId: number): PortaSwitch[] => {
  assertSwitchExiste(switchId)

  const numeroPortas = obterNumeroPortas(switchId)

  if (numeroPortas > 0) {
    // Conta quantas portas já existem para não duplicar
    const { count } = banco
      .prepare('SELECT COUNT(*) AS count FROM portas_switch WHERE switch_id = @switchId')
      .get({ switchId }) as { count: number }

    if (numeroPortas > count) {
      // Insere apenas as portas que ainda não existem (da count+1 até numero_portas)
      const inserir = banco.prepare(`
        INSERT INTO portas_switch (switch_id, numero_porta, equipamento_conectado_id, descricao)
        VALUES (@switchId, @numeroPorta, NULL, NULL)
      `)

      const inserirFaltantes = banco.transaction(() => {
        for (let porta = count + 1; porta <= numeroPortas; porta++) {
          inserir.run({ switchId, numeroPorta: porta })
        }
      })

      inserirFaltantes()
    }
  }

  const consulta = banco.prepare(`
    SELECT
      ps.id,
      ps.switch_id,
      ps.numero_porta,
      ps.equipamento_conectado_id,
      ps.descricao,
      ps.data_atualizacao,
      e.nome    AS conectado_nome,
      e.categoria AS conectado_categoria,
      e.marca   AS conectado_marca,
      e.modelo  AS conectado_modelo,
      e.status  AS conectado_status
    FROM portas_switch ps
    LEFT JOIN equipamentos e ON e.id = ps.equipamento_conectado_id
    WHERE ps.switch_id = @switchId
    ORDER BY ps.numero_porta ASC
  `)

  return consulta.all({ switchId }) as PortaSwitch[]
}

// ==========================================
// atualizarPorta
// ==========================================

// Whitelist explícita — NUNCA construída a partir de Object.keys(payload).
// Segue o mesmo padrão de COLUNAS_PERMITIDAS em equipamentosService.ts.
const CAMPOS_PERMITIDOS_PORTA = ['equipamento_conectado_id', 'descricao'] as const

export const atualizarPorta = (
  switchId: number,
  numeroPorta: number,
  dados: AtualizarPortaBody,
): void => {
  assertSwitchExiste(switchId)

  // Confirma que a porta existe para esse switch
  const portaExiste = banco
    .prepare('SELECT id FROM portas_switch WHERE switch_id = @switchId AND numero_porta = @numeroPorta')
    .get({ switchId, numeroPorta }) as { id: number } | undefined

  if (!portaExiste) {
    throw criarErro(`Porta ${numeroPorta} não encontrada no switch ${switchId}.`, 404)
  }

  // Valida equipamento_conectado_id antes de gravar
  if (dados.equipamento_conectado_id != null) {
    const equipamentoExiste = banco
      .prepare('SELECT id FROM equipamentos WHERE id = @id')
      .get({ id: dados.equipamento_conectado_id }) as { id: number } | undefined

    if (!equipamentoExiste) {
      throw criarErro(
        `Equipamento com id ${dados.equipamento_conectado_id} não encontrado.`,
        400,
      )
    }
  }

  // Monta SET com whitelist — inclui apenas os campos presentes no payload
  const setClauses: string[] = ['data_atualizacao = CURRENT_TIMESTAMP']
  const parametros: Record<string, unknown> = { switchId, numeroPorta }

  for (const campo of CAMPOS_PERMITIDOS_PORTA) {
    if (Object.prototype.hasOwnProperty.call(dados, campo)) {
      setClauses.push(`${campo} = @${campo}`)
      parametros[campo] = dados[campo] ?? null
    }
  }

  banco
    .prepare(
      `UPDATE portas_switch
       SET ${setClauses.join(', ')}
       WHERE switch_id = @switchId AND numero_porta = @numeroPorta`,
    )
    .run(parametros)
}
