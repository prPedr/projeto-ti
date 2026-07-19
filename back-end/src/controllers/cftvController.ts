import { Request, Response } from 'express'
import { criarCftv } from '../services/cftvService.js'

export const criar = (requisicao: Request, resposta: Response) => {
  requisicao.body.mestre.cadastrado_por = requisicao.usuarioId

  const id = criarCftv(requisicao.body)
  resposta.status(201).json({ sucesso: true, id_equipamento: id })
}
