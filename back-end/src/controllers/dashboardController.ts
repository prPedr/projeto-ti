import { Request, Response } from 'express'
import { obterResumoDashboard } from '../services/dashboardService.js'

export const resumo = (_requisicao: Request, resposta: Response) => {
  const dados = obterResumoDashboard()
  resposta.status(200).json({ sucesso: true, ...dados })
}
