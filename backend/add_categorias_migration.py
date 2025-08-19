"""Add produtos_categorias table

Revision ID: add_produtos_categorias
Revises: 
Create Date: 2025-08-18 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_produtos_categorias'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create produtos_categorias table
    op.create_table(
        'produtos_categorias',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nome', sa.String(255), nullable=False),
        sa.Column('descricao', sa.Text(), nullable=True),
        sa.Column('cor', sa.String(7), nullable=True, default='#3B82F6'),
        sa.Column('ativo', sa.Boolean(), nullable=False, default=True),
        sa.Column('evento_id', sa.Integer(), nullable=True),
        sa.Column('empresa_id', sa.Integer(), nullable=True),
        sa.Column('criado_em', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('atualizado_em', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['evento_id'], ['eventos.id']),
        sa.ForeignKeyConstraint(['empresa_id'], ['empresas.id']),
        sa.Index('idx_produtos_categorias_nome', 'nome'),
        sa.Index('idx_produtos_categorias_ativo', 'ativo')
    )
    
    # Add categoria_id foreign key to produtos table
    op.add_column('produtos', sa.Column('categoria_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_produtos_categoria_id', 'produtos', 'produtos_categorias', ['categoria_id'], ['id'])
    
    # Insert default categories
    op.execute("""
        INSERT INTO produtos_categorias (nome, descricao, cor, ativo) VALUES
        ('Bebidas', 'Bebidas alcoólicas e não alcoólicas', '#10B981', true),
        ('Comidas', 'Pratos principais e petiscos', '#F59E0B', true),
        ('Sobremesas', 'Doces e sobremesas', '#EF4444', true),
        ('Aperitivos', 'Petiscos e entradas', '#8B5CF6', true),
        ('Drinks', 'Cocktails e bebidas especiais', '#06B6D4', true)
    """)

def downgrade() -> None:
    # Remove foreign key constraint and column from produtos
    op.drop_constraint('fk_produtos_categoria_id', 'produtos', type_='foreignkey')
    op.drop_column('produtos', 'categoria_id')
    
    # Drop produtos_categorias table
    op.drop_table('produtos_categorias')
