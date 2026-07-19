import { z } from 'zod'

const statusSchema = z.enum(['ATIVO', 'ESTOQUE', 'MANUTENCAO', 'DESCARTADO'])

const macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/

const mestreComputadorSchema = z.object({
  categoria: z.literal('COMPUTADOR'),
  marca: z.string().min(1, 'Marca é obrigatória.'),
  modelo: z.string().min(1, 'Modelo é obrigatório.'),
  status: statusSchema,
  localizacao_id: z.number().int().positive('localizacao_id deve ser um número positivo.'),
  nome: z.string().optional(),
  fornecedor: z.string().optional(),
  data_garantia: z.string().optional(),
  observacao: z.string().optional(),
})

const detalheComputadorSchema = z.object({
  usuario_alocado: z.string().optional(),
  tag_patrimonio: z.string().optional(),
  numero_serie: z.string().optional(),
  processador: z.string().optional(),
  memoria: z.string().optional(),
  armazenamento: z.string().optional(),
  sistema_operacional: z.string().optional(),
  antivirus_instalado: z.boolean().optional(),
})

const interfaceRedeSchema = z.object({
  nome_interface: z.string().min(1, 'Nome da interface é obrigatório.'),
  ip: z.union([z.ipv4(), z.ipv6()], { error: 'IP inválido. Informe um endereço IPv4 ou IPv6 válido.' }).optional(),
  mac: z
    .string()
    .regex(macRegex, 'MAC inválido. Formato esperado: AA:BB:CC:DD:EE:FF.')
    .optional(),
})

export const computadorSchema = z.object({
  body: z.object({
    mestre: mestreComputadorSchema,
    detalhe: detalheComputadorSchema,
    interfaces: z.array(interfaceRedeSchema).optional(),
  }),
})
