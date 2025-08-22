-- Migração SQLite para limpar campos desnecessários da tabela produtos
-- Remove: evento_id, codigo_barras, empresa_id

-- Para SQLite, precisamos recriar a tabela para remover colunas
-- pois SQLite não suporta DROP COLUMN diretamente

-- 1. Criar tabela temporária com estrutura correta
CREATE TABLE produtos_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'PRODUTO',
    preco DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50),
    estoque_atual INTEGER DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 0,
    estoque_maximo INTEGER DEFAULT 1000,
    controla_estoque BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'ATIVO',
    imagem_url VARCHAR(255),
    codigo_interno VARCHAR(50) UNIQUE,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Copiar dados da tabela original (apenas colunas que existem na nova estrutura)
INSERT INTO produtos_temp (
    id, nome, tipo, preco, categoria, estoque_atual, estoque_minimo, 
    estoque_maximo, controla_estoque, status, imagem_url, codigo_interno,
    criado_em, atualizado_em
)
SELECT 
    id, nome, tipo, preco, categoria, estoque_atual, estoque_minimo,
    estoque_maximo, controla_estoque, status, imagem_url, codigo_interno,
    criado_em, atualizado_em
FROM produtos;

-- 3. Remover tabela original
DROP TABLE produtos;

-- 4. Renomear tabela temporária
ALTER TABLE produtos_temp RENAME TO produtos;

-- 5. Recriar índices se necessário
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos(nome);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_status ON produtos(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_produtos_codigo_interno ON produtos(codigo_interno);
