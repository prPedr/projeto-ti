PRAGMA foreign_keys=off;

CREATE TABLE equipamentos_novo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT NOT NULL CHECK (categoria IN ('COMPUTADOR', 'SWITCH', 'CELULAR', 'NVR', 'CAMERA', 'IMPRESSORA', 'ANTENA')),
    nome TEXT,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ATIVO', 'ESTOQUE', 'MANUTENCAO', 'DESCARTADO')),
    localizacao_id INTEGER,
    fornecedor TEXT,
    data_garantia DATE,
    observacao TEXT,
    cadastrado_por INTEGER NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_descarte DATETIME DEFAULT NULL,
    FOREIGN KEY (localizacao_id) REFERENCES localizacoes(id) ON DELETE SET NULL,
    FOREIGN KEY (cadastrado_por) REFERENCES usuarios_sistema(id)
);

INSERT INTO equipamentos_novo (
    id, categoria, nome, marca, modelo, status, localizacao_id,
    fornecedor, data_garantia, observacao, cadastrado_por, data_cadastro, data_descarte
)
SELECT
    id, categoria, nome, marca, modelo, status, localizacao_id,
    fornecedor, data_garantia, observacao, cadastrado_por, data_cadastro, data_descarte
FROM equipamentos;

DROP TABLE equipamentos;
ALTER TABLE equipamentos_novo RENAME TO equipamentos;

PRAGMA foreign_keys=on;
