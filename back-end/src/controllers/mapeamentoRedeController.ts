import { Request, Response } from 'express'
import { listarInterfacesRede, listarSwitches as listarSwitchesService } from '../services/mapeamentoRedeService.js'

export const listar = (requisicao: Request, resposta: Response) => {
  const subrede = typeof requisicao.query.subrede === 'string' ? requisicao.query.subrede : undefined
  const dados = listarInterfacesRede(subrede)
  resposta.status(200).json({ sucesso: true, dados })
}

export const listarSwitches = (_requisicao: Request, resposta: Response) => {
  const dados = listarSwitchesService()
  resposta.status(200).json({ sucesso: true, dados })
}
