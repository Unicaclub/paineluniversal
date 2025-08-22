-- Migração para limpar campos desnecessários da tabela produtos
-- Remove evento_id, codigo_barras e empresa_id conforme regra de negócio

BEGIN;

-- Verificar se as colunas existem antes de tentar removê-las
DO $$ 
BEGIN 
    -- Remover evento_id se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produtos' AND column_name = 'evento_id'
    ) THEN
        ALTER TABLE produtos DROP COLUMN evento_id;
        RAISE NOTICE 'Coluna evento_id removida da tabela produtos';
    END IF;
    
    -- Remover codigo_barras se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produtos' AND column_name = 'codigo_barras'
    ) THEN
        ALTER TABLE produtos DROP COLUMN codigo_barras;
        RAISE NOTICE 'Coluna codigo_barras removida da tabela produtos';
    END IF;
    
    -- Remover empresa_id se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produtos' AND column_name = 'empresa_id'
    ) THEN
        ALTER TABLE produtos DROP COLUMN empresa_id;
        RAISE NOTICE 'Coluna empresa_id removida da tabela produtos';
    END IF;
END $$;

-- Verificar estrutura final da tabela produtos
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'produtos' 
ORDER BY ordinal_position;

COMMIT;
