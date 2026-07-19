import { z } from 'zod'

export const listarLocalizacoesQuerySchema = z.object({
  pagina: z.coerce.number().int('pagina deve ser um número inteiro.').min(1, 'pagina deve ser maior ou igual a 1.').optional().default(1),
  limite: z.coerce
    .number()
    .int('limite deve ser um número inteiro.')
    .min(1, 'limite deve ser maior ou igual a 1.')
    .max(100, 'limite deve ser no máximo 100.')
    .optional()
    .default(20),
  busca: z.string().optional(),
})

export const listarLocalizacoesSchema = z.object({
  query: listarLocalizacoesQuerySchema,
})
