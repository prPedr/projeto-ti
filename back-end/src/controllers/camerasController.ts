import { Request, Response } from 'express'
import { criarCamera } from '../services/camerasService.js'

export const criar = (requisicao: Request, resposta: Response) => {
  requisicao.body.mestre.cadastrado_por = requisicao.usuarioId

  const id = criarCamera(requisicao.body)
  resposta.status(201).json({ sucesso: true, id_equipamento: id })
}
