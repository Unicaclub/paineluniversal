
-- Mapa da Operação Tables Migration
-- Create new enum types
DO $$ BEGIN
    CREATE TYPE status_mesa AS ENUM ('disponivel', 'ocupada', 'reservada', 'bloqueada', 'manutencao');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_area AS ENUM ('bar', 'pista', 'vip', 'lounge', 'banheiro', 'entrada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_comanda_operacao AS ENUM ('aberta', 'bloqueada', 'fechada', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_bloqueio AS ENUM ('cliente', 'mesa', 'comanda', 'area');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create layout_evento table
CREATE TABLE IF NOT EXISTS layout_evento (
    id SERIAL PRIMARY KEY,
    evento_id INTEGER REFERENCES eventos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    largura INTEGER NOT NULL,
    altura INTEGER NOT NULL,
    escala DECIMAL(5,2) DEFAULT 1.0,
    configuracao JSONB DEFAULT '{}',
    imagem_fundo VARCHAR(500),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create areas_evento table
CREATE TABLE IF NOT EXISTS areas_evento (
    id SERIAL PRIMARY KEY,
    layout_id INTEGER REFERENCES layout_evento(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo tipo_area NOT NULL,
    posicao_x INTEGER NOT NULL,
    posicao_y INTEGER NOT NULL,
    largura INTEGER NOT NULL,
    altura INTEGER NOT NULL,
    capacidade_maxima INTEGER DEFAULT 0,
    cor VARCHAR(7) DEFAULT '#4299e1',
    ativa BOOLEAN DEFAULT true,
    configuracoes JSONB DEFAULT '{}',
    restricoes JSONB DEFAULT '[]',
    responsavel_id INTEGER REFERENCES usuarios(id)
);

-- Create mesas table
CREATE TABLE IF NOT EXISTS mesas (
    id SERIAL PRIMARY KEY,
    area_id INTEGER REFERENCES areas_evento(id) ON DELETE CASCADE,
    numero VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(255),
    tipo VARCHAR(50) DEFAULT 'comum',
    capacidade_pessoas INTEGER DEFAULT 4,
    posicao_x INTEGER NOT NULL,
    posicao_y INTEGER NOT NULL,
    largura INTEGER DEFAULT 100,
    altura INTEGER DEFAULT 100,
    formato VARCHAR(20) DEFAULT 'retangular',
    status status_mesa DEFAULT 'disponivel',
    valor_minimo DECIMAL(10,2) DEFAULT 0,
    taxa_servico DECIMAL(5,2) DEFAULT 10,
    observacoes TEXT,
    configuracoes JSONB DEFAULT '{}',
    criada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comandas_operacao table
CREATE TABLE IF NOT EXISTS comandas_operacao (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    evento_id INTEGER REFERENCES eventos(id) ON DELETE CASCADE,
    mesa_id INTEGER REFERENCES mesas(id),
    numero_comanda VARCHAR(20) UNIQUE NOT NULL,
    cliente_principal_cpf VARCHAR(11) REFERENCES clientes_eventos(cpf),
    status status_comanda_operacao DEFAULT 'aberta',
    tipo VARCHAR(20) DEFAULT 'mesa',
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_fechamento TIMESTAMP WITH TIME ZONE,
    valor_total DECIMAL(10,2) DEFAULT 0,
    valor_pago DECIMAL(10,2) DEFAULT 0,
    valor_pendente DECIMAL(10,2) DEFAULT 0,
    desconto_aplicado DECIMAL(10,2) DEFAULT 0,
    taxa_servico DECIMAL(10,2) DEFAULT 0,
    observacoes TEXT,
    funcionario_abertura INTEGER REFERENCES usuarios(id),
    funcionario_fechamento INTEGER REFERENCES usuarios(id),
    configuracoes JSONB DEFAULT '{}'
);

-- Create comanda_participantes table
CREATE TABLE IF NOT EXISTS comanda_participantes (
    id SERIAL PRIMARY KEY,
    comanda_id INTEGER REFERENCES comandas_operacao(id) ON DELETE CASCADE,
    cliente_cpf VARCHAR(11) REFERENCES clientes_eventos(cpf),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    entrada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    saida_em TIMESTAMP WITH TIME ZONE,
    consumo_individual DECIMAL(10,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT true
);

-- Create comanda_itens table
CREATE TABLE IF NOT EXISTS comanda_itens (
    id SERIAL PRIMARY KEY,
    comanda_id INTEGER REFERENCES comandas_operacao(id) ON DELETE CASCADE,
    produto_id INTEGER,
    nome_produto VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    quantidade INTEGER NOT NULL DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    cliente_solicitante_cpf VARCHAR(11),
    funcionario_id INTEGER REFERENCES usuarios(id),
    data_pedido TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_entrega TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pedido',
    observacoes TEXT
);

-- Create bloqueios table
CREATE TABLE IF NOT EXISTS bloqueios (
    id SERIAL PRIMARY KEY,
    tipo tipo_bloqueio NOT NULL,
    referencia_id VARCHAR(50) NOT NULL,
    evento_id INTEGER REFERENCES eventos(id),
    motivo VARCHAR(255) NOT NULL,
    detalhes TEXT,
    bloqueado_por INTEGER REFERENCES usuarios(id),
    bloqueado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    desbloqueado_por INTEGER REFERENCES usuarios(id),
    desbloqueado_em TIMESTAMP WITH TIME ZONE,
    ativo BOOLEAN DEFAULT true,
    temporario BOOLEAN DEFAULT false,
    expira_em TIMESTAMP WITH TIME ZONE
);

-- Create grupos_cartoes table
CREATE TABLE IF NOT EXISTS grupos_cartoes (
    id SERIAL PRIMARY KEY,
    evento_id INTEGER REFERENCES eventos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#4299e1',
    limite_consumo DECIMAL(10,2) DEFAULT 0,
    desconto_percentual DECIMAL(5,2) DEFAULT 0,
    beneficios JSONB DEFAULT '[]',
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cartoes_evento table
CREATE TABLE IF NOT EXISTS cartoes_evento (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    evento_id INTEGER REFERENCES eventos(id) ON DELETE CASCADE,
    grupo_id INTEGER REFERENCES grupos_cartoes(id),
    numero_cartao VARCHAR(20) UNIQUE NOT NULL,
    cliente_cpf VARCHAR(11) REFERENCES clientes_eventos(cpf),
    qr_code VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'ativo',
    saldo_credito DECIMAL(10,2) DEFAULT 0,
    limite_consumo DECIMAL(10,2) DEFAULT 0,
    consumo_total DECIMAL(10,2) DEFAULT 0,
    data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_bloqueio TIMESTAMP WITH TIME ZONE,
    motivo_bloqueio TEXT,
    configuracoes JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mesas_area ON mesas(area_id);
CREATE INDEX IF NOT EXISTS idx_mesas_status ON mesas(status);
CREATE INDEX IF NOT EXISTS idx_comandas_operacao_evento ON comandas_operacao(evento_id);
CREATE INDEX IF NOT EXISTS idx_comandas_operacao_status ON comandas_operacao(status);
CREATE INDEX IF NOT EXISTS idx_comandas_operacao_mesa ON comandas_operacao(mesa_id);
CREATE INDEX IF NOT EXISTS idx_comanda_itens_comanda ON comanda_itens(comanda_id);
CREATE INDEX IF NOT EXISTS idx_comanda_itens_status ON comanda_itens(status);
CREATE INDEX IF NOT EXISTS idx_bloqueios_tipo_ref ON bloqueios(tipo, referencia_id);
CREATE INDEX IF NOT EXISTS idx_bloqueios_ativo ON bloqueios(ativo);
CREATE INDEX IF NOT EXISTS idx_cartoes_evento ON cartoes_evento(evento_id);
CREATE INDEX IF NOT EXISTS idx_cartoes_cliente ON cartoes_evento(cliente_cpf);

-- Create trigger function for updating comanda values
CREATE OR REPLACE FUNCTION atualizar_valor_comanda()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE comandas_operacao 
    SET valor_total = (
        SELECT COALESCE(SUM(valor_total), 0) 
        FROM comanda_itens 
        WHERE comanda_id = COALESCE(NEW.comanda_id, OLD.comanda_id)
        AND status != 'cancelado'
    ),
    valor_pendente = valor_total - valor_pago
    WHERE id = COALESCE(NEW.comanda_id, OLD.comanda_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comanda value updates
DROP TRIGGER IF EXISTS trigger_atualizar_valor_comanda ON comanda_itens;
CREATE TRIGGER trigger_atualizar_valor_comanda
    AFTER INSERT OR UPDATE OR DELETE ON comanda_itens
    FOR EACH ROW EXECUTE FUNCTION atualizar_valor_comanda();

-- Create trigger function for updating mesa timestamps
CREATE OR REPLACE FUNCTION atualizar_timestamp_mesa()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizada_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for mesa timestamp updates
DROP TRIGGER IF EXISTS trigger_atualizar_timestamp_mesa ON mesas;
CREATE TRIGGER trigger_atualizar_timestamp_mesa
    BEFORE UPDATE ON mesas
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_mesa();

-- Create trigger function for updating layout timestamps
CREATE OR REPLACE FUNCTION atualizar_timestamp_layout()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for layout timestamp updates
DROP TRIGGER IF EXISTS trigger_atualizar_timestamp_layout ON layout_evento;
CREATE TRIGGER trigger_atualizar_timestamp_layout
    BEFORE UPDATE ON layout_evento
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_layout();

COMMIT;
