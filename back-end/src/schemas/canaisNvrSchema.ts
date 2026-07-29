import { z } from 'zod'

// ==========================================
// PARAMS COMPARTILHADO
// ==========================================

const canalParamsSchema = z.object({
  id: z.coerce.number().int().positive('ID do NVR inválido.'),
  numeroCanal: z.coerce.number().int().positive('Número do canal inválido.'),
})

// ==========================================
// ATUALIZAR CANAL
// ==========================================

const atualizarCanalBodySchema = z.object({
  camera_conectada_id: z
    .number()
    .int()
    .positive('camera_conectada_id deve ser um número inteiro positivo.')
    .nullable()
    .optional(),
  descricao: z.string().max(200, 'Descrição deve ter no máximo 200 caracteres.').nullable().optional(),
})

export const listarCanaisSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('ID do NVR inválido.'),
  }),
})

export const atualizarCanalSchema = z.object({
  params: canalParamsSchema,
  body: atualizarCanalBodySchema,
})

export type ListarCanaisParams = z.infer<typeof listarCanaisSchema>['params']
export type AtualizarCanalParams = z.infer<typeof canalParamsSchema>
export type AtualizarCanalBody = z.infer<typeof atualizarCanalBodySchema>
