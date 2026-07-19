import { Request, Response } from 'express'
import { criarLocalizacao, listarLocalizacoes } from '../services/localizacoesService.js'

export const listar = (_requisicao: Request, resposta: Response) => {
  const localizacoes = listarLocalizacoes()
  resposta.status(200).json({ sucesso: true, localizacoes })
}

export const criar = (requisicao: Request, resposta: Response) => {
  const id = criarLocalizacao(requisicao.body)
  resposta.status(201).json({ sucesso: true, id })
}
