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

-- ==========================================
-- TABELA MESTRE
-- ==========================================

CREATE TABLE equipamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT NOT NULL CHECK (categoria IN ('COMPUTADOR', 'SWITCH', 'CELULAR', 'NVR', 'CAMERA')),
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
    portas_em_uso INTEGER,
    firmware TEXT,
    vlans_configuradas TEXT,
    
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

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

-- 4. NVRs e Câmeras
CREATE TABLE eq_cftv (
    equipamento_id INTEGER PRIMARY KEY,
    identificacao_extra TEXT, -- Pode guardar S/N ou TAG específicos
    capacidade_armazenamento TEXT, -- Ex: 'HD 4TB' ou 'Retenção 30 dias'
    quantidade_canais_resolucao TEXT, -- Ex: '16 Canais' (NVR) ou '1080p' (Câmera)
    firmware TEXT,
    
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
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