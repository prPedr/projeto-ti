import { NextFunction, Request, Response } from 'express'

export const exigirPerfil = (...perfisPermitidos: string[]) => {
  return (requisicao: Request, resposta: Response, proximo: NextFunction) => {
    if (!requisicao.usuarioPerfil || !perfisPermitidos.includes(requisicao.usuarioPerfil)) {
      resposta.status(403).json({ sucesso: false, mensagem: 'Acesso negado: perfil insuficiente.' })
      return
    }
    proximo()
  }
}
