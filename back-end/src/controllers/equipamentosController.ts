import { Request, Response } from 'express'
import { z } from 'zod'
import { listarEquipamentosQuerySchema } from '../schemas/equipamentosSchema.js'
import { FiltrosListagem, listarEquipamentos } from '../services/equipamentosService.js'

type DadosValidadosListagem = {
  query: z.infer<typeof listarEquipamentosQuerySchema>
}

export const listar = (requisicao: Request, resposta: Response) => {
  const { pagina, limite, busca, status } = (requisicao.dadosValidados as DadosValidadosListagem).query

  const filtros: FiltrosListagem = {
    pagina,
    limite,
    ...(busca ? { busca } : {}),
    ...(status ? { status } : {}),
  }

  const { dados, metadados } = listarEquipamentos(filtros)
  resposta.status(200).json({ sucesso: true, dados, metadados })
}
