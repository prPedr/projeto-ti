import banco from '../database/conexao.js'

const colunas = banco.prepare("PRAGMA table_info(opcoes_predefinidas)").all() as Array<{ name: string }>
const jaTemColuna = colunas.some((c) => c.name === 'tipo_equipamento')

if (jaTemColuna) {
  console.log('Coluna tipo_equipamento já existe. Nada a fazer.')
} else {
  console.log('Adicionando coluna tipo_equipamento...')
  banco.exec(`
    ALTER TABLE opcoes_predefinidas
    ADD COLUMN tipo_equipamento TEXT
    CHECK (tipo_equipamento IN ('COMPUTADOR', 'SWITCH', 'CELULAR', 'NVR_CAMERA'))
  `)

  // Dados existentes foram todos cadastrados antes dessa feature existir,
  // quando só se pensava em notebooks/desktops — retroativamente marcamos
  // como COMPUTADOR pra não ficarem "órfãos" (sem tipo, invisíveis nas
  // telas novas que filtram por tipo_equipamento).
  const resultado = banco
    .prepare("UPDATE opcoes_predefinidas SET tipo_equipamento = 'COMPUTADOR' WHERE tipo_equipamento IS NULL")
    .run()

  console.log(`Coluna adicionada. ${resultado.changes} registro(s) existente(s) marcado(s) como COMPUTADOR.`)
}

console.log('Migração concluída.')
