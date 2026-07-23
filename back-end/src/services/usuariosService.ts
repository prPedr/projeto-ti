import bcrypt from 'bcrypt'
import banco from '../database/conexao.js'

// Precedente real no código: scripts/criarAdmin.ts usa bcrypt.hashSync(SENHA, 10).
// authService.ts não define saltRounds próprio (só faz bcrypt.compare no login).
const SALT_ROUNDS = 10

export interface UsuarioListado {
  id: number
  nome: string
  email: string
  perfil: string
  ativo: number
}

export const listarUsuarios = (): UsuarioListado[] => {
  return banco
    .prepare('SELECT id, nome, email, perfil, ativo FROM usuarios_sistema ORDER BY nome')
    .all() as UsuarioListado[]
}

export interface DadosCriacaoUsuario {
  nome: string
  email: string
  senha: string
  perfil: string
}

export const criarUsuario = (dados: DadosCriacaoUsuario): number => {
  const senhaHash = bcrypt.hashSync(dados.senha, SALT_ROUNDS)

  const resultado = banco
    .prepare(
      'INSERT INTO usuarios_sistema (nome, email, senha_hash, perfil) VALUES (@nome, @email, @senha_hash, @perfil)',
    )
    .run({ nome: dados.nome, email: dados.email, senha_hash: senhaHash, perfil: dados.perfil })

  return resultado.lastInsertRowid as number
}

// Whitelist de colunas editáveis — mesmo padrão de defesa em profundidade
// usado em equipamentosService.ts (atualizarEquipamento), mesmo só ADMIN
// podendo chamar essa rota.
const COLUNAS_PERMITIDAS = ['nome', 'perfil', 'ativo']

export interface DadosEdicaoUsuario {
  nome?: string | undefined
  perfil?: string | undefined
  ativo?: boolean | undefined
}

export const editarUsuario = (id: number, dados: DadosEdicaoUsuario): void => {
  const chaves = Object.keys(dados).filter((chave) => COLUNAS_PERMITIDAS.includes(chave))

  if (chaves.length === 0) {
    return
  }

  const set = chaves.map((chave) => `${chave} = ?`).join(', ')
  const valores = chaves.map((chave) => {
    const valor = (dados as Record<string, unknown>)[chave]
    return typeof valor === 'boolean' ? (valor ? 1 : 0) : valor
  })

  banco.prepare(`UPDATE usuarios_sistema SET ${set} WHERE id = ?`).run(...valores, id)
}

export const redefinirSenha = (id: number, novaSenha: string): void => {
  const senhaHash = bcrypt.hashSync(novaSenha, SALT_ROUNDS)
  banco.prepare('UPDATE usuarios_sistema SET senha_hash = ? WHERE id = ?').run(senhaHash, id)
}
