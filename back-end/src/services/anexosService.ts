import banco from '../database/conexao.js'

export interface DadosSalvarAnexo {
  equipamento_id: number
  nome_arquivo: string
  caminho_arquivo: string
  tipo_documento: string
}

export const salvarAnexo = (dados: DadosSalvarAnexo) => {
  const comando = banco.prepare(`
    INSERT INTO anexos (equipamento_id, nome_arquivo, caminho_arquivo, tipo_documento)
    VALUES (@equipamento_id, @nome_arquivo, @caminho_arquivo, @tipo_documento)
  `)

  const resultado = comando.run(dados)
  return resultado.lastInsertRowid
}
