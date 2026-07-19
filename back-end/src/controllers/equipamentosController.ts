import { Request, Response } from 'express'
import { FiltrosListagem, listarEquipamentos } from '../services/equipamentosService.js'

export const listar = (requisicao: Request, resposta: Response) => {
  const { pagina, limite, busca, status } = requisicao.query

  const filtros: FiltrosListagem = {
    pagina: pagina ? Number(pagina) : 1,
    limite: limite ? Number(limite) : 20,
    ...(typeof busca === 'string' ? { busca } : {}),
    ...(typeof status === 'string' ? { status } : {}),
  }

  const resultado = listarEquipamentos(filtros)
  resposta.status(200).json({ sucesso: true, ...resultado })
}
