PRAGMA foreign_keys=off;

-- 1. Recriação da tabela opcoes_predefinidas para atualizar o CHECK constraint de tipo_equipamento.
-- Registros antigos com tipo_equipamento = 'NVR_CAMERA' são mapeados para 'NVR' para preservação de dados de teste.
CREATE TABLE opcoes_predefinidas_novo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT NOT NULL,
    valor TEXT NOT NULL,
    dependencia_id INTEGER DEFAULT NULL,
    tipo_equipamento TEXT CHECK (tipo_equipamento IN ('COMPUTADOR', 'SWITCH', 'CELULAR', 'NVR', 'CAMERA', 'IMPRESSORA', 'ANTENA')),
    UNIQUE(categoria, valor),
    FOREIGN KEY (dependencia_id) REFERENCES opcoes_predefinidas_novo(id) ON DELETE SET NULL
);

INSERT INTO opcoes_predefinidas_novo (id, categoria, valor, dependencia_id, tipo_equipamento)
SELECT 
    id, 
    categoria, 
    valor, 
    dependencia_id, 
    CASE WHEN tipo_equipamento = 'NVR_CAMERA' THEN 'NVR' ELSE tipo_equipamento END
FROM opcoes_predefinidas;

DROP TABLE opcoes_predefinidas;
ALTER TABLE opcoes_predefinidas_novo RENAME TO opcoes_predefinidas;

PRAGMA foreign_keys=on;

-- 2. Tabela para mapeamento de canais do NVR
CREATE TABLE IF NOT EXISTS canais_nvr (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nvr_id INTEGER NOT NULL,
    numero_canal INTEGER NOT NULL,
    camera_conectada_id INTEGER,
    descricao TEXT,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nvr_id) REFERENCES equipamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (camera_conectada_id) REFERENCES equipamentos(id) ON DELETE SET NULL,
    UNIQUE(nvr_id, numero_canal)
);

CREATE INDEX IF NOT EXISTS idx_canais_nvr_nvr_id ON canais_nvr(nvr_id);
