import { z } from 'zod'

const statusSchema = z.enum(['ATIVO', 'ESTOQUE', 'MANUTENCAO', 'DESCARTADO'])

const macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/

const criarMestreSchema = <T extends z.ZodType>(categoriaSchema: T) =>
  z.object({
    categoria: categoriaSchema,
    marca: z.string().min(1, 'Marca é obrigatória.'),
    modelo: z.string().min(1, 'Modelo é obrigatório.'),
    status: statusSchema,
    localizacao_id: z.number().int().positive('localizacao_id deve ser um número positivo.'),
    nome: z.string().optional(),
    fornecedor: z.string().optional(),
    data_garantia: z.string().optional(),
    observacao: z.string().optional(),
  })

const interfaceRedeSchema = z.object({
  nome_interface: z.string().min(1, 'Nome da interface é obrigatório.'),
  ip: z.union([z.ipv4(), z.ipv6()], { error: 'IP inválido. Informe um endereço IPv4 ou IPv6 válido.' }).optional(),
  mac: z
    .string()
    .regex(macRegex, 'MAC inválido. Formato esperado: AA:BB:CC:DD:EE:FF.')
    .optional(),
})

const interfacesSchema = z.array(interfaceRedeSchema).optional()

// ==========================================
// COMPUTADOR
// ==========================================

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

export const computadorSchema = z.object({
  body: z.object({
    mestre: criarMestreSchema(z.literal('COMPUTADOR')),
    detalhe: detalheComputadorSchema,
    interfaces: interfacesSchema,
  }),
})

// ==========================================
// SWITCH
// ==========================================

const detalheSwitchSchema = z.object({
  numero_portas: z.number().int().nonnegative('numero_portas não pode ser negativo.').optional(),
  portas_em_uso: z.number().int().nonnegative('portas_em_uso não pode ser negativo.').optional(),
  firmware: z.string().optional(),
  vlans_configuradas: z.string().optional(),
})

export const switchSchema = z.object({
  body: z.object({
    mestre: criarMestreSchema(z.literal('SWITCH')),
    detalhe: detalheSwitchSchema,
    interfaces: interfacesSchema,
  }),
})

// ==========================================
// CELULAR
// ==========================================

const imeiRegex = /^\d{15}$/

const detalheCelularSchema = z.object({
  usuario_alocado: z.string().optional(),
  imei: z.string().regex(imeiRegex, 'IMEI inválido. Deve conter exatamente 15 dígitos.').optional(),
  numero_serie: z.string().optional(),
  memoria: z.string().optional(),
  armazenamento: z.string().optional(),
  operadora_numero: z.string().optional(),
  modalidade: z.enum(['CORPORATIVO', 'BYOD']).optional(),
  sistema_operacional: z.string().optional(),
})

export const celularSchema = z.object({
  body: z.object({
    mestre: criarMestreSchema(z.literal('CELULAR')),
    detalhe: detalheCelularSchema,
    interfaces: interfacesSchema,
  }),
})

// ==========================================
// CFTV (NVR / CAMERA)
// ==========================================

const detalheCftvSchema = z.object({
  identificacao_extra: z.string().optional(),
  capacidade_armazenamento: z.string().optional(),
  quantidade_canais_resolucao: z.string().optional(),
  firmware: z.string().optional(),
})

export const cftvSchema = z.object({
  body: z.object({
    mestre: criarMestreSchema(z.enum(['NVR', 'CAMERA'])),
    detalhe: detalheCftvSchema,
    interfaces: interfacesSchema,
  }),
})
