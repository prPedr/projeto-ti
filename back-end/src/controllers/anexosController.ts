import { Request, Response } from 'express'
import { salvarAnexo } from '../services/anexosService.js'

interface ErroComStatus extends Error {
  statusCode?: number
}

const criarErro = (mensagem: string, statusCode: number): ErroComStatus => {
  const erro: ErroComStatus = new Error(mensagem)
  erro.statusCode = statusCode
  return erro
}

const tiposDocumentoValidos = ['NOTA_FISCAL', 'TERMO_RESPONSABILIDADE', 'CONTRATO', 'OUTRO']

export const uploadAnexo = (requisicao: Request, resposta: Response) => {
  const equipamentoId = Number(requisicao.params.id)

  if (!requisicao.params.id || Number.isNaN(equipamentoId)) {
    throw criarErro('ID do equipamento inválido.', 400)
  }

  if (!requisicao.file) {
    throw criarErro('Nenhum arquivo enviado.', 400)
  }

  const { tipo_documento: tipoDocumento } = requisicao.body

  if (!tipoDocumento || !tiposDocumentoValidos.includes(tipoDocumento)) {
    throw criarErro(`Campo tipo_documento inválido. Valores aceitos: ${tiposDocumentoValidos.join(', ')}.`, 400)
  }

  const idAnexo = salvarAnexo({
    equipamento_id: equipamentoId,
    nome_arquivo: requisicao.file.originalname,
    caminho_arquivo: requisicao.file.path,
    tipo_documento: tipoDocumento,
  })

  resposta.status(201).json({
    sucesso: true,
    anexo: {
      id: idAnexo,
      equipamento_id: equipamentoId,
      nome_arquivo: requisicao.file.originalname,
      caminho_arquivo: requisicao.file.path,
      tipo_documento: tipoDocumento,
    },
  })
}
