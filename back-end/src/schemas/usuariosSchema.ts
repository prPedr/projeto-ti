import { z } from 'zod'

const perfilSchema = z.enum(['ADMIN', 'TECNICO', 'LEITURA'])

const idParamSchema = z.object({
  id: z.coerce.number().int().positive('ID do usuário inválido.'),
})

export const criarUsuarioSchema = z.object({
  body: z.object({
    nome: z.string().min(1, 'Nome é obrigatório.'),
    email: z.email('E-mail inválido.'),
    senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres.'),
    perfil: perfilSchema,
  }),
})

export const editarUsuarioSchema = z.object({
  params: idParamSchema,
  body: z.object({
    nome: z.string().min(1, 'Nome é obrigatório.').optional(),
    perfil: perfilSchema.optional(),
    ativo: z.boolean().optional(),
  }),
})

export const redefinirSenhaSchema = z.object({
  params: idParamSchema,
  body: z.object({
    senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres.'),
  }),
})
