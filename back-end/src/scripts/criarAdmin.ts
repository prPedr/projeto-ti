import bcrypt from 'bcrypt'
import banco from '../database/conexao.js'

const NOME = 'Administrador'
const envEmail = process.env.ADMIN_EMAIL
const envSenha = process.env.ADMIN_SENHA

if (!envEmail || !envSenha) {
  console.warn(
    'ADMIN_EMAIL/ADMIN_SENHA não definidos — usando credenciais padrão INSEGURAS. Defina essas variáveis antes de rodar em produção.',
  )
}

const EMAIL = envEmail || 'admin@admin.com'
const SENHA = envSenha || 'admin123'
const PERFIL = 'ADMIN'

;(async () => {
  try {
    if (SENHA.length < 8) {
      console.error('Erro: A senha do administrador deve ter no mínimo 8 caracteres.')
      return
    }

    const senhaHash = bcrypt.hashSync(SENHA, 10)

    banco
      .prepare(
        'INSERT INTO usuarios_sistema (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, ?, ?)',
      )
      .run(NOME, EMAIL, senhaHash, PERFIL, 1)

    console.log(`Usuário administrador criado com sucesso: ${EMAIL}`)
  } catch (erro) {
    if (erro instanceof Error && erro.message.includes('UNIQUE constraint failed')) {
      console.error(`Já existe um usuário cadastrado com o e-mail "${EMAIL}".`)
    } else {
      console.error('Erro ao criar usuário administrador:', erro)
    }
  }
})()
