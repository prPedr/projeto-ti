import { Request, Response } from 'express'
import { criarNvr, listarNvrs } from '../services/nvrsService.js'
import {
  listarCanaisNvr,
  atualizarCanal as atualizarCanalService,
  listarCamerasConectaveis,
} from '../services/canaisNvrService.js'
import type {
  AtualizarCanalParams,
  AtualizarCanalBody,
  ListarCanaisParams,
} from '../schemas/canaisNvrSchema.js'

// ─── NVR ───────────────────────────────────────────────────────────────────

export const criar = (requisicao: Request, resposta: Response) => {
  requisicao.body.mestre.cadastrado_por = requisicao.usuarioId

  const id = criarNvr(requisicao.body)
  resposta.status(201).json({ sucesso: true, id_equipamento: id })
}

export const listar = (_requisicao: Request, resposta: Response) => {
  const dados = listarNvrs()
  resposta.status(200).json({ sucesso: true, dados })
}

export const listarConectaveis = (requisicao: Request, resposta: Response) => {
  const excluirIdParam = requisicao.query.excluirId
  const excluirId = excluirIdParam ? Number(excluirIdParam) || undefined : undefined

  const dados = listarCamerasConectaveis(excluirId)
  resposta.status(200).json({ sucesso: true, dados })
}

// ─── Canais do NVR ─────────────────────────────────────────────────────────

export const listarCanais = (requisicao: Request, resposta: Response) => {
  const { id } = (requisicao.dadosValidados as { params: ListarCanaisParams }).params

  const dados = listarCanaisNvr(id)
  resposta.status(200).json({ sucesso: true, dados })
}

export const atualizarCanal = (requisicao: Request, resposta: Response) => {
  const { params, body } = requisicao.dadosValidados as {
    params: AtualizarCanalParams
    body: AtualizarCanalBody
  }

  atualizarCanalService(params.id, params.numeroCanal, body)
  resposta.status(200).json({ sucesso: true, mensagem: 'Canal atualizado com sucesso.' })
}
