import path from 'path'
import banco from '../database/conexao.js'

export interface DadosSalvarAnexo {
  equipamento_id: number
  nome_arquivo: string
  caminho_arquivo: string
  tipo_documento: string
}

export interface AnexoItem {
  id: number
  nome_arquivo: string
  tipo_documento: string
  data_upload: string
  url_download: string
}

export const salvarAnexo = (dados: DadosSalvarAnexo) => {
  const comando = banco.prepare(`
    INSERT INTO anexos (equipamento_id, nome_arquivo, caminho_arquivo, tipo_documento)
    VALUES (@equipamento_id, @nome_arquivo, @caminho_arquivo, @tipo_documento)
  `)

  const resultado = comando.run(dados)
  return resultado.lastInsertRowid
}

export const listarAnexosPorEquipamento = (equipamentoId: number): AnexoItem[] => {
  const anexos = banco
    .prepare(
      'SELECT id, nome_arquivo, caminho_arquivo, tipo_documento, data_upload FROM anexos WHERE equipamento_id = ? ORDER BY data_upload DESC'
    )
    .all(equipamentoId) as any[]

  return anexos.map((a) => ({
    id: a.id,
    nome_arquivo: a.nome_arquivo,
    tipo_documento: a.tipo_documento,
    data_upload: a.data_upload,
    url_download: `/uploads/${path.basename(a.caminho_arquivo)}`,
  }))
}
