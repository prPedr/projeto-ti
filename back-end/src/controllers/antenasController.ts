import { Request, Response } from 'express'
import { criarAntena } from '../services/antenasService.js'

export const criar = (requisicao: Request, resposta: Response) => {
  requisicao.body.mestre.cadastrado_por = requisicao.usuarioId

  const id = criarAntena(requisicao.body)
  resposta.status(201).json({ sucesso: true, id_equipamento: id })
}
