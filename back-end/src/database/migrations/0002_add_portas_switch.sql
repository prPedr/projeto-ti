CREATE TABLE IF NOT EXISTS portas_switch (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    switch_id INTEGER NOT NULL,
    numero_porta INTEGER NOT NULL,
    equipamento_conectado_id INTEGER,
    descricao TEXT,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (switch_id) REFERENCES equipamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (equipamento_conectado_id) REFERENCES equipamentos(id) ON DELETE SET NULL,
    UNIQUE(switch_id, numero_porta)
);

CREATE INDEX IF NOT EXISTS idx_portas_switch_switch_id ON portas_switch(switch_id);
