#!/usr/bin/env python3
"""
Create Marketing e CRM MEEP Supremo tables migration
"""
import os
import sys
from sqlalchemy import create_engine, text

def create_marketing_tables():
    """Create Marketing e CRM MEEP Supremo tables"""
    
    sql_file = "marketing_migration.sql"
    
    if not os.path.exists(sql_file):
        print(f"Creating {sql_file}")
        
        sql_content = """
-- Marketing e CRM MEEP Supremo Tables Migration

-- Create programas_fidelidade table
CREATE TABLE IF NOT EXISTS programas_fidelidade (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    empresa_id INTEGER REFERENCES empresas(id) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'pontos',
    moeda_virtual VARCHAR(50) DEFAULT 'pontos',
    taxa_conversao DECIMAL(10,4) DEFAULT 1.0,
    pontos_por_real DECIMAL(10,2) DEFAULT 1.0,
    valor_ponto DECIMAL(10,4) DEFAULT 0.01,
    multiplicador_base DECIMAL(5,2) DEFAULT 1.0,
    ativo BOOLEAN DEFAULT true,
    data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_fim TIMESTAMP WITH TIME ZONE,
    configuracoes JSONB DEFAULT '{}',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create niveis_fidelidade table
CREATE TABLE IF NOT EXISTS niveis_fidelidade (
    id SERIAL PRIMARY KEY,
    programa_id INTEGER REFERENCES programas_fidelidade(id) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#4299e1',
    icone VARCHAR(50),
    pontos_minimos INTEGER NOT NULL DEFAULT 0,
    pontos_maximos INTEGER,
    multiplicador_pontos DECIMAL(5,2) DEFAULT 1.0,
    desconto_percentual DECIMAL(5,2) DEFAULT 0,
    cashback_percentual DECIMAL(5,2) DEFAULT 0,
    beneficios JSONB DEFAULT '[]',
    ordem INTEGER NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carteira_fidelidade table
CREATE TABLE IF NOT EXISTS carteira_fidelidade (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    programa_id INTEGER REFERENCES programas_fidelidade(id) NOT NULL,
    cliente_cpf VARCHAR(11) REFERENCES clientes_eventos(cpf) NOT NULL,
    nivel_id INTEGER REFERENCES niveis_fidelidade(id) NOT NULL,
    pontos_atuais INTEGER DEFAULT 0,
    pontos_totais_ganhos INTEGER DEFAULT 0,
    pontos_totais_resgatados INTEGER DEFAULT 0,
    saldo_cashback DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ativo',
    data_ultimo_uso TIMESTAMP WITH TIME ZONE,
    data_expiracao TIMESTAMP WITH TIME ZONE,
    configuracoes JSONB DEFAULT '{}',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transacoes_fidelidade table
CREATE TABLE IF NOT EXISTS transacoes_fidelidade (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    carteira_id INTEGER REFERENCES carteira_fidelidade(id) NOT NULL,
    evento_id INTEGER REFERENCES eventos(id),
    tipo VARCHAR(20) NOT NULL,
    pontos_transacao INTEGER NOT NULL,
    valor_monetario DECIMAL(10,2),
    multiplicador_aplicado DECIMAL(5,2) DEFAULT 1.0,
    descricao VARCHAR(500),
    referencia_externa VARCHAR(255),
    campanha_id INTEGER,
    promocao_id INTEGER,
    funcionario_id INTEGER REFERENCES usuarios(id),
    metadados JSONB DEFAULT '{}',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create segmentos_cliente table
CREATE TABLE IF NOT EXISTS segmentos_cliente (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    empresa_id INTEGER REFERENCES empresas(id) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'manual',
    criterios JSONB DEFAULT '{}',
    cor VARCHAR(7) DEFAULT '#4299e1',
    icone VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    automatico BOOLEAN DEFAULT false,
    frequencia_atualizacao VARCHAR(20) DEFAULT 'diario',
    ultima_atualizacao TIMESTAMP WITH TIME ZONE,
    total_clientes INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cliente_segmentos table
CREATE TABLE IF NOT EXISTS cliente_segmentos (
    id SERIAL PRIMARY KEY,
    segmento_id INTEGER REFERENCES segmentos_cliente(id) NOT NULL,
    cliente_cpf VARCHAR(11) REFERENCES clientes_eventos(cpf) NOT NULL,
    score_segmentacao DECIMAL(5,2),
    data_inclusao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_exclusao TIMESTAMP WITH TIME ZONE,
    ativo BOOLEAN DEFAULT true,
    metadados JSONB DEFAULT '{}'
);

-- Create templates_mensagem table
CREATE TABLE IF NOT EXISTS templates_mensagem (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    empresa_id INTEGER REFERENCES empresas(id) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    canal VARCHAR(50) NOT NULL,
    assunto VARCHAR(500),
    conteudo TEXT NOT NULL,
    variaveis JSONB DEFAULT '[]',
    configuracoes JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    criado_por INTEGER REFERENCES usuarios(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campanhas_marketing table
CREATE TABLE IF NOT EXISTS campanhas_marketing (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    empresa_id INTEGER REFERENCES empresas(id) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    canal VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'rascunho',
    segmento_id INTEGER REFERENCES segmentos_cliente(id),
    template_id INTEGER REFERENCES templates_mensagem(id),
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    data_envio TIMESTAMP WITH TIME ZONE,
    frequencia VARCHAR(20),
    objetivo VARCHAR(100),
    orcamento DECIMAL(10,2),
    custo_total DECIMAL(10,2) DEFAULT 0,
    total_envios INTEGER DEFAULT 0,
    total_aberturas INTEGER DEFAULT 0,
    total_cliques INTEGER DEFAULT 0,
    total_conversoes INTEGER DEFAULT 0,
    receita_gerada DECIMAL(10,2) DEFAULT 0,
    configuracoes JSONB DEFAULT '{}',
    criado_por INTEGER REFERENCES usuarios(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listas_eventos table
CREATE TABLE IF NOT EXISTS listas_eventos (
    id SERIAL PRIMARY KEY,
    evento_id INTEGER REFERENCES eventos(id) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) DEFAULT 'geral',
    capacidade_maxima INTEGER,
    preco DECIMAL(10,2) DEFAULT 0,
    data_inicio_vendas TIMESTAMP WITH TIME ZONE,
    data_fim_vendas TIMESTAMP WITH TIME ZONE,
    ativa BOOLEAN DEFAULT true,
    publica BOOLEAN DEFAULT true,
    requer_aprovacao BOOLEAN DEFAULT false,
    configuracoes JSONB DEFAULT '{}',
    total_participantes INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lista_participantes table
CREATE TABLE IF NOT EXISTS lista_participantes (
    id SERIAL PRIMARY KEY,
    lista_id INTEGER REFERENCES listas_eventos(id) NOT NULL,
    cliente_cpf VARCHAR(11) REFERENCES clientes_eventos(cpf) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmado',
    data_inscricao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    valor_pago DECIMAL(10,2) DEFAULT 0,
    observacoes TEXT,
    metadados JSONB DEFAULT '{}'
);

-- Create promocoes table
CREATE TABLE IF NOT EXISTS promocoes (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    empresa_id INTEGER REFERENCES empresas(id) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    codigo VARCHAR(50) UNIQUE,
    desconto_percentual DECIMAL(5,2),
    desconto_valor DECIMAL(10,2),
    valor_minimo DECIMAL(10,2),
    limite_uso_total INTEGER,
    limite_uso_cliente INTEGER DEFAULT 1,
    usos_atuais INTEGER DEFAULT 0,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    ativa BOOLEAN DEFAULT true,
    segmento_id INTEGER REFERENCES segmentos_cliente(id),
    configuracoes JSONB DEFAULT '{}',
    criado_por INTEGER REFERENCES usuarios(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cupom_uso table
CREATE TABLE IF NOT EXISTS cupom_uso (
    id SERIAL PRIMARY KEY,
    promocao_id INTEGER REFERENCES promocoes(id) NOT NULL,
    cliente_cpf VARCHAR(11) REFERENCES clientes_eventos(cpf) NOT NULL,
    evento_id INTEGER REFERENCES eventos(id),
    codigo_usado VARCHAR(50) NOT NULL,
    valor_desconto_aplicado DECIMAL(10,2) NOT NULL,
    valor_original DECIMAL(10,2) NOT NULL,
    valor_final DECIMAL(10,2) NOT NULL,
    data_uso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    funcionario_id INTEGER REFERENCES usuarios(id),
    metadados JSONB DEFAULT '{}'
);

-- Create analytics_eventos table
CREATE TABLE IF NOT EXISTS analytics_eventos (
    id SERIAL PRIMARY KEY,
    evento_id INTEGER REFERENCES eventos(id) NOT NULL,
    data_evento DATE NOT NULL,
    total_participantes INTEGER DEFAULT 0,
    total_receita DECIMAL(10,2) DEFAULT 0,
    ticket_medio DECIMAL(10,2) DEFAULT 0,
    taxa_conversao DECIMAL(5,2) DEFAULT 0,
    nps_score DECIMAL(3,1),
    satisfacao_media DECIMAL(3,1),
    tempo_permanencia_medio INTEGER,
    pontos_distribuidos INTEGER DEFAULT 0,
    promocoes_utilizadas INTEGER DEFAULT 0,
    campanhas_ativas INTEGER DEFAULT 0,
    segmentos_impactados JSONB DEFAULT '[]',
    metricas_detalhadas JSONB DEFAULT '{}',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflows_marketing table
CREATE TABLE IF NOT EXISTS workflows_marketing (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    empresa_id INTEGER REFERENCES empresas(id) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    trigger_evento VARCHAR(100) NOT NULL,
    condicoes JSONB DEFAULT '{}',
    acoes JSONB DEFAULT '[]',
    ativo BOOLEAN DEFAULT true,
    prioridade INTEGER DEFAULT 1,
    delay_execucao INTEGER DEFAULT 0,
    total_execucoes INTEGER DEFAULT 0,
    taxa_sucesso DECIMAL(5,2) DEFAULT 0,
    criado_por INTEGER REFERENCES usuarios(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_execucoes table
CREATE TABLE IF NOT EXISTS workflow_execucoes (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES workflows_marketing(id) NOT NULL,
    cliente_cpf VARCHAR(11) REFERENCES clientes_eventos(cpf),
    evento_id INTEGER REFERENCES eventos(id),
    status VARCHAR(20) DEFAULT 'pendente',
    dados_entrada JSONB DEFAULT '{}',
    dados_saida JSONB DEFAULT '{}',
    erro_detalhes TEXT,
    tempo_execucao INTEGER,
    data_agendamento TIMESTAMP WITH TIME ZONE,
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints for cross-references
ALTER TABLE transacoes_fidelidade 
ADD CONSTRAINT fk_transacoes_campanha 
FOREIGN KEY (campanha_id) REFERENCES campanhas_marketing(id);

ALTER TABLE transacoes_fidelidade 
ADD CONSTRAINT fk_transacoes_promocao 
FOREIGN KEY (promocao_id) REFERENCES promocoes(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_programas_fidelidade_empresa ON programas_fidelidade(empresa_id);
CREATE INDEX IF NOT EXISTS idx_programas_fidelidade_ativo ON programas_fidelidade(ativo);
CREATE INDEX IF NOT EXISTS idx_niveis_fidelidade_programa ON niveis_fidelidade(programa_id);
CREATE INDEX IF NOT EXISTS idx_carteira_fidelidade_programa ON carteira_fidelidade(programa_id);
CREATE INDEX IF NOT EXISTS idx_carteira_fidelidade_cliente ON carteira_fidelidade(cliente_cpf);
CREATE INDEX IF NOT EXISTS idx_carteira_fidelidade_status ON carteira_fidelidade(status);
CREATE INDEX IF NOT EXISTS idx_transacoes_fidelidade_carteira ON transacoes_fidelidade(carteira_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_fidelidade_tipo ON transacoes_fidelidade(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_fidelidade_evento ON transacoes_fidelidade(evento_id);
CREATE INDEX IF NOT EXISTS idx_segmentos_cliente_empresa ON segmentos_cliente(empresa_id);
CREATE INDEX IF NOT EXISTS idx_segmentos_cliente_ativo ON segmentos_cliente(ativo);
CREATE INDEX IF NOT EXISTS idx_cliente_segmentos_segmento ON cliente_segmentos(segmento_id);
CREATE INDEX IF NOT EXISTS idx_cliente_segmentos_cliente ON cliente_segmentos(cliente_cpf);
CREATE INDEX IF NOT EXISTS idx_campanhas_marketing_empresa ON campanhas_marketing(empresa_id);
CREATE INDEX IF NOT EXISTS idx_campanhas_marketing_status ON campanhas_marketing(status);
CREATE INDEX IF NOT EXISTS idx_campanhas_marketing_segmento ON campanhas_marketing(segmento_id);
CREATE INDEX IF NOT EXISTS idx_templates_mensagem_empresa ON templates_mensagem(empresa_id);
CREATE INDEX IF NOT EXISTS idx_templates_mensagem_tipo ON templates_mensagem(tipo);
CREATE INDEX IF NOT EXISTS idx_listas_eventos_evento ON listas_eventos(evento_id);
CREATE INDEX IF NOT EXISTS idx_lista_participantes_lista ON lista_participantes(lista_id);
CREATE INDEX IF NOT EXISTS idx_lista_participantes_cliente ON lista_participantes(cliente_cpf);
CREATE INDEX IF NOT EXISTS idx_promocoes_empresa ON promocoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_promocoes_codigo ON promocoes(codigo);
CREATE INDEX IF NOT EXISTS idx_promocoes_ativa ON promocoes(ativa);
CREATE INDEX IF NOT EXISTS idx_cupom_uso_promocao ON cupom_uso(promocao_id);
CREATE INDEX IF NOT EXISTS idx_cupom_uso_cliente ON cupom_uso(cliente_cpf);
CREATE INDEX IF NOT EXISTS idx_analytics_eventos_evento ON analytics_eventos(evento_id);
CREATE INDEX IF NOT EXISTS idx_analytics_eventos_data ON analytics_eventos(data_evento);
CREATE INDEX IF NOT EXISTS idx_workflows_marketing_empresa ON workflows_marketing(empresa_id);
CREATE INDEX IF NOT EXISTS idx_workflows_marketing_ativo ON workflows_marketing(ativo);
CREATE INDEX IF NOT EXISTS idx_workflow_execucoes_workflow ON workflow_execucoes(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execucoes_status ON workflow_execucoes(status);

-- Create trigger functions for automatic updates
CREATE OR REPLACE FUNCTION atualizar_pontos_carteira()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo = 'ganho' THEN
        UPDATE carteira_fidelidade 
        SET pontos_atuais = pontos_atuais + NEW.pontos_transacao,
            pontos_totais_ganhos = pontos_totais_ganhos + NEW.pontos_transacao,
            data_ultimo_uso = NOW(),
            atualizado_em = NOW()
        WHERE id = NEW.carteira_id;
    ELSIF NEW.tipo = 'resgate' THEN
        UPDATE carteira_fidelidade 
        SET pontos_atuais = pontos_atuais - ABS(NEW.pontos_transacao),
            pontos_totais_resgatados = pontos_totais_resgatados + ABS(NEW.pontos_transacao),
            data_ultimo_uso = NOW(),
            atualizado_em = NOW()
        WHERE id = NEW.carteira_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic point updates
DROP TRIGGER IF EXISTS trigger_atualizar_pontos_carteira ON transacoes_fidelidade;
CREATE TRIGGER trigger_atualizar_pontos_carteira
    AFTER INSERT ON transacoes_fidelidade
    FOR EACH ROW EXECUTE FUNCTION atualizar_pontos_carteira();

-- Create function to check and upgrade loyalty level
CREATE OR REPLACE FUNCTION verificar_upgrade_nivel()
RETURNS TRIGGER AS $$
DECLARE
    novo_nivel_id INTEGER;
BEGIN
    SELECT id INTO novo_nivel_id
    FROM niveis_fidelidade nf
    WHERE nf.programa_id = (SELECT programa_id FROM carteira_fidelidade WHERE id = NEW.carteira_id)
    AND NEW.pontos_transacao >= nf.pontos_minimos
    AND (nf.pontos_maximos IS NULL OR NEW.pontos_transacao <= nf.pontos_maximos)
    AND nf.ativo = true
    ORDER BY nf.pontos_minimos DESC
    LIMIT 1;
    
    IF novo_nivel_id IS NOT NULL AND novo_nivel_id != (SELECT nivel_id FROM carteira_fidelidade WHERE id = NEW.carteira_id) THEN
        UPDATE carteira_fidelidade 
        SET nivel_id = novo_nivel_id,
            atualizado_em = NOW()
        WHERE id = NEW.carteira_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for level upgrades
DROP TRIGGER IF EXISTS trigger_verificar_upgrade_nivel ON transacoes_fidelidade;
CREATE TRIGGER trigger_verificar_upgrade_nivel
    AFTER INSERT ON transacoes_fidelidade
    FOR EACH ROW EXECUTE FUNCTION verificar_upgrade_nivel();

-- Create function to update segment totals
CREATE OR REPLACE FUNCTION atualizar_total_segmento()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE segmentos_cliente 
        SET total_clientes = total_clientes + 1,
            atualizado_em = NOW()
        WHERE id = NEW.segmento_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE segmentos_cliente 
        SET total_clientes = total_clientes - 1,
            atualizado_em = NOW()
        WHERE id = OLD.segmento_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for segment totals
DROP TRIGGER IF EXISTS trigger_atualizar_total_segmento ON cliente_segmentos;
CREATE TRIGGER trigger_atualizar_total_segmento
    AFTER INSERT OR DELETE ON cliente_segmentos
    FOR EACH ROW EXECUTE FUNCTION atualizar_total_segmento();

-- Create function to update campaign metrics
CREATE OR REPLACE FUNCTION atualizar_metricas_campanha()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE campanhas_marketing 
    SET total_conversoes = total_conversoes + 1,
        receita_gerada = receita_gerada + NEW.valor_final,
        atualizado_em = NOW()
    WHERE id = (SELECT campanha_id FROM transacoes_fidelidade WHERE id = NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update promotion usage
CREATE OR REPLACE FUNCTION atualizar_uso_promocao()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE promocoes 
    SET usos_atuais = usos_atuais + 1
    WHERE id = NEW.promocao_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for promotion usage
DROP TRIGGER IF EXISTS trigger_atualizar_uso_promocao ON cupom_uso;
CREATE TRIGGER trigger_atualizar_uso_promocao
    AFTER INSERT ON cupom_uso
    FOR EACH ROW EXECUTE FUNCTION atualizar_uso_promocao();

-- Create function to update list participants count
CREATE OR REPLACE FUNCTION atualizar_total_participantes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE listas_eventos 
        SET total_participantes = total_participantes + 1
        WHERE id = NEW.lista_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE listas_eventos 
        SET total_participantes = total_participantes - 1
        WHERE id = OLD.lista_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for list participants
DROP TRIGGER IF EXISTS trigger_atualizar_total_participantes ON lista_participantes;
CREATE TRIGGER trigger_atualizar_total_participantes
    AFTER INSERT OR DELETE ON lista_participantes
    FOR EACH ROW EXECUTE FUNCTION atualizar_total_participantes();

COMMIT;
"""
        
        with open(sql_file, 'w') as f:
            f.write(sql_content)
    
    try:
        db_url = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/paineluniversal')
        engine = create_engine(db_url)
        
        print("Connecting to database...")
        with engine.connect() as conn:
            print("Executing marketing migration...")
            
            with open(sql_file, 'r') as f:
                sql_content = f.read()
            
            conn.execute(text(sql_content))
            conn.commit()
            
            print("✅ Marketing e CRM MEEP Supremo tables created successfully!")
            
    except Exception as e:
        print(f"❌ Error creating marketing tables: {e}")
        print("📄 SQL migration file generated successfully - run manually if needed")
        return True  # Continue even if DB connection fails

if __name__ == "__main__":
    create_marketing_tables()
