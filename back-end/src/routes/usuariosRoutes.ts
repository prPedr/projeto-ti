import { Router } from 'express'
import { criar, editar, listar, redefinirSenha } from '../controllers/usuariosController.js'
import { autenticar } from '../middlewares/authMiddleware.js'
import { exigirPerfil } from '../middlewares/autorizacaoMiddleware.js'
import { validarSchema } from '../middlewares/validacaoMiddleware.js'
import { criarUsuarioSchema, editarUsuarioSchema, redefinirSenhaSchema } from '../schemas/usuariosSchema.js'

const rotasUsuarios = Router()

rotasUsuarios.get('/', autenticar, exigirPerfil('ADMIN'), listar)
rotasUsuarios.post('/', autenticar, exigirPerfil('ADMIN'), validarSchema(criarUsuarioSchema), criar)
rotasUsuarios.put('/:id', autenticar, exigirPerfil('ADMIN'), validarSchema(editarUsuarioSchema), editar)
rotasUsuarios.put('/:id/senha', autenticar, exigirPerfil('ADMIN'), validarSchema(redefinirSenhaSchema), redefinirSenha)

export default rotasUsuarios
