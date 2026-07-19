import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import banco from '../database/conexao.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'segredo_dev_trocar_em_producao'
const JWT_EXPIRA_EM = '8h'

interface UsuarioSistema {
  id: number
  email: string
  senha_hash: string
  perfil: string
  ativo: number
}

export interface ResultadoLogin {
  token: string
  usuario: {
    id: number
    email: string
    perfil: string
  }
}

// Erro com status HTTP anexado, lido pelo tratadorDeErros global (middlewares/errorHandler.ts)
export class ErroAutenticacao extends Error {
  statusCode: number

  constructor(mensagem: string, statusCode: number) {
    super(mensagem)
    this.name = 'ErroAutenticacao'
    this.statusCode = statusCode
  }
}

export const realizarLogin = async (email: string, senha: string): Promise<ResultadoLogin> => {
  const usuario = banco
    .prepare('SELECT id, email, senha_hash, perfil, ativo FROM usuarios_sistema WHERE email = ?')
    .get(email) as UsuarioSistema | undefined

  if (!usuario) {
    throw new ErroAutenticacao('Usuário não encontrado.', 404)
  }

  if (!usuario.ativo) {
    throw new ErroAutenticacao('Usuário inativo.', 403)
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash)

  if (!senhaCorreta) {
    throw new ErroAutenticacao('Senha incorreta.', 401)
  }

  const token = jwt.sign({ id: usuario.id, perfil: usuario.perfil }, JWT_SECRET, {
    expiresIn: JWT_EXPIRA_EM,
  })

  return {
    token,
    usuario: {
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    },
  }
}
