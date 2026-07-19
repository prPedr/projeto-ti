import { Request, Response } from 'express'
import { criarSwitch } from '../services/switchesService.js'

export const criar = (requisicao: Request, resposta: Response) => {
  requisicao.body.mestre.cadastrado_por = requisicao.usuarioId

  const id = criarSwitch(requisicao.body)
  resposta.status(201).json({ sucesso: true, id_equipamento: id })
}
