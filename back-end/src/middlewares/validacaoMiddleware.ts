import { NextFunction, Request, Response } from 'express'
import { z, ZodError } from 'zod'

export const validarSchema = (schema: z.ZodType) => {
  return async (requisicao: Request, resposta: Response, proximo: NextFunction) => {
    try {
      await schema.parseAsync({
        body: requisicao.body,
        query: requisicao.query,
        params: requisicao.params,
      })

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
