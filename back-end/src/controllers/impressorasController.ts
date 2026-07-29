import { Request, Response } from 'express'
import { criarImpressora, listarComputadoresConectaveis } from '../services/impressorasService.js'

export const criar = (requisicao: Request, resposta: Response) => {
  requisicao.body.mestre.cadastrado_por = requisicao.usuarioId

  const id = criarImpressora(requisicao.body)
  resposta.status(201).json({ sucesso: true, id_equipamento: id })
}

export const listarConectaveis = (requisicao: Request, resposta: Response) => {
  const excluirIdParam = requisicao.query.excluirId
  const excluirId = excluirIdParam ? Number(excluirIdParam) || undefined : undefined

  const dados = listarComputadoresConectaveis(excluirId)
  resposta.status(200).json({ sucesso: true, dados })
}
