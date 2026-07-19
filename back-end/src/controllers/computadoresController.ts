import { Request, Response } from 'express'
import { criarComputador } from '../services/computadoresService.js'

export const criar = (requisicao: Request, resposta: Response) => {
  requisicao.body.mestre.cadastrado_por = requisicao.usuarioId

  const id = criarComputador(requisicao.body)
  resposta.status(201).json({ sucesso: true, id_equipamento: id })
}
