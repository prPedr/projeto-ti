import { NextFunction, Request, Response } from 'express'

interface ErroComCodigoSqlite extends Error {
  code?: string
  statusCode?: number
}

// Códigos estendidos que o better-sqlite3/SQLite retornam em violações de constraint
const mensagensPorCodigoSqlite: Record<string, string> = {
  SQLITE_CONSTRAINT_FOREIGNKEY: 'Referência inválida: o registro relacionado (localização, usuário ou equipamento) não existe.',
  SQLITE_CONSTRAINT_UNIQUE: 'Já existe um registro com esse valor único cadastrado.',
  SQLITE_CONSTRAINT_NOTNULL: 'Um campo obrigatório não foi preenchido.',
  SQLITE_CONSTRAINT_CHECK: 'Um dos valores enviados não é permitido para este campo.',
  SQLITE_CONSTRAINT_PRIMARYKEY: 'Registro duplicado: essa chave primária já existe.',
}

const traduzirErroSqlite = (codigo: string): string => {
  return mensagensPorCodigoSqlite[codigo] ?? 'Erro ao acessar o banco de dados.'
}

// Middleware global de tratamento de erros. Precisa dos 4 parâmetros para o
// Express reconhecê-lo como error handler (mesmo sem usar 'proximo' no corpo).
export const tratadorDeErros = (
  erro: ErroComCodigoSqlite,
  _requisicao: Request,
  resposta: Response,
  proximo: NextFunction
) => {
  if (resposta.headersSent) {
    return proximo(erro)
  }

  console.error(erro)

  if (erro.code?.startsWith('SQLITE_')) {
    resposta.status(400).json({
      sucesso: false,
      mensagem: traduzirErroSqlite(erro.code),
    })
    return
  }

  resposta.status(erro.statusCode ?? 400).json({
    sucesso: false,
    mensagem: erro.message || 'Ocorreu um erro inesperado.',
  })
}
