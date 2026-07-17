import { Request, Response } from 'express'
import { listarEquipamentos } from '../services/equipamentosService.js'

export const listar = (requisicao: Request, resposta: Response) => {
  try {
    const equipamentos = listarEquipamentos()
    resposta.status(200).json({ sucesso: true, equipamentos })
  } catch (erro: any) {
    resposta.status(500).json({ sucesso: false, mensagem: erro.message })
  }
}
