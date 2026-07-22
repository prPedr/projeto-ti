import { Request, Response } from 'express'
import { z } from 'zod'
import { listarOpcoesQuerySchema } from '../schemas/opcoesSchema.js'
import { adicionarOpcao, editarOpcao, excluirOpcao, listarOpcoes } from '../services/opcoesService.js'

type DadosValidadosListagem = {
  query: z.infer<typeof listarOpcoesQuerySchema>
}

export const listar = (requisicao: Request, resposta: Response) => {
  const { categoria, tipo_equipamento } = (requisicao.dadosValidados as DadosValidadosListagem).query

  const dados = listarOpcoes(categoria, tipo_equipamento)
  resposta.status(200).json({ sucesso: true, dados })
}

export const criar = (requisicao: Request, resposta: Response) => {
  const { categoria, valor, dependencia_id, tipo_equipamento } = requisicao.body

  const id = adicionarOpcao(categoria, valor, dependencia_id, tipo_equipamento)
  resposta.status(201).json({ sucesso: true, id })
}

export const editar = (requisicao: Request, resposta: Response) => {
  const id = Number(requisicao.params.id)
  const { valor } = requisicao.body

  if (!valor || typeof valor !== 'string' || valor.trim().length === 0) {
    resposta.status(400).json({ sucesso: false, mensagem: 'O campo "valor" é obrigatório.' })
    return
  }

  const alterados = editarOpcao(id, valor.trim())

  if (alterados === 0) {
    resposta.status(404).json({ sucesso: false, mensagem: 'Opção não encontrada.' })
    return
  }

  resposta.status(200).json({ sucesso: true, mensagem: 'Opção atualizada com sucesso.' })
}

export const excluir = (requisicao: Request, resposta: Response) => {
  const id = Number(requisicao.params.id)

  const removidos = excluirOpcao(id)

  if (removidos === 0) {
    resposta.status(404).json({ sucesso: false, mensagem: 'Opção não encontrada.' })
    return
  }

  resposta.status(200).json({ sucesso: true, mensagem: 'Opção excluída com sucesso.' })
}
