import { Request, Response } from 'express'
import { z } from 'zod'
import { listarLocalizacoesQuerySchema } from '../schemas/localizacoesSchema.js'
import { criarLocalizacao, FiltrosListagemLocalizacoes, listarLocalizacoes } from '../services/localizacoesService.js'

type DadosValidadosListagem = {
  query: z.infer<typeof listarLocalizacoesQuerySchema>
}

export const listar = (requisicao: Request, resposta: Response) => {
  const { pagina, limite, busca } = (requisicao.dadosValidados as DadosValidadosListagem).query

  const filtros: FiltrosListagemLocalizacoes = {
    pagina,
    limite,
    ...(busca ? { busca } : {}),
  }

  const { dados, metadados } = listarLocalizacoes(filtros)
  resposta.status(200).json({ sucesso: true, dados, metadados })
}

export const criar = (requisicao: Request, resposta: Response) => {
  const id = criarLocalizacao(requisicao.body)
  resposta.status(201).json({ sucesso: true, id })
}
