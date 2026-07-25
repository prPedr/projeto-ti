import { Request, Response } from 'express'
import { criarSwitch, listarSwitches } from '../services/switchesService.js'
import {
  listarPortasSwitch,
  atualizarPorta as atualizarPortaService,
} from '../services/portasSwitchService.js'
import type {
  AtualizarPortaParams,
  AtualizarPortaBody,
  ListarPortasParams,
} from '../schemas/portasSwitchSchema.js'

// ─── Switch ───────────────────────────────────────────────────────────────────

export const criar = (requisicao: Request, resposta: Response) => {
  requisicao.body.mestre.cadastrado_por = requisicao.usuarioId

  const id = criarSwitch(requisicao.body)
  resposta.status(201).json({ sucesso: true, id_equipamento: id })
}

export const listar = (_requisicao: Request, resposta: Response) => {
  const dados = listarSwitches()
  resposta.status(200).json({ sucesso: true, dados })
}

// ─── Portas do switch ─────────────────────────────────────────────────────────

export const listarPortas = (requisicao: Request, resposta: Response) => {
  const { id } = (requisicao.dadosValidados as { params: ListarPortasParams }).params

  const dados = listarPortasSwitch(id)
  resposta.status(200).json({ sucesso: true, dados })
}

export const atualizarPorta = (requisicao: Request, resposta: Response) => {
  const { params, body } = requisicao.dadosValidados as {
    params: AtualizarPortaParams
    body: AtualizarPortaBody
  }

  atualizarPortaService(params.id, params.numeroPorta, body)
  resposta.status(200).json({ sucesso: true, mensagem: 'Porta atualizada com sucesso.' })
}
