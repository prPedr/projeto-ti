import { Request, Response } from 'express'
import { listarEquipamentos } from '../services/equipamentosService.js'

export const listar = (requisicao: Request, resposta: Response) => {
  const equipamentos = listarEquipamentos()
  resposta.status(200).json({ sucesso: true, equipamentos })
}
