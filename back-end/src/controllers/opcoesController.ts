import { Request, Response } from 'express'
import { z } from 'zod'
import { listarOpcoesQuerySchema } from '../schemas/opcoesSchema.js'
import { adicionarOpcao, listarOpcoes } from '../services/opcoesService.js'

type DadosValidadosListagem = {
  query: z.infer<typeof listarOpcoesQuerySchema>
}

export const listar = (requisicao: Request, resposta: Response) => {
  const { categoria } = (requisicao.dadosValidados as DadosValidadosListagem).query

  const dados = listarOpcoes(categoria)
  resposta.status(200).json({ sucesso: true, dados })
}

export const criar = (requisicao: Request, resposta: Response) => {
  const { categoria, valor } = requisicao.body

  const id = adicionarOpcao(categoria, valor)
  resposta.status(201).json({ sucesso: true, id })
}
