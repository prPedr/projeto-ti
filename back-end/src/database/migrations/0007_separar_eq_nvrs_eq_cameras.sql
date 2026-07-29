PRAGMA foreign_keys=off;

-- 0. Garantir existência da tabela legada eq_cftv para compatibilidade com execuções de testes em bancos sintéticos
CREATE TABLE IF NOT EXISTS eq_cftv (
    equipamento_id INTEGER PRIMARY KEY,
    identificacao_extra TEXT,
    capacidade_armazenamento TEXT,
    quantidade_canais_resolucao TEXT,
    firmware TEXT
);

-- 1. Criar tabela de detalhe específica para NVRs
CREATE TABLE IF NOT EXISTS eq_nvrs (
    equipamento_id INTEGER PRIMARY KEY,
    quantidade_canais INTEGER,
    capacidade_armazenamento TEXT,
    firmware TEXT,
    identificacao_extra TEXT,
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

-- 2. Criar tabela de detalhe específica para Câmeras
CREATE TABLE IF NOT EXISTS eq_cameras (
    equipamento_id INTEGER PRIMARY KEY,
    resolucao TEXT,
    firmware TEXT,
    identificacao_extra TEXT,
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

-- 3. Migrar dados da tabela compartilhada eq_cftv (se houver registros antigos)
INSERT INTO eq_nvrs (equipamento_id, quantidade_canais, capacidade_armazenamento, firmware, identificacao_extra)
SELECT 
    c.equipamento_id,
    CAST(c.quantidade_canais_resolucao AS INTEGER),
    c.capacidade_armazenamento,
    c.firmware,
    c.identificacao_extra
FROM eq_cftv c
JOIN equipamentos e ON e.id = c.equipamento_id
WHERE e.categoria = 'NVR';

INSERT INTO eq_cameras (equipamento_id, resolucao, firmware, identificacao_extra)
SELECT 
    c.equipamento_id,
    c.quantidade_canais_resolucao,
    c.firmware,
    c.identificacao_extra
FROM eq_cftv c
JOIN equipamentos e ON e.id = c.equipamento_id
WHERE e.categoria = 'CAMERA';

-- 4. Remover tabela eq_cftv legada
DROP TABLE IF EXISTS eq_cftv;

PRAGMA foreign_keys=on;
