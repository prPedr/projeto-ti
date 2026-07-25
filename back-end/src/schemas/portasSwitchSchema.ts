import { z } from 'zod'

// ==========================================
// PARAMS COMPARTILHADO
// ==========================================

const portaParamsSchema = z.object({
  id: z.coerce.number().int().positive('ID do switch inválido.'),
  numeroPorta: z.coerce.number().int().positive('Número da porta inválido.'),
})

// ==========================================
// ATUALIZAR PORTA
// ==========================================

const atualizarPortaBodySchema = z.object({
  equipamento_conectado_id: z
    .number()
    .int()
    .positive('equipamento_conectado_id deve ser um número inteiro positivo.')
    .nullable()
    .optional(),
  descricao: z.string().max(200, 'Descrição deve ter no máximo 200 caracteres.').nullable().optional(),
})

export const atualizarPortaSchema = z.object({
  params: portaParamsSchema,
  body: atualizarPortaBodySchema,
})

export type AtualizarPortaParams = z.infer<typeof portaParamsSchema>
export type AtualizarPortaBody = z.infer<typeof atualizarPortaBodySchema>
