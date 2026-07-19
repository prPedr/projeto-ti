import bcrypt from 'bcrypt'
import banco from '../database/conexao.js'

const NOME = 'Administrador'
const EMAIL = 'admin@admin.com'
const SENHA = 'admin123'
const PERFIL = 'ADMIN'

;(async () => {
  try {
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
