#!/usr/bin/env python3
"""
Create MEEP integration tables migration
"""
import os
from sqlalchemy import create_engine, text
from app.database import settings

def create_meep_tables():
    """Create MEEP integration tables"""
    
    sql_file = "meep_migration.sql"
    
    if not os.path.exists(sql_file):
        print(f"Creating {sql_file}")
        
        sql_content = """
-- MEEP Integration Tables Migration
-- Create new tables for MEEP functionality

CREATE TABLE IF NOT EXISTS clientes_eventos (
    id SERIAL PRIMARY KEY,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    nome_social VARCHAR(255),
    data_nascimento DATE,
    nome_mae VARCHAR(255),
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco JSONB,
    genero VARCHAR(20),
    status_cpf VARCHAR(20) DEFAULT 'nao_verificado',
    data_ultima_consulta TIMESTAMP WITH TIME ZONE,
    situacao_receita VARCHAR(50),
    foto_url VARCHAR(500),
    dados_receita JSONB,
    lgpd_aceito BOOLEAN DEFAULT FALSE,
    lgpd_data TIMESTAMP WITH TIME ZONE,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_clientes_eventos_cpf ON clientes_eventos(cpf);
CREATE INDEX idx_clientes_eventos_status ON clientes_eventos(status_cpf);

CREATE TABLE IF NOT EXISTS validacoes_acesso (
    id SERIAL PRIMARY KEY,
    checkin_id INTEGER REFERENCES checkins(id),
    tentativa_cpf_prefixo VARCHAR(3),
    tentativa_qr_code VARCHAR(255),
    sucesso BOOLEAN,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address VARCHAR(45),
    geolocation JSONB,
    motivo_falha VARCHAR(100),
    dispositivo_info JSONB,
    funcionario_validador INTEGER REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS equipamentos_eventos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    modelo VARCHAR(100),
    numero_serie VARCHAR(100) UNIQUE,
    ip_address VARCHAR(45),
    mac_address VARCHAR(17),
    localizacao VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ativo',
    configuracoes JSONB,
    evento_id INTEGER REFERENCES eventos(id) NOT NULL,
    empresa_id INTEGER REFERENCES empresas(id) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessoes_operadores (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) NOT NULL,
    evento_id INTEGER REFERENCES eventos(id) NOT NULL,
    equipamento_id INTEGER REFERENCES equipamentos_eventos(id),
    inicio_sessao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fim_sessao TIMESTAMP WITH TIME ZONE,
    localizacao_gps JSONB,
    autenticacao_biometrica BOOLEAN DEFAULT FALSE,
    pin_acesso VARCHAR(6),
    status VARCHAR(20) DEFAULT 'ativa'
);

CREATE TABLE IF NOT EXISTS previsoes_ia (
    id SERIAL PRIMARY KEY,
    evento_id INTEGER REFERENCES eventos(id) NOT NULL,
    tipo_previsao VARCHAR(50) NOT NULL,
    data_previsao DATE NOT NULL,
    valor_previsto NUMERIC(10, 2) NOT NULL,
    confianca_percentual NUMERIC(5, 2) NOT NULL,
    algoritmo_usado VARCHAR(50),
    fatores_influencia JSONB,
    dados_historicos JSONB,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        """
        
        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write(sql_content)
    
    try:
        print("=== Applying MEEP Migration ===")
        print(f"Database URL: {settings.database_url}")
        
        engine = create_engine(settings.database_url)
        
        with engine.begin() as conn:
            with open(sql_file, 'r', encoding='utf-8') as f:
                sql_commands = f.read().split(';')
                
                for command in sql_commands:
                    command = command.strip()
                    if command:
                        print(f"Executing: {command[:50]}...")
                        conn.execute(text(command))
        
        print("✅ MEEP migration applied successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error applying migration: {e}")
        return False

if __name__ == "__main__":
    create_meep_tables()
