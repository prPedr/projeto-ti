import { Request, Response } from 'express'
import { realizarLogin } from '../services/authService.js'

export const login = async (requisicao: Request, resposta: Response) => {
  const { email, senha } = requisicao.body

  const { token, usuario } = await realizarLogin(email, senha)

  resposta.status(200).json({ sucesso: true, token, usuario })
}
