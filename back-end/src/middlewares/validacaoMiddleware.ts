import { NextFunction, Request, Response } from 'express'
import { z, ZodError } from 'zod'

// O Express 5 expõe req.query/req.params como getters somente-leitura (lançam
// TypeError ao tentar reatribuir em modo estrito/ESM), então o resultado já
// convertido pelo Zod (com coerções e defaults aplicados) fica aqui em vez de
// sobrescrever req.query/req.body/req.params.
declare global {
  namespace Express {
    interface Request {
      dadosValidados?: unknown
    }
  }
}

export const validarSchema = (schema: z.ZodType) => {
  return async (requisicao: Request, resposta: Response, proximo: NextFunction) => {
    try {
      const dados = await schema.parseAsync({
        body: requisicao.body,
        query: requisicao.query,
        params: requisicao.params,
      })

      requisicao.dadosValidados = dados
      proximo()
    } catch (erro) {
      if (erro instanceof ZodError) {
        const erros = erro.issues.map((issue) => ({
          campo: issue.path.join('.'),
          mensagem: issue.message,
        }))

        resposta.status(400).json({ sucesso: false, erros })
        return
      }

      proximo(erro)
    }
  }
}
