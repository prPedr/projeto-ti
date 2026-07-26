import { NextFunction, Request, Response } from 'express'
import multer from 'multer'

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

const extrairTabelaColuna = (mensagemBruta: string): { tabela: string; coluna: string } | null => {
  const match = mensagemBruta.match(/UNIQUE constraint failed: (\w+)\.(\w+)/)
  if (!match) return null
  return { tabela: match[1], coluna: match[2] }
}

const mensagensPorColuna: Record<string, string> = {
  'interfaces_rede.ip': 'Este endereço IP já está cadastrado em outro equipamento.',
  'interfaces_rede.mac': 'Este endereço MAC já está cadastrado em outro equipamento.',
  'usuarios_sistema.email': 'Já existe um usuário cadastrado com este e-mail.',
  'opcoes_predefinidas.valor': 'Esse valor já está cadastrado nessa categoria.',
  'eq_celulares.imei': 'Este IMEI já está cadastrado em outro equipamento.',
  'portas_switch.numero_porta': 'Esta porta já está cadastrada para este switch.',
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

  if ((erro as any).code === 'LIMIT_FILE_SIZE' || erro instanceof multer.MulterError) {
    resposta.status(400).json({
      sucesso: false,
      mensagem: 'Arquivo muito grande. Tamanho máximo permitido: 10MB.',
    })
    return
  }

  if (erro.code?.startsWith('SQLITE_')) {
    if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE' && erro.message) {
      const info = extrairTabelaColuna(erro.message)
      if (info) {
        const { tabela, coluna } = info
        resposta.status(400).json({
          sucesso: false,
          mensagem: mensagensPorColuna[`${tabela}.${coluna}`] ?? traduzirErroSqlite(erro.code),
          campo: coluna,
        })
        return
      }
    }

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
