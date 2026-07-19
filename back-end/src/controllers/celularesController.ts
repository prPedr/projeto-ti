import { Request, Response } from 'express'
import { criarCelular } from '../services/celularesService.js'

export const criar = (requisicao: Request, resposta: Response) => {
  requisicao.body.mestre.cadastrado_por = requisicao.usuarioId

  const id = criarCelular(requisicao.body)
  resposta.status(201).json({ sucesso: true, id_equipamento: id })
}
