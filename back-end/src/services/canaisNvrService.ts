import banco from '../database/conexao.js'
import type { AtualizarCanalBody } from '../schemas/canaisNvrSchema.js'

// ==========================================
// TIPOS
// ==========================================

export interface CanalNvr {
  id: number
  nvr_id: number
  numero_canal: number
  camera_conectada_id: number | null
  descricao: string | null
  data_atualizacao: string
  // Campos da câmera conectada (NULL quando canal livre)
  conectado_nome: string | null
  conectado_categoria: string | null
  conectado_marca: string | null
  conectado_modelo: string | null
  conectado_status: string | null
  conectado_ips: string[]
}

// ==========================================
// HELPERS INTERNOS
// ==========================================

function criarErro(mensagem: string, statusCode: number): Error & { statusCode: number } {
  const erro = new Error(mensagem) as Error & { statusCode: number }
  erro.statusCode = statusCode
  return erro
}

/** Confirma que o equipamento existe e é da categoria NVR. Lança 404 se não encontrado. */
function assertNvrExiste(nvrId: number): void {
  const row = banco
    .prepare("SELECT id FROM equipamentos WHERE id = @id AND categoria = 'NVR'")
    .get({ id: nvrId }) as { id: number } | undefined

  if (!row) {
    throw criarErro(`NVR com id ${nvrId} não encontrado.`, 404)
  }
}

/** Retorna quantidade_canais cadastrado em eq_nvrs, ou 0 se não houver registro. */
function obterQuantidadeCanais(nvrId: number): number {
  const row = banco
    .prepare('SELECT quantidade_canais FROM eq_nvrs WHERE equipamento_id = @id')
    .get({ id: nvrId }) as { quantidade_canais: number | null } | undefined

  return row?.quantidade_canais ?? 0
}

// ==========================================
// listarCanaisNvr
// ==========================================

export const listarCanaisNvr = (nvrId: number): CanalNvr[] => {
  assertNvrExiste(nvrId)

  const quantidadeCanais = obterQuantidadeCanais(nvrId)

  if (quantidadeCanais > 0) {
    // Conta quantos canais já existem para não duplicar
    const { count } = banco
      .prepare('SELECT COUNT(*) AS count FROM canais_nvr WHERE nvr_id = @nvrId')
      .get({ nvrId }) as { count: number }

    if (quantidadeCanais > count) {
      // Insere apenas os canais que ainda não existem (de count+1 até quantidadeCanais)
      const inserir = banco.prepare(`
        INSERT INTO canais_nvr (nvr_id, numero_canal, camera_conectada_id, descricao)
        VALUES (@nvrId, @numeroCanal, NULL, NULL)
      `)

      const inserirFaltantes = banco.transaction(() => {
        for (let canal = count + 1; canal <= quantidadeCanais; canal++) {
          inserir.run({ nvrId, numeroCanal: canal })
        }
      })

      inserirFaltantes()
    }
  }

  const consulta = banco.prepare(`
    SELECT
      cn.id, cn.nvr_id, cn.numero_canal, cn.camera_conectada_id,
      cn.descricao, cn.data_atualizacao,
      e.nome AS conectado_nome, e.categoria AS conectado_categoria,
      e.marca AS conectado_marca, e.modelo AS conectado_modelo,
      e.status AS conectado_status,
      GROUP_CONCAT(DISTINCT ir.ip) AS conectado_ips
    FROM canais_nvr cn
    LEFT JOIN equipamentos e ON e.id = cn.camera_conectada_id
    LEFT JOIN interfaces_rede ir ON ir.equipamento_id = e.id
    WHERE cn.nvr_id = @nvrId
    GROUP BY cn.id
    ORDER BY cn.numero_canal ASC
  `)

  const linhas = consulta.all({ nvrId }) as Array<
    Omit<CanalNvr, 'conectado_ips'> & { conectado_ips: string | null }
  >

  return linhas.map((linha) => ({
    ...linha,
    conectado_ips: linha.conectado_ips ? linha.conectado_ips.split(',') : [],
  }))
}

// ==========================================
// atualizarCanal
// ==========================================

const CAMPOS_PERMITIDOS_CANAL = ['camera_conectada_id', 'descricao'] as const

export const atualizarCanal = (
  nvrId: number,
  numeroCanal: number,
  dados: AtualizarCanalBody,
): void => {
  assertNvrExiste(nvrId)

  // Confirma que o canal existe para esse NVR
  const canalExiste = banco
    .prepare('SELECT id FROM canais_nvr WHERE nvr_id = @nvrId AND numero_canal = @numeroCanal')
    .get({ nvrId, numeroCanal }) as { id: number } | undefined

  if (!canalExiste) {
    throw criarErro(`Canal ${numeroCanal} não encontrado no NVR ${nvrId}.`, 404)
  }

  // Valida camera_conectada_id antes de gravar — apenas equipamentos de categoria 'CAMERA' são aceitos
  if (dados.camera_conectada_id != null) {
    const cameraExiste = banco
      .prepare("SELECT id FROM equipamentos WHERE id = @id AND categoria = 'CAMERA'")
      .get({ id: dados.camera_conectada_id }) as { id: number } | undefined

    if (!cameraExiste) {
      throw criarErro(
        `Apenas equipamentos da categoria CAMERA podem ser conectados a um canal de NVR. Equipamento ${dados.camera_conectada_id} não é uma câmera válida.`,
        400,
      )
    }
  }

  // Monta SET com whitelist
  const setClauses: string[] = ['data_atualizacao = CURRENT_TIMESTAMP']
  const parametros: Record<string, unknown> = { nvrId, numeroCanal }

  for (const campo of CAMPOS_PERMITIDOS_CANAL) {
    if (Object.prototype.hasOwnProperty.call(dados, campo)) {
      setClauses.push(`${campo} = @${campo}`)
      parametros[campo] = dados[campo] ?? null
    }
  }

  banco
    .prepare(
      `UPDATE canais_nvr
       SET ${setClauses.join(', ')}
       WHERE nvr_id = @nvrId AND numero_canal = @numeroCanal`,
    )
    .run(parametros)
}

// ==========================================
// listarCamerasConectaveis
// ==========================================

export interface CameraConectavel {
  id: number
  nome: string | null
  marca: string
  modelo: string
  categoria: string
  ips: string[]
}

export const listarCamerasConectaveis = (_excluirNvrId?: number): CameraConectavel[] => {
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
    WHERE e.categoria = 'CAMERA'
      AND e.status = 'ATIVO'
    GROUP BY e.id
    ORDER BY e.nome
  `)

  const linhas = consulta.all() as Array<{
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
