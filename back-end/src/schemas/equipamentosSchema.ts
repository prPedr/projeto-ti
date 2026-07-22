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

// ==========================================
// LISTAGEM (query string: paginação e filtros)
// ==========================================

export const listarEquipamentosQuerySchema = z.object({
  pagina: z.coerce.number().int('pagina deve ser um número inteiro.').min(1, 'pagina deve ser maior ou igual a 1.').optional().default(1),
  limite: z.coerce
    .number()
    .int('limite deve ser um número inteiro.')
    .min(1, 'limite deve ser maior ou igual a 1.')
    .max(100, 'limite deve ser no máximo 100.')
    .optional()
    .default(20),
  busca: z.string().optional(),
  status: statusSchema.optional(),
})

export const listarEquipamentosSchema = z.object({
  query: listarEquipamentosQuerySchema,
})

// ==========================================
// ATUALIZAÇÃO DE EQUIPAMENTO
// ==========================================

const mestreAtualizarSchema = z
  .object({
    marca: z.string().min(1, 'Marca é obrigatória.'),
    modelo: z.string().min(1, 'Modelo é obrigatório.'),
    status: statusSchema,
    localizacao_id: z.number().int().positive('localizacao_id deve ser um número positivo.'),
    nome: z.string().optional(),
    fornecedor: z.string().optional(),
    data_garantia: z.string().optional(),
    observacao: z.string().optional(),
    categoria: z.enum(['COMPUTADOR', 'SWITCH', 'CELULAR', 'NVR', 'CAMERA']).optional(),
  })
  .partial()

const detalheAtualizarSchema = z
  .object({
    usuario_alocado: z.string().optional(),
    tag_patrimonio: z.string().optional(),
    numero_serie: z.string().optional(),
    processador: z.string().optional(),
    memoria: z.string().optional(),
    armazenamento: z.string().optional(),
    sistema_operacional: z.string().optional(),
    antivirus_instalado: z.boolean().optional(),
    numero_portas: z.number().int().nonnegative('numero_portas não pode ser negativo.').optional(),
    portas_em_uso: z.number().int().nonnegative('portas_em_uso não pode ser negativo.').optional(),
    firmware: z.string().optional(),
    vlans_configuradas: z.string().optional(),
    imei: z.string().regex(imeiRegex, 'IMEI inválido. Deve conter exatamente 15 dígitos.').optional(),
    operadora_numero: z.string().optional(),
    modalidade: z.enum(['CORPORATIVO', 'BYOD']).optional(),
    identificacao_extra: z.string().optional(),
    capacidade_armazenamento: z.string().optional(),
    quantidade_canais_resolucao: z.string().optional(),
  })
  .partial()

export const atualizarEquipamentoSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('ID do equipamento inválido.'),
  }),
  body: z.object({
    mestre: mestreAtualizarSchema.optional(),
    detalhe: detalheAtualizarSchema.optional(),
    interfaces: interfacesSchema,
  }),
})
