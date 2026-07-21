import { z } from 'zod'

export const criarOpcaoSchema = z.object({
  body: z.object({
    categoria: z.string().min(1, 'Categoria é obrigatória.'),
    valor: z.string().min(1, 'Valor é obrigatório.'),
    dependencia_id: z.number().int().nullable().optional(),
  }),
})

export const listarOpcoesQuerySchema = z.object({
  categoria: z.string().optional(),
})

export const listarOpcoesSchema = z.object({
  query: listarOpcoesQuerySchema,
})
