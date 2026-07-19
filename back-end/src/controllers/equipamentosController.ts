import { Request, Response } from 'express'
import { z } from 'zod'
import { listarEquipamentosQuerySchema } from '../schemas/equipamentosSchema.js'
import { descartarEquipamento, FiltrosListagem, listarEquipamentos } from '../services/equipamentosService.js'

type DadosValidadosListagem = {
  query: z.infer<typeof listarEquipamentosQuerySchema>
}

interface ErroComStatus extends Error {
  statusCode?: number
}

const criarErro = (mensagem: string, statusCode: number): ErroComStatus => {
  const erro: ErroComStatus = new Error(mensagem)
  erro.statusCode = statusCode
  return erro
}

export const listar = (requisicao: Request, resposta: Response) => {
  const { pagina, limite, busca, status } = (requisicao.dadosValidados as DadosValidadosListagem).query

  const filtros: FiltrosListagem = {
    pagina,
    limite,
    ...(busca ? { busca } : {}),
    ...(status ? { status } : {}),
  }

  const { dados, metadados } = listarEquipamentos(filtros)
  resposta.status(200).json({ sucesso: true, dados, metadados })
}

export const descartar = (requisicao: Request, resposta: Response) => {
  const id = Number(requisicao.params.id)

  if (!requisicao.params.id || Number.isNaN(id)) {
    throw criarErro('ID do equipamento inválido.', 400)
  }

  const linhasAfetadas = descartarEquipamento(id, requisicao.usuarioId as number)

  if (linhasAfetadas === 0) {
    throw criarErro('Equipamento não encontrado.', 404)
  }

  resposta.status(200).json({ sucesso: true, mensagem: 'Equipamento descartado com sucesso e mantido no histórico' })
}
