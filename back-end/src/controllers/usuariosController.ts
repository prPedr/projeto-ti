import { Request, Response } from 'express'
import { z } from 'zod'
import { criarUsuarioSchema, editarUsuarioSchema, redefinirSenhaSchema } from '../schemas/usuariosSchema.js'
import {
  criarUsuario,
  editarUsuario,
  listarUsuarios,
  redefinirSenha as redefinirSenhaService,
} from '../services/usuariosService.js'

type DadosValidadosCriacao = z.infer<typeof criarUsuarioSchema>
type DadosValidadosEdicao = z.infer<typeof editarUsuarioSchema>
type DadosValidadosSenha = z.infer<typeof redefinirSenhaSchema>

interface ErroComStatus extends Error {
  statusCode?: number
}

const criarErro = (mensagem: string, statusCode: number): ErroComStatus => {
  const erro: ErroComStatus = new Error(mensagem)
  erro.statusCode = statusCode
  return erro
}

export const listar = (_requisicao: Request, resposta: Response) => {
  const dados = listarUsuarios()
  resposta.status(200).json({ sucesso: true, dados })
}

export const criar = (requisicao: Request, resposta: Response) => {
  const { body } = requisicao.dadosValidados as DadosValidadosCriacao
  const id = criarUsuario(body)
  resposta.status(201).json({ sucesso: true, id })
}

export const editar = (requisicao: Request, resposta: Response) => {
  const { params, body } = requisicao.dadosValidados as DadosValidadosEdicao

  const eOProprioUsuario = params.id === requisicao.usuarioId
  const tentandoRemoverProprioAcesso =
    (body.perfil !== undefined && body.perfil !== 'ADMIN') || body.ativo === false

  if (eOProprioUsuario && tentandoRemoverProprioAcesso) {
    throw criarErro('Você não pode remover seu próprio acesso de administrador.', 400)
  }

  editarUsuario(params.id, body)
  resposta.status(200).json({ sucesso: true, mensagem: 'Usuário atualizado com sucesso.' })
}

export const redefinirSenha = (requisicao: Request, resposta: Response) => {
  const { params, body } = requisicao.dadosValidados as DadosValidadosSenha
  redefinirSenhaService(params.id, body.senha)
  resposta.status(200).json({ sucesso: true, mensagem: 'Senha redefinida com sucesso.' })
}
