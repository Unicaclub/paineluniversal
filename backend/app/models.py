from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class StatusEvento(enum.Enum):
    ATIVO = "ativo"
    INATIVO = "inativo"
    CANCELADO = "cancelado"

class TipoLista(enum.Enum):
    VIP = "vip"
    FREE = "free"
    PAGANTE = "pagante"
    PROMOTER = "promoter"
    ANIVERSARIO = "aniversario"
    DESCONTO = "desconto"

class StatusTransacao(enum.Enum):
    PENDENTE = "pendente"
    APROVADA = "aprovada"
    CANCELADA = "cancelada"

class TipoUsuario(enum.Enum):
    ADMIN = "admin"
    PROMOTER = "promoter"
    CLIENTE = "cliente"

class Empresa(Base):
    __tablename__ = "empresas"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    cnpj = Column(String(18), unique=True, nullable=False)
    email = Column(String(255), nullable=False)
    telefone = Column(String(20))
    endereco = Column(Text)
    ativa = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    usuarios = relationship("Usuario", back_populates="empresa")
    eventos = relationship("Evento", back_populates="empresa")

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    cpf = Column(String(14), unique=True, nullable=False, index=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    telefone = Column(String(20))
    senha_hash = Column(String(255), nullable=False)
    tipo = Column(Enum(TipoUsuario), nullable=False)
    ativo = Column(Boolean, default=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    ultimo_login = Column(DateTime(timezone=True))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    empresa = relationship("Empresa", back_populates="usuarios")
    eventos_criados = relationship("Evento", back_populates="criador")
    promocoes = relationship("PromoterEvento", back_populates="promoter")
    transacoes = relationship("Transacao", back_populates="usuario")
    checkins = relationship("Checkin", back_populates="usuario")

class Evento(Base):
    __tablename__ = "eventos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    data_evento = Column(DateTime(timezone=True), nullable=False)
    local = Column(String(255), nullable=False)
    endereco = Column(Text)
    limite_idade = Column(Integer, default=18)
    capacidade_maxima = Column(Integer)
    status = Column(Enum(StatusEvento), default=StatusEvento.ATIVO)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    criador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    empresa = relationship("Empresa", back_populates="eventos")
    criador = relationship("Usuario", back_populates="eventos_criados")
    listas = relationship("Lista", back_populates="evento")
    promoters = relationship("PromoterEvento", back_populates="evento")
    transacoes = relationship("Transacao", back_populates="evento")
    checkins = relationship("Checkin", back_populates="evento")

class Lista(Base):
    __tablename__ = "listas"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    tipo = Column(Enum(TipoLista), nullable=False)
    preco = Column(Numeric(10, 2), default=0)
    limite_vendas = Column(Integer)
    vendas_realizadas = Column(Integer, default=0)
    ativa = Column(Boolean, default=True)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    promoter_id = Column(Integer, ForeignKey("usuarios.id"))
    
    codigo_cupom = Column(String(50), unique=True)
    desconto_percentual = Column(Numeric(5, 2), default=0)
    desconto_valor = Column(Numeric(10, 2), default=0)
    data_inicio_desconto = Column(DateTime(timezone=True))
    data_fim_desconto = Column(DateTime(timezone=True))
    limite_uso_cupom = Column(Integer)
    usos_cupom = Column(Integer, default=0)
    
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    evento = relationship("Evento", back_populates="listas")
    promoter = relationship("Usuario")
    transacoes = relationship("Transacao", back_populates="lista")

class PromoterEvento(Base):
    __tablename__ = "promoter_eventos"
    
    id = Column(Integer, primary_key=True, index=True)
    promoter_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    meta_vendas = Column(Integer, default=0)
    vendas_realizadas = Column(Integer, default=0)
    comissao_percentual = Column(Numeric(5, 2), default=0)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    promoter = relationship("Usuario", back_populates="promocoes")
    evento = relationship("Evento", back_populates="promoters")

class Transacao(Base):
    __tablename__ = "transacoes"
    
    id = Column(Integer, primary_key=True, index=True)
    cpf_comprador = Column(String(14), nullable=False, index=True)
    nome_comprador = Column(String(255), nullable=False)
    email_comprador = Column(String(255))
    telefone_comprador = Column(String(20))
    valor = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(StatusTransacao), default=StatusTransacao.PENDENTE)
    metodo_pagamento = Column(String(50))
    codigo_transacao = Column(String(100), unique=True)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    lista_id = Column(Integer, ForeignKey("listas.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    ip_origem = Column(String(45))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    evento = relationship("Evento", back_populates="transacoes")
    lista = relationship("Lista", back_populates="transacoes")
    usuario = relationship("Usuario", back_populates="transacoes")

class Checkin(Base):
    __tablename__ = "checkins"
    
    id = Column(Integer, primary_key=True, index=True)
    cpf = Column(String(14), nullable=False, index=True)
    nome = Column(String(255), nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    transacao_id = Column(Integer, ForeignKey("transacoes.id"))
    metodo_checkin = Column(String(20))  # cpf, qr_code, cartao
    validacao_cpf = Column(String(3))  # 3 primeiros dígitos para validação
    ip_origem = Column(String(45))
    checkin_em = Column(DateTime(timezone=True), server_default=func.now())
    
    evento = relationship("Evento", back_populates="checkins")
    usuario = relationship("Usuario", back_populates="checkins")
    transacao = relationship("Transacao")

class TipoProduto(enum.Enum):
    BEBIDA = "BEBIDA"
    COMIDA = "COMIDA"
    INGRESSO = "INGRESSO"
    FICHA = "FICHA"
    COMBO = "COMBO"
    VOUCHER = "VOUCHER"

class StatusProduto(enum.Enum):
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    ESGOTADO = "ESGOTADO"

class TipoComanda(enum.Enum):
    FISICA = "FISICA"
    VIRTUAL = "VIRTUAL"
    RFID = "RFID"
    NFC = "NFC"

class StatusComanda(enum.Enum):
    ATIVA = "ATIVA"
    BLOQUEADA = "BLOQUEADA"
    CANCELADA = "CANCELADA"

class StatusVendaPDV(enum.Enum):
    PENDENTE = "PENDENTE"
    APROVADA = "APROVADA"
    CANCELADA = "CANCELADA"
    ESTORNADA = "ESTORNADA"

class TipoPagamentoPDV(enum.Enum):
    PIX = "PIX"
    CARTAO_CREDITO = "CARTAO_CREDITO"
    CARTAO_DEBITO = "CARTAO_DEBITO"
    DINHEIRO = "DINHEIRO"
    SALDO_COMANDA = "SALDO_COMANDA"
    VOUCHER = "VOUCHER"
    SPLIT = "SPLIT"

class Produto(Base):
    __tablename__ = "produtos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    tipo = Column(Enum(TipoProduto), nullable=False)
    preco = Column(Numeric(10, 2), nullable=False)
    codigo_barras = Column(String(50), unique=True)
    codigo_interno = Column(String(20), unique=True)
    estoque_atual = Column(Integer, default=0)
    estoque_minimo = Column(Integer, default=0)
    estoque_maximo = Column(Integer, default=1000)
    controla_estoque = Column(Boolean, default=True)
    status = Column(Enum(StatusProduto), default=StatusProduto.ATIVO)
    categoria = Column(String(100))
    imagem_url = Column(String(500))
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    evento = relationship("Evento")
    empresa = relationship("Empresa")
    itens_venda = relationship("ItemVendaPDV", back_populates="produto")
    movimentos_estoque = relationship("MovimentoEstoque", back_populates="produto")

class Comanda(Base):
    __tablename__ = "comandas"
    
    id = Column(Integer, primary_key=True, index=True)
    numero_comanda = Column(String(20), unique=True, nullable=False)
    cpf_cliente = Column(String(14), index=True)
    nome_cliente = Column(String(255))
    tipo = Column(Enum(TipoComanda), nullable=False)
    codigo_rfid = Column(String(50), unique=True)
    qr_code = Column(String(100), unique=True)
    saldo_atual = Column(Numeric(10, 2), default=0)
    saldo_bloqueado = Column(Numeric(10, 2), default=0)
    status = Column(Enum(StatusComanda), default=StatusComanda.ATIVA)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    evento = relationship("Evento")
    empresa = relationship("Empresa")
    vendas = relationship("VendaPDV", back_populates="comanda")
    recargas = relationship("RecargaComanda", back_populates="comanda")

class VendaPDV(Base):
    __tablename__ = "vendas_pdv"
    
    id = Column(Integer, primary_key=True, index=True)
    numero_venda = Column(String(20), unique=True, nullable=False)
    cpf_cliente = Column(String(14), index=True)
    nome_cliente = Column(String(255))
    valor_total = Column(Numeric(10, 2), nullable=False)
    valor_desconto = Column(Numeric(10, 2), default=0)
    valor_final = Column(Numeric(10, 2), nullable=False)
    tipo_pagamento = Column(Enum(TipoPagamentoPDV), nullable=False)
    status = Column(Enum(StatusVendaPDV), default=StatusVendaPDV.PENDENTE)
    comanda_id = Column(Integer, ForeignKey("comandas.id"))
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    usuario_vendedor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    promoter_id = Column(Integer, ForeignKey("usuarios.id"))
    cupom_codigo = Column(String(50))
    observacoes = Column(Text)
    ip_origem = Column(String(45))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    comanda = relationship("Comanda", back_populates="vendas")
    evento = relationship("Evento")
    empresa = relationship("Empresa")
    vendedor = relationship("Usuario", foreign_keys=[usuario_vendedor_id])
    promoter = relationship("Usuario", foreign_keys=[promoter_id])
    itens = relationship("ItemVendaPDV", back_populates="venda")
    pagamentos = relationship("PagamentoPDV", back_populates="venda")

class ItemVendaPDV(Base):
    __tablename__ = "itens_venda_pdv"
    
    id = Column(Integer, primary_key=True, index=True)
    venda_id = Column(Integer, ForeignKey("vendas_pdv.id"), nullable=False)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    quantidade = Column(Integer, nullable=False)
    preco_unitario = Column(Numeric(10, 2), nullable=False)
    preco_total = Column(Numeric(10, 2), nullable=False)
    desconto_aplicado = Column(Numeric(10, 2), default=0)
    observacoes = Column(Text)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    venda = relationship("VendaPDV", back_populates="itens")
    produto = relationship("Produto", back_populates="itens_venda")

class PagamentoPDV(Base):
    __tablename__ = "pagamentos_pdv"
    
    id = Column(Integer, primary_key=True, index=True)
    venda_id = Column(Integer, ForeignKey("vendas_pdv.id"), nullable=False)
    tipo_pagamento = Column(Enum(TipoPagamentoPDV), nullable=False)
    valor = Column(Numeric(10, 2), nullable=False)
    codigo_transacao = Column(String(100))
    promoter_id = Column(Integer, ForeignKey("usuarios.id"))
    comissao_percentual = Column(Numeric(5, 2), default=0)
    valor_comissao = Column(Numeric(10, 2), default=0)
    status = Column(String(20), default="APROVADA")
    detalhes = Column(Text)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    venda = relationship("VendaPDV", back_populates="pagamentos")
    promoter = relationship("Usuario")

class RecargaComanda(Base):
    __tablename__ = "recargas_comanda"
    
    id = Column(Integer, primary_key=True, index=True)
    comanda_id = Column(Integer, ForeignKey("comandas.id"), nullable=False)
    valor = Column(Numeric(10, 2), nullable=False)
    tipo_pagamento = Column(Enum(TipoPagamentoPDV), nullable=False)
    codigo_transacao = Column(String(100))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    status = Column(String(20), default="APROVADA")
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    comanda = relationship("Comanda", back_populates="recargas")
    usuario = relationship("Usuario")

class MovimentoEstoque(Base):
    __tablename__ = "movimentos_estoque"
    
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    tipo_movimento = Column(String(20), nullable=False)  # entrada, saida, ajuste
    quantidade = Column(Integer, nullable=False)
    estoque_anterior = Column(Integer, nullable=False)
    estoque_atual = Column(Integer, nullable=False)
    motivo = Column(String(100))
    venda_id = Column(Integer, ForeignKey("vendas_pdv.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    produto = relationship("Produto", back_populates="movimentos_estoque")
    venda = relationship("VendaPDV")
    usuario = relationship("Usuario")

class CaixaPDV(Base):
    __tablename__ = "caixa_pdv"
    
    id = Column(Integer, primary_key=True, index=True)
    numero_caixa = Column(String(10), nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    usuario_operador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    valor_abertura = Column(Numeric(10, 2), default=0)
    valor_vendas = Column(Numeric(10, 2), default=0)
    valor_sangrias = Column(Numeric(10, 2), default=0)
    valor_fechamento = Column(Numeric(10, 2), default=0)
    status = Column(String(20), default="aberto")  # aberto, fechado
    data_abertura = Column(DateTime(timezone=True), server_default=func.now())
    data_fechamento = Column(DateTime(timezone=True))
    observacoes = Column(Text)
    
    evento = relationship("Evento")
    operador = relationship("Usuario")

class LogAuditoria(Base):
    __tablename__ = "logs_auditoria"
    
    id = Column(Integer, primary_key=True, index=True)
    cpf_usuario = Column(String(14), nullable=False, index=True)
    acao = Column(String(100), nullable=False)
    tabela_afetada = Column(String(50))
    registro_id = Column(Integer)
    dados_anteriores = Column(Text)
    dados_novos = Column(Text)
    ip_origem = Column(String(45))
    user_agent = Column(Text)
    evento_id = Column(Integer, ForeignKey("eventos.id"))
    promoter_id = Column(Integer, ForeignKey("usuarios.id"))
    status = Column(String(20), default="sucesso")
    detalhes = Column(Text)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    evento = relationship("Evento")
    promoter = relationship("Usuario")
