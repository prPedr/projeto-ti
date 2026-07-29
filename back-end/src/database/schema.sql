-- Habilitar chaves estrangeiras no SQLite (necessário rodar na conexão da aplicação)
PRAGMA foreign_keys = ON;
-- Recomendação de performance para o SQLite
PRAGMA journal_mode = WAL;

-- ==========================================
-- TABELAS DE APOIO
-- ==========================================

CREATE TABLE usuarios_sistema (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK (perfil IN ('ADMIN', 'TECNICO', 'LEITURA')),
    ativo BOOLEAN DEFAULT 1,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE localizacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filial TEXT NOT NULL,
    predio TEXT,
    sala TEXT,
    descricao TEXT
);

-- "Dicionário de dados": opções pré-definidas para popular selects do front-end
-- (ex: categoria='MARCA', valor='Dell'), evitando digitação livre repetida.
CREATE TABLE opcoes_predefinidas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT NOT NULL,
    valor TEXT NOT NULL,
    dependencia_id INTEGER DEFAULT NULL,
    tipo_equipamento TEXT CHECK (tipo_equipamento IN ('COMPUTADOR', 'SWITCH', 'CELULAR', 'NVR', 'CAMERA', 'IMPRESSORA', 'ANTENA')),
    UNIQUE(categoria, valor),
    FOREIGN KEY (dependencia_id) REFERENCES opcoes_predefinidas(id) ON DELETE SET NULL
);

-- ==========================================
-- TABELA MESTRE
-- ==========================================

CREATE TABLE equipamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT NOT NULL CHECK (categoria IN ('COMPUTADOR', 'SWITCH', 'CELULAR', 'NVR', 'CAMERA', 'IMPRESSORA', 'ANTENA')),
    nome TEXT, -- Opcional, celulares podem não ter um nome amigável
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

-- ==========================================
-- GESTÃO DE REDE (TRAVA DE DUPLICIDADE IP/MAC)
-- ==========================================

CREATE TABLE interfaces_rede (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipamento_id INTEGER NOT NULL,
    nome_interface TEXT NOT NULL, -- Ex: 'LAN 1', 'Wi-Fi', 'Principal'
    ip TEXT UNIQUE,  -- UNIQUE garante a trava global exigida pelo firewall
    mac TEXT UNIQUE, -- UNIQUE garante a trava global exigida pelo firewall
    
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

-- ==========================================
-- TABELAS DE DETALHE (Por Categoria)
-- ==========================================

-- 1. Notebooks e Desktops
CREATE TABLE eq_computadores (
    equipamento_id INTEGER PRIMARY KEY,
    usuario_alocado TEXT,
    tag_patrimonio TEXT,
    numero_serie TEXT,
    processador TEXT,
    memoria TEXT, -- Ex: '16GB DDR4'
    armazenamento TEXT, -- Ex: '512GB NVMe'
    sistema_operacional TEXT,
    antivirus_instalado BOOLEAN DEFAULT 0,
    
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

-- 2. Switches
CREATE TABLE eq_switches (
    equipamento_id INTEGER PRIMARY KEY,
    numero_portas INTEGER,
    firmware TEXT,
    vlans_configuradas TEXT,
    
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

-- 2a. Mapeamento porta a porta dos switches
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

-- 3. Celulares
CREATE TABLE eq_celulares (
    equipamento_id INTEGER PRIMARY KEY,
    usuario_alocado TEXT,
    imei TEXT UNIQUE,
    numero_serie TEXT,
    memoria TEXT,
    armazenamento TEXT,
    operadora_numero TEXT,
    modalidade TEXT CHECK (modalidade IN ('CORPORATIVO', 'BYOD')),
    sistema_operacional TEXT,
    
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

-- 4. NVRs
CREATE TABLE eq_nvrs (
    equipamento_id INTEGER PRIMARY KEY,
    quantidade_canais INTEGER,
    capacidade_armazenamento TEXT, -- Ex: 'HD 4TB' ou 'Retenção 30 dias'
    firmware TEXT,
    identificacao_extra TEXT, -- Pode guardar S/N ou TAG específicos
    
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

-- 4a. Câmeras
CREATE TABLE eq_cameras (
    equipamento_id INTEGER PRIMARY KEY,
    resolucao TEXT, -- Ex: '1080p', '4K'
    firmware TEXT,
    identificacao_extra TEXT, -- Pode guardar S/N ou TAG específicos
    
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

-- 4a. Mapeamento canal a canal dos NVRs
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

-- 5. Impressoras
CREATE TABLE eq_impressoras (
    equipamento_id INTEGER PRIMARY KEY,
    tipo_conexao TEXT NOT NULL CHECK (tipo_conexao IN ('REDE', 'USB')),
    computador_conectado_id INTEGER,
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (computador_conectado_id) REFERENCES equipamentos(id) ON DELETE SET NULL
);

-- ==========================================
-- ANEXOS (Documentos, Termos e Notas)
-- ==========================================

CREATE TABLE anexos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipamento_id INTEGER NOT NULL,
    nome_arquivo TEXT NOT NULL,
    caminho_arquivo TEXT NOT NULL,
    tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('NOTA_FISCAL', 'TERMO_RESPONSABILIDADE', 'CONTRATO', 'OUTRO')),
    data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);