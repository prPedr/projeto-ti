import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'segredo_dev_trocar_em_producao'

interface PayloadToken {
  id: number
  perfil: string
}

declare global {
  namespace Express {
    interface Request {
      usuarioId?: number
    }
  }
}

export const autenticar = (requisicao: Request, resposta: Response, proximo: NextFunction) => {
  const cabecalhoAutorizacao = requisicao.headers.authorization

  if (!cabecalhoAutorizacao || !cabecalhoAutorizacao.startsWith('Bearer ')) {
    resposta.status(401).json({ sucesso: false, mensagem: 'Token não fornecido.' })
    return
  }

  const token = cabecalhoAutorizacao.slice('Bearer '.length).trim()

  if (!token) {
    resposta.status(401).json({ sucesso: false, mensagem: 'Token não fornecido.' })
    return
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as PayloadToken
    requisicao.usuarioId = payload.id
    proximo()
  } catch (erro) {
    if (erro instanceof jwt.TokenExpiredError) {
      resposta.status(401).json({ sucesso: false, mensagem: 'Token expirado. Faça login novamente.' })
      return
    }

    resposta.status(401).json({ sucesso: false, mensagem: 'Token inválido.' })
  }
}
