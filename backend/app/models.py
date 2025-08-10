from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric, Enum, Date, JSON, ARRAY, Decimal
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum
from datetime import datetime

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

class StatusColaborador(enum.Enum):
    ATIVO = "ativo"
    INATIVO = "inativo"
    SUSPENSO = "suspenso"

class StatusMesa(enum.Enum):
    DISPONIVEL = "disponivel"
    OCUPADA = "ocupada"
    RESERVADA = "reservada"
    BLOQUEADA = "bloqueada"
    MANUTENCAO = "manutencao"

class TipoArea(enum.Enum):
    BAR = "bar"
    PISTA = "pista"
    VIP = "vip"
    LOUNGE = "lounge"
    BANHEIRO = "banheiro"
    ENTRADA = "entrada"

class StatusComandaOperacao(enum.Enum):
    ABERTA = "aberta"
    BLOQUEADA = "bloqueada"
    FECHADA = "fechada"
    CANCELADA = "cancelada"

class TipoBloqueio(enum.Enum):
    CLIENTE = "cliente"
    MESA = "mesa"
    COMANDA = "comanda"
    AREA = "area"

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
    ultimo_login = Column(DateTime(timezone=True))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    eventos_criados = relationship("Evento", back_populates="criador")
    promocoes = relationship("PromoterEvento", back_populates="promoter")
    transacoes = relationship("Transacao", back_populates="usuario")
    checkins = relationship("Checkin", back_populates="usuario")
    colaboradores_criados = relationship("Colaborador", back_populates="criador")

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
    descricao = Column(Text)
    codigo_cupom = Column(String(50))
    desconto_percentual = Column(Numeric(5, 2), default=0)
    
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
    qr_code_ticket = Column(String(100), unique=True)
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
    
    categoria_estoque_id = Column(Integer, ForeignKey("categorias_estoque.id"))
    localizacao = Column(String(100))
    peso = Column(Numeric(8, 3))
    dimensoes = Column(JSON)
    data_validade = Column(Date)
    lote = Column(String(50))
    custo_medio = Column(Numeric(10, 2))
    margem_lucro = Column(Numeric(5, 2))
    giro_estoque = Column(Numeric(8, 2))
    abc_classificacao = Column(String(1))
    sazonalidade = Column(JSON)
    
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    evento = relationship("Evento")
    empresa = relationship("Empresa")
    categoria_estoque = relationship("CategoriaEstoque", back_populates="produtos")
    itens_venda = relationship("ItemVendaPDV", back_populates="produto")
    movimentos_estoque = relationship("MovimentoEstoque", back_populates="produto")
    previsoes_demanda = relationship("PrevisaoDemanda")
    alertas = relationship("AlertaEstoque")

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


class TipoMovimentacaoFinanceira(enum.Enum):
    ENTRADA = "entrada"
    SAIDA = "saida"
    AJUSTE = "ajuste"
    REPASSE_PROMOTER = "repasse_promoter"
    RECEITA_VENDAS = "receita_vendas"
    RECEITA_LISTAS = "receita_listas"


class StatusMovimentacaoFinanceira(enum.Enum):
    PENDENTE = "pendente"
    APROVADA = "aprovada"
    CANCELADA = "cancelada"


class MovimentacaoFinanceira(Base):
    __tablename__ = "movimentacoes_financeiras"
    
    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    tipo = Column(Enum(TipoMovimentacaoFinanceira), nullable=False)
    categoria = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=False)
    valor = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(StatusMovimentacaoFinanceira), default=StatusMovimentacaoFinanceira.PENDENTE)
    
    usuario_responsavel_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    promoter_id = Column(Integer, ForeignKey("usuarios.id"))
    
    comprovante_url = Column(String(500))
    numero_documento = Column(String(100))
    
    observacoes = Column(Text)
    data_vencimento = Column(Date)
    data_pagamento = Column(Date)
    metodo_pagamento = Column(String(50))
    
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    evento = relationship("Evento")
    usuario_responsavel = relationship("Usuario", foreign_keys=[usuario_responsavel_id])
    promoter = relationship("Usuario", foreign_keys=[promoter_id])


class CaixaEvento(Base):
    __tablename__ = "caixas_eventos"
    
    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    data_abertura = Column(DateTime(timezone=True), server_default=func.now())
    data_fechamento = Column(DateTime(timezone=True))
    
    saldo_inicial = Column(Numeric(10, 2), default=0)
    total_entradas = Column(Numeric(10, 2), default=0)
    total_saidas = Column(Numeric(10, 2), default=0)
    total_vendas_pdv = Column(Numeric(10, 2), default=0)
    total_vendas_listas = Column(Numeric(10, 2), default=0)
    saldo_final = Column(Numeric(10, 2), default=0)
    
    status = Column(String(20), default="aberto")
    usuario_abertura_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    usuario_fechamento_id = Column(Integer, ForeignKey("usuarios.id"))
    
    observacoes_abertura = Column(Text)
    observacoes_fechamento = Column(Text)
    
    evento = relationship("Evento")
    usuario_abertura = relationship("Usuario", foreign_keys=[usuario_abertura_id])
    usuario_fechamento = relationship("Usuario", foreign_keys=[usuario_fechamento_id])

class TipoConquista(enum.Enum):
    VENDAS = "vendas"
    PRESENCA = "presenca"
    FIDELIDADE = "fidelidade"
    CRESCIMENTO = "crescimento"
    ESPECIAL = "especial"

class NivelBadge(enum.Enum):
    BRONZE = "bronze"
    PRATA = "prata"
    OURO = "ouro"
    PLATINA = "platina"
    DIAMANTE = "diamante"
    LENDA = "lenda"

class Conquista(Base):
    __tablename__ = "conquistas"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=False)
    tipo = Column(Enum(TipoConquista), nullable=False)
    criterio_valor = Column(Integer, nullable=False)
    badge_nivel = Column(Enum(NivelBadge), nullable=False)
    icone = Column(String(50))
    ativa = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

class PromoterConquista(Base):
    __tablename__ = "promoter_conquistas"
    
    id = Column(Integer, primary_key=True, index=True)
    promoter_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    conquista_id = Column(Integer, ForeignKey("conquistas.id"), nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"))
    valor_alcancado = Column(Integer, nullable=False)
    data_conquista = Column(DateTime(timezone=True), server_default=func.now())
    notificado = Column(Boolean, default=False)
    
    promoter = relationship("Usuario")
    conquista = relationship("Conquista")
    evento = relationship("Evento")

class MetricaPromoter(Base):
    __tablename__ = "metricas_promoters"
    
    id = Column(Integer, primary_key=True, index=True)
    promoter_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"))
    periodo_inicio = Column(Date, nullable=False)
    periodo_fim = Column(Date, nullable=False)
    
    total_vendas = Column(Integer, default=0)
    receita_gerada = Column(Numeric(10, 2), default=0)
    total_convidados = Column(Integer, default=0)
    total_presentes = Column(Integer, default=0)
    taxa_presenca = Column(Numeric(5, 2), default=0)
    taxa_conversao = Column(Numeric(5, 2), default=0)
    crescimento_vendas = Column(Numeric(5, 2), default=0)
    
    posicao_vendas = Column(Integer)
    posicao_presenca = Column(Integer)
    posicao_geral = Column(Integer)
    badge_atual = Column(Enum(NivelBadge), default=NivelBadge.BRONZE)
    
    atualizado_em = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    promoter = relationship("Usuario")
    evento = relationship("Evento")

class Cargo(Base):
    __tablename__ = "cargos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), unique=True, nullable=False)
    descricao = Column(Text)
    nivel_hierarquico = Column(Integer, default=4)
    permissoes = Column(JSON, default={})
    ativo = Column(Boolean, default=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    colaboradores = relationship("Colaborador", back_populates="cargo")
    empresa = relationship("Empresa")

class Colaborador(Base):
    __tablename__ = "colaboradores"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    cpf = Column(String(14), unique=True, nullable=False)
    telefone = Column(String(20))
    cargo_id = Column(Integer, ForeignKey("cargos.id"), nullable=False)
    data_admissao = Column(Date, nullable=False)
    status = Column(Enum(StatusColaborador), default=StatusColaborador.ATIVO)
    foto_perfil = Column(String(500))
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    criado_por = Column(Integer, ForeignKey("usuarios.id"))
    
    cargo = relationship("Cargo", back_populates="colaboradores")
    empresa = relationship("Empresa")
    criador = relationship("Usuario", back_populates="colaboradores_criados")

class CategoriaEstoque(Base):
    __tablename__ = "categorias_estoque"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)
    icone = Column(String(50))
    cor = Column(String(7))
    ativa = Column(Boolean, default=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    produtos = relationship("Produto", back_populates="categoria_estoque")
    empresa = relationship("Empresa")

class PrevisaoDemanda(Base):
    __tablename__ = "previsoes_demanda"
    
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    data_previsao = Column(Date, nullable=False)
    quantidade_prevista = Column(Integer, nullable=False)
    confianca_percentual = Column(Numeric(5, 2), nullable=False)
    fatores_influencia = Column(JSON)
    algoritmo_usado = Column(String(50))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    produto = relationship("Produto")

class AlertaEstoque(Base):
    __tablename__ = "alertas_estoque"
    
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    tipo_alerta = Column(String(50), nullable=False)
    nivel_criticidade = Column(String(20), nullable=False)
    mensagem = Column(Text, nullable=False)
    ativo = Column(Boolean, default=True)
    data_resolucao = Column(DateTime(timezone=True))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    produto = relationship("Produto")

class ReposicaoAutomatica(Base):
    __tablename__ = "reposicoes_automaticas"
    
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    fornecedor_id = Column(Integer, ForeignKey("fornecedores.id"))
    quantidade_sugerida = Column(Integer, nullable=False)
    ponto_reposicao = Column(Integer, nullable=False)
    lote_economico = Column(Integer, nullable=False)
    status = Column(String(20), default="pendente")
    aprovado_por = Column(Integer, ForeignKey("usuarios.id"))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    produto = relationship("Produto")
    aprovador = relationship("Usuario")

class Fornecedor(Base):
    __tablename__ = "fornecedores"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    cnpj = Column(String(18), unique=True)
    email = Column(String(255))
    telefone = Column(String(20))
    endereco = Column(Text)
    lead_time_medio = Column(Integer, default=7)
    avaliacao = Column(Numeric(3, 2), default=5.0)
    ativo = Column(Boolean, default=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    empresa = relationship("Empresa")
    produtos = relationship("ProdutoFornecedor", back_populates="fornecedor")

class ProdutoFornecedor(Base):
    __tablename__ = "produtos_fornecedores"
    
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    fornecedor_id = Column(Integer, ForeignKey("fornecedores.id"), nullable=False)
    codigo_fornecedor = Column(String(50))
    preco_custo = Column(Numeric(10, 2))
    lote_minimo = Column(Integer, default=1)
    lead_time = Column(Integer, default=7)
    preferencial = Column(Boolean, default=False)
    
    produto = relationship("Produto")
    fornecedor = relationship("Fornecedor", back_populates="produtos")

class ClienteEvento(Base):
    __tablename__ = "clientes_eventos"
    
    id = Column(Integer, primary_key=True, index=True)
    cpf = Column(String(11), unique=True, nullable=False, index=True)
    nome_completo = Column(String(255), nullable=False)
    nome_social = Column(String(255))
    data_nascimento = Column(Date)
    nome_mae = Column(String(255))
    telefone = Column(String(20))
    email = Column(String(255))
    endereco = Column(JSON)
    genero = Column(String(20))
    status_cpf = Column(String(20), default='nao_verificado')
    data_ultima_consulta = Column(DateTime(timezone=True))
    situacao_receita = Column(String(50))
    foto_url = Column(String(500))
    dados_receita = Column(JSON)
    lgpd_aceito = Column(Boolean, default=False)
    lgpd_data = Column(DateTime(timezone=True))
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())

class ValidacaoAcesso(Base):
    __tablename__ = "validacoes_acesso"
    
    id = Column(Integer, primary_key=True, index=True)
    checkin_id = Column(Integer, ForeignKey("checkins.id"))
    tentativa_cpf_prefixo = Column(String(3))
    tentativa_qr_code = Column(String(255))
    sucesso = Column(Boolean)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String(45))
    geolocation = Column(JSON)
    motivo_falha = Column(String(100))
    dispositivo_info = Column(JSON)
    funcionario_validador = Column(Integer, ForeignKey("usuarios.id"))
    
    checkin = relationship("Checkin")
    funcionario = relationship("Usuario")

class EquipamentoEvento(Base):
    __tablename__ = "equipamentos_eventos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)
    modelo = Column(String(100))
    numero_serie = Column(String(100), unique=True)
    ip_address = Column(String(45))
    mac_address = Column(String(17))
    localizacao = Column(String(255))
    status = Column(String(20), default='ativo')
    configuracoes = Column(JSON)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    evento = relationship("Evento")
    empresa = relationship("Empresa")

class SessaoOperador(Base):
    __tablename__ = "sessoes_operadores"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    equipamento_id = Column(Integer, ForeignKey("equipamentos_eventos.id"))
    inicio_sessao = Column(DateTime(timezone=True), server_default=func.now())
    fim_sessao = Column(DateTime(timezone=True))
    localizacao_gps = Column(JSON)
    autenticacao_biometrica = Column(Boolean, default=False)
    pin_acesso = Column(String(6))
    status = Column(String(20), default='ativa')
    
    usuario = relationship("Usuario")
    evento = relationship("Evento")
    equipamento = relationship("EquipamentoEvento")

class PrevisaoIA(Base):
    __tablename__ = "previsoes_ia"
    
    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    tipo_previsao = Column(String(50), nullable=False)
    data_previsao = Column(Date, nullable=False)
    valor_previsto = Column(Numeric(10, 2), nullable=False)
    confianca_percentual = Column(Numeric(5, 2), nullable=False)
    algoritmo_usado = Column(String(50))
    fatores_influencia = Column(JSON)
    dados_historicos = Column(JSON)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    evento = relationship("Evento")

class LayoutEvento(Base):
    __tablename__ = "layout_evento"
    
    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    nome = Column(String(255), nullable=False)
    largura = Column(Integer, nullable=False)
    altura = Column(Integer, nullable=False)
    escala = Column(Numeric(5, 2), default=1.0)
    configuracao = Column(JSON, default={})
    imagem_fundo = Column(String(500))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    evento = relationship("Evento")
    areas = relationship("AreaEvento", back_populates="layout")

class AreaEvento(Base):
    __tablename__ = "areas_evento"
    
    id = Column(Integer, primary_key=True, index=True)
    layout_id = Column(Integer, ForeignKey("layout_evento.id"), nullable=False)
    nome = Column(String(255), nullable=False)
    tipo = Column(Enum(TipoArea), nullable=False)
    posicao_x = Column(Integer, nullable=False)
    posicao_y = Column(Integer, nullable=False)
    largura = Column(Integer, nullable=False)
    altura = Column(Integer, nullable=False)
    capacidade_maxima = Column(Integer, default=0)
    cor = Column(String(7), default='#4299e1')
    ativa = Column(Boolean, default=True)
    configuracoes = Column(JSON, default={})
    restricoes = Column(JSON, default=[])
    responsavel_id = Column(Integer, ForeignKey("usuarios.id"))
    
    layout = relationship("LayoutEvento", back_populates="areas")
    responsavel = relationship("Usuario")
    mesas = relationship("Mesa", back_populates="area")

class Mesa(Base):
    __tablename__ = "mesas"
    
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas_evento.id"), nullable=False)
    numero = Column(String(20), unique=True, nullable=False)
    nome = Column(String(255))
    tipo = Column(String(50), default='comum')
    capacidade_pessoas = Column(Integer, default=4)
    posicao_x = Column(Integer, nullable=False)
    posicao_y = Column(Integer, nullable=False)
    largura = Column(Integer, default=100)
    altura = Column(Integer, default=100)
    formato = Column(String(20), default='retangular')
    status = Column(Enum(StatusMesa), default=StatusMesa.DISPONIVEL)
    valor_minimo = Column(Numeric(10, 2), default=0)
    taxa_servico = Column(Numeric(5, 2), default=10)
    observacoes = Column(Text)
    configuracoes = Column(JSON, default={})
    criada_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizada_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    area = relationship("AreaEvento", back_populates="mesas")
    comandas = relationship("ComandaOperacao", back_populates="mesa")

class ComandaOperacao(Base):
    __tablename__ = "comandas_operacao"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    mesa_id = Column(Integer, ForeignKey("mesas.id"))
    numero_comanda = Column(String(20), unique=True, nullable=False)
    cliente_principal_cpf = Column(String(11), ForeignKey("clientes_eventos.cpf"))
    status = Column(Enum(StatusComandaOperacao), default=StatusComandaOperacao.ABERTA)
    tipo = Column(String(20), default='mesa')
    data_abertura = Column(DateTime(timezone=True), server_default=func.now())
    data_fechamento = Column(DateTime(timezone=True))
    valor_total = Column(Numeric(10, 2), default=0)
    valor_pago = Column(Numeric(10, 2), default=0)
    valor_pendente = Column(Numeric(10, 2), default=0)
    desconto_aplicado = Column(Numeric(10, 2), default=0)
    taxa_servico = Column(Numeric(10, 2), default=0)
    observacoes = Column(Text)
    funcionario_abertura = Column(Integer, ForeignKey("usuarios.id"))
    funcionario_fechamento = Column(Integer, ForeignKey("usuarios.id"))
    configuracoes = Column(JSON, default={})
    
    evento = relationship("Evento")
    mesa = relationship("Mesa", back_populates="comandas")
    cliente_principal = relationship("ClienteEvento")
    funcionario_abertura_rel = relationship("Usuario", foreign_keys=[funcionario_abertura])
    funcionario_fechamento_rel = relationship("Usuario", foreign_keys=[funcionario_fechamento])
    participantes = relationship("ComandaParticipante", back_populates="comanda")
    itens = relationship("ComandaItem", back_populates="comanda")

class ComandaParticipante(Base):
    __tablename__ = "comanda_participantes"
    
    id = Column(Integer, primary_key=True, index=True)
    comanda_id = Column(Integer, ForeignKey("comandas_operacao.id"), nullable=False)
    cliente_cpf = Column(String(11), ForeignKey("clientes_eventos.cpf"))
    nome = Column(String(255), nullable=False)
    telefone = Column(String(20))
    entrada_em = Column(DateTime(timezone=True), server_default=func.now())
    saida_em = Column(DateTime(timezone=True))
    consumo_individual = Column(Numeric(10, 2), default=0)
    ativo = Column(Boolean, default=True)
    
    comanda = relationship("ComandaOperacao", back_populates="participantes")
    cliente = relationship("ClienteEvento")

class ComandaItem(Base):
    __tablename__ = "comanda_itens"
    
    id = Column(Integer, primary_key=True, index=True)
    comanda_id = Column(Integer, ForeignKey("comandas_operacao.id"), nullable=False)
    produto_id = Column(Integer)
    nome_produto = Column(String(255), nullable=False)
    categoria = Column(String(100))
    quantidade = Column(Integer, nullable=False, default=1)
    valor_unitario = Column(Numeric(10, 2), nullable=False)
    valor_total = Column(Numeric(10, 2), nullable=False)
    desconto = Column(Numeric(10, 2), default=0)
    cliente_solicitante_cpf = Column(String(11))
    funcionario_id = Column(Integer, ForeignKey("usuarios.id"))
    data_pedido = Column(DateTime(timezone=True), server_default=func.now())
    data_entrega = Column(DateTime(timezone=True))
    status = Column(String(20), default='pedido')
    observacoes = Column(Text)
    
    comanda = relationship("ComandaOperacao", back_populates="itens")
    funcionario = relationship("Usuario")

class Bloqueio(Base):
    __tablename__ = "bloqueios"
    
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(Enum(TipoBloqueio), nullable=False)
    referencia_id = Column(String(50), nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"))
    motivo = Column(String(255), nullable=False)
    detalhes = Column(Text)
    bloqueado_por = Column(Integer, ForeignKey("usuarios.id"))
    bloqueado_em = Column(DateTime(timezone=True), server_default=func.now())
    desbloqueado_por = Column(Integer, ForeignKey("usuarios.id"))
    desbloqueado_em = Column(DateTime(timezone=True))
    ativo = Column(Boolean, default=True)
    temporario = Column(Boolean, default=False)
    expira_em = Column(DateTime(timezone=True))
    
    evento = relationship("Evento")
    bloqueado_por_rel = relationship("Usuario", foreign_keys=[bloqueado_por])
    desbloqueado_por_rel = relationship("Usuario", foreign_keys=[desbloqueado_por])

class GrupoCartao(Base):
    __tablename__ = "grupos_cartoes"
    
    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    cor = Column(String(7), default='#4299e1')
    limite_consumo = Column(Numeric(10, 2), default=0)
    desconto_percentual = Column(Numeric(5, 2), default=0)
    beneficios = Column(JSON, default=[])
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    evento = relationship("Evento")
    cartoes = relationship("CartaoEvento", back_populates="grupo")

class CartaoEvento(Base):
    __tablename__ = "cartoes_evento"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    grupo_id = Column(Integer, ForeignKey("grupos_cartoes.id"))
    numero_cartao = Column(String(20), unique=True, nullable=False)
    cliente_cpf = Column(String(11), ForeignKey("clientes_eventos.cpf"))
    qr_code = Column(String(255), unique=True)
    status = Column(String(20), default='ativo')
    saldo_credito = Column(Numeric(10, 2), default=0)
    limite_consumo = Column(Numeric(10, 2), default=0)
    consumo_total = Column(Numeric(10, 2), default=0)
    data_emissao = Column(DateTime(timezone=True), server_default=func.now())
    data_bloqueio = Column(DateTime(timezone=True))
    motivo_bloqueio = Column(Text)
    configuracoes = Column(JSON, default={})
    
    evento = relationship("Evento")
    grupo = relationship("GrupoCartao", back_populates="cartoes")
    cliente = relationship("ClienteEvento")

class ProgramaFidelidade(Base):
    __tablename__ = "programas_fidelidade"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    tipo = Column(String(50), default='pontos')
    moeda_virtual = Column(String(50), default='pontos')
    taxa_conversao = Column(Numeric(10, 4), default=1.0)
    pontos_por_real = Column(Numeric(10, 2), default=1.0)
    valor_ponto = Column(Numeric(10, 4), default=0.01)
    multiplicador_base = Column(Numeric(5, 2), default=1.0)
    ativo = Column(Boolean, default=True)
    data_inicio = Column(DateTime(timezone=True), server_default=func.now())
    data_fim = Column(DateTime(timezone=True))
    configuracoes = Column(JSON, default={})
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    empresa = relationship("Empresa")
    niveis = relationship("NivelFidelidade", back_populates="programa")
    carteiras = relationship("CarteiraFidelidade", back_populates="programa")

class NivelFidelidade(Base):
    __tablename__ = "niveis_fidelidade"
    
    id = Column(Integer, primary_key=True, index=True)
    programa_id = Column(Integer, ForeignKey("programas_fidelidade.id"), nullable=False)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    cor = Column(String(7), default='#4299e1')
    icone = Column(String(50))
    pontos_minimos = Column(Integer, nullable=False, default=0)
    pontos_maximos = Column(Integer)
    multiplicador_pontos = Column(Numeric(5, 2), default=1.0)
    desconto_percentual = Column(Numeric(5, 2), default=0)
    cashback_percentual = Column(Numeric(5, 2), default=0)
    beneficios = Column(JSON, default=[])
    ordem = Column(Integer, nullable=False)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    programa = relationship("ProgramaFidelidade", back_populates="niveis")
    carteiras = relationship("CarteiraFidelidade", back_populates="nivel")

class CarteiraFidelidade(Base):
    __tablename__ = "carteira_fidelidade"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, nullable=False)
    programa_id = Column(Integer, ForeignKey("programas_fidelidade.id"), nullable=False)
    cliente_cpf = Column(String(11), ForeignKey("clientes_eventos.cpf"), nullable=False)
    nivel_id = Column(Integer, ForeignKey("niveis_fidelidade.id"), nullable=False)
    pontos_atuais = Column(Integer, default=0)
    pontos_totais_ganhos = Column(Integer, default=0)
    pontos_totais_resgatados = Column(Integer, default=0)
    saldo_cashback = Column(Numeric(10, 2), default=0)
    status = Column(String(20), default='ativo')
    data_ultimo_uso = Column(DateTime(timezone=True))
    data_expiracao = Column(DateTime(timezone=True))
    configuracoes = Column(JSON, default={})
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    programa = relationship("ProgramaFidelidade", back_populates="carteiras")
    cliente = relationship("ClienteEvento")
    nivel = relationship("NivelFidelidade", back_populates="carteiras")
    transacoes = relationship("TransacaoFidelidade", back_populates="carteira")

class TransacaoFidelidade(Base):
    __tablename__ = "transacoes_fidelidade"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, nullable=False)
    carteira_id = Column(Integer, ForeignKey("carteira_fidelidade.id"), nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"))
    tipo = Column(String(20), nullable=False)
    pontos_transacao = Column(Integer, nullable=False)
    valor_monetario = Column(Numeric(10, 2))
    multiplicador_aplicado = Column(Numeric(5, 2), default=1.0)
    descricao = Column(String(500))
    referencia_externa = Column(String(255))
    campanha_id = Column(Integer, ForeignKey("campanhas_marketing.id"))
    promocao_id = Column(Integer, ForeignKey("promocoes.id"))
    funcionario_id = Column(Integer, ForeignKey("usuarios.id"))
    metadados = Column(JSON, default={})
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    carteira = relationship("CarteiraFidelidade", back_populates="transacoes")
    evento = relationship("Evento")
    funcionario = relationship("Usuario")

class SegmentoCliente(Base):
    __tablename__ = "segmentos_cliente"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    tipo = Column(String(50), default='manual')
    criterios = Column(JSON, default={})
    cor = Column(String(7), default='#4299e1')
    icone = Column(String(50))
    ativo = Column(Boolean, default=True)
    automatico = Column(Boolean, default=False)
    frequencia_atualizacao = Column(String(20), default='diario')
    ultima_atualizacao = Column(DateTime(timezone=True))
    total_clientes = Column(Integer, default=0)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    empresa = relationship("Empresa")
    clientes = relationship("ClienteSegmento", back_populates="segmento")

class ClienteSegmento(Base):
    __tablename__ = "cliente_segmentos"
    
    id = Column(Integer, primary_key=True, index=True)
    segmento_id = Column(Integer, ForeignKey("segmentos_cliente.id"), nullable=False)
    cliente_cpf = Column(String(11), ForeignKey("clientes_eventos.cpf"), nullable=False)
    score_segmentacao = Column(Numeric(5, 2))
    data_inclusao = Column(DateTime(timezone=True), server_default=func.now())
    data_exclusao = Column(DateTime(timezone=True))
    ativo = Column(Boolean, default=True)
    metadados = Column(JSON, default={})
    
    segmento = relationship("SegmentoCliente", back_populates="clientes")
    cliente = relationship("ClienteEvento")

class CampanhaMarketing(Base):
    __tablename__ = "campanhas_marketing"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, nullable=False)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    tipo = Column(String(50), nullable=False)
    canal = Column(String(50), nullable=False)
    status = Column(String(20), default='rascunho')
    segmento_id = Column(Integer, ForeignKey("segmentos_cliente.id"))
    template_id = Column(Integer, ForeignKey("templates_mensagem.id"))
    data_inicio = Column(DateTime(timezone=True))
    data_fim = Column(DateTime(timezone=True))
    data_envio = Column(DateTime(timezone=True))
    frequencia = Column(String(20))
    objetivo = Column(String(100))
    orcamento = Column(Numeric(10, 2))
    custo_total = Column(Numeric(10, 2), default=0)
    total_envios = Column(Integer, default=0)
    total_aberturas = Column(Integer, default=0)
    total_cliques = Column(Integer, default=0)
    total_conversoes = Column(Integer, default=0)
    receita_gerada = Column(Numeric(10, 2), default=0)
    configuracoes = Column(JSON, default={})
    criado_por = Column(Integer, ForeignKey("usuarios.id"))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    empresa = relationship("Empresa")
    segmento = relationship("SegmentoCliente")
    template = relationship("TemplateMensagem")
    criador = relationship("Usuario")

class TemplateMensagem(Base):
    __tablename__ = "templates_mensagem"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    tipo = Column(String(50), nullable=False)
    canal = Column(String(50), nullable=False)
    assunto = Column(String(500))
    conteudo = Column(Text, nullable=False)
    variaveis = Column(JSON, default=[])
    configuracoes = Column(JSON, default={})
    ativo = Column(Boolean, default=True)
    criado_por = Column(Integer, ForeignKey("usuarios.id"))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    empresa = relationship("Empresa")
    criador = relationship("Usuario")
    campanhas = relationship("CampanhaMarketing", back_populates="template")

class ListaEvento(Base):
    __tablename__ = "listas_eventos"
    
    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    tipo = Column(String(50), default='geral')
    capacidade_maxima = Column(Integer)
    preco = Column(Numeric(10, 2), default=0)
    data_inicio_vendas = Column(DateTime(timezone=True))
    data_fim_vendas = Column(DateTime(timezone=True))
    ativa = Column(Boolean, default=True)
    publica = Column(Boolean, default=True)
    requer_aprovacao = Column(Boolean, default=False)
    configuracoes = Column(JSON, default={})
    total_participantes = Column(Integer, default=0)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    evento = relationship("Evento")
    participantes = relationship("ListaParticipante", back_populates="lista")

class ListaParticipante(Base):
    __tablename__ = "lista_participantes"
    
    id = Column(Integer, primary_key=True, index=True)
    lista_id = Column(Integer, ForeignKey("listas_eventos.id"), nullable=False)
    cliente_cpf = Column(String(11), ForeignKey("clientes_eventos.cpf"), nullable=False)
    status = Column(String(20), default='confirmado')
    data_inscricao = Column(DateTime(timezone=True), server_default=func.now())
    data_aprovacao = Column(DateTime(timezone=True))
    valor_pago = Column(Numeric(10, 2), default=0)
    observacoes = Column(Text)
    metadados = Column(JSON, default={})
    
    lista = relationship("ListaEvento", back_populates="participantes")
    cliente = relationship("ClienteEvento")

class Promocao(Base):
    __tablename__ = "promocoes"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, nullable=False)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    tipo = Column(String(50), nullable=False)
    codigo = Column(String(50), unique=True)
    desconto_percentual = Column(Numeric(5, 2))
    desconto_valor = Column(Numeric(10, 2))
    valor_minimo = Column(Numeric(10, 2))
    limite_uso_total = Column(Integer)
    limite_uso_cliente = Column(Integer, default=1)
    usos_atuais = Column(Integer, default=0)
    data_inicio = Column(DateTime(timezone=True), nullable=False)
    data_fim = Column(DateTime(timezone=True), nullable=False)
    ativa = Column(Boolean, default=True)
    segmento_id = Column(Integer, ForeignKey("segmentos_cliente.id"))
    configuracoes = Column(JSON, default={})
    criado_por = Column(Integer, ForeignKey("usuarios.id"))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    empresa = relationship("Empresa")
    segmento = relationship("SegmentoCliente")
    criador = relationship("Usuario")
    usos = relationship("CupomUso", back_populates="promocao")

class CupomUso(Base):
    __tablename__ = "cupom_uso"
    
    id = Column(Integer, primary_key=True, index=True)
    promocao_id = Column(Integer, ForeignKey("promocoes.id"), nullable=False)
    cliente_cpf = Column(String(11), ForeignKey("clientes_eventos.cpf"), nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"))
    codigo_usado = Column(String(50), nullable=False)
    valor_desconto_aplicado = Column(Numeric(10, 2), nullable=False)
    valor_original = Column(Numeric(10, 2), nullable=False)
    valor_final = Column(Numeric(10, 2), nullable=False)
    data_uso = Column(DateTime(timezone=True), server_default=func.now())
    funcionario_id = Column(Integer, ForeignKey("usuarios.id"))
    metadados = Column(JSON, default={})
    
    promocao = relationship("Promocao", back_populates="usos")
    cliente = relationship("ClienteEvento")
    evento = relationship("Evento")
    funcionario = relationship("Usuario")

class AnalyticsEvento(Base):
    __tablename__ = "analytics_eventos"
    
    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    data_evento = Column(Date, nullable=False)
    total_participantes = Column(Integer, default=0)
    total_receita = Column(Numeric(10, 2), default=0)
    ticket_medio = Column(Numeric(10, 2), default=0)
    taxa_conversao = Column(Numeric(5, 2), default=0)
    nps_score = Column(Numeric(3, 1))
    satisfacao_media = Column(Numeric(3, 1))
    tempo_permanencia_medio = Column(Integer)
    pontos_distribuidos = Column(Integer, default=0)
    promocoes_utilizadas = Column(Integer, default=0)
    campanhas_ativas = Column(Integer, default=0)
    segmentos_impactados = Column(JSON, default=[])
    metricas_detalhadas = Column(JSON, default={})
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    evento = relationship("Evento")

class WorkflowMarketing(Base):
    __tablename__ = "workflows_marketing"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    tipo = Column(String(50), nullable=False)
    trigger_evento = Column(String(100), nullable=False)
    condicoes = Column(JSON, default={})
    acoes = Column(JSON, default=[])
    ativo = Column(Boolean, default=True)
    prioridade = Column(Integer, default=1)
    delay_execucao = Column(Integer, default=0)
    total_execucoes = Column(Integer, default=0)
    taxa_sucesso = Column(Numeric(5, 2), default=0)
    criado_por = Column(Integer, ForeignKey("usuarios.id"))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    empresa = relationship("Empresa")
    criador = relationship("Usuario")
    execucoes = relationship("WorkflowExecucao", back_populates="workflow")

class WorkflowExecucao(Base):
    __tablename__ = "workflow_execucoes"
    
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows_marketing.id"), nullable=False)
    cliente_cpf = Column(String(11), ForeignKey("clientes_eventos.cpf"))
    evento_id = Column(Integer, ForeignKey("eventos.id"))
    status = Column(String(20), default='pendente')
    dados_entrada = Column(JSON, default={})
    dados_saida = Column(JSON, default={})
    erro_detalhes = Column(Text)
    tempo_execucao = Column(Integer)
    data_agendamento = Column(DateTime(timezone=True))
    data_inicio = Column(DateTime(timezone=True))
    data_fim = Column(DateTime(timezone=True))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    workflow = relationship("WorkflowMarketing", back_populates="execucoes")
    cliente = relationship("ClienteEvento")
    evento = relationship("Evento")


class EmpresaERP(Base):
    __tablename__ = "empresas_erp"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, nullable=False)
    razao_social = Column(String(255), nullable=False)
    nome_fantasia = Column(String(255))
    cnpj = Column(String(18), unique=True, nullable=False)
    inscricao_estadual = Column(String(20))
    inscricao_municipal = Column(String(20))
    endereco = Column(JSON, nullable=False)
    contatos = Column(JSON, default={})
    configuracoes_fiscais = Column(JSON, default={})
    regime_tributario = Column(String(50), default='simples_nacional')
    porte = Column(String(20), default='micro')
    ativo = Column(Boolean, default=True)
    data_abertura = Column(Date)
    capital_social = Column(Decimal(15,2), default=0)
    atividade_principal = Column(String(10))
    atividades_secundarias = Column(ARRAY(Text))
    certificado_digital = Column(JSON)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow)

class PlanoContasIA(Base):
    __tablename__ = "plano_contas_ia"
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey('empresas_erp.id'))
    codigo = Column(String(20), unique=True, nullable=False)
    nome = Column(String(255), nullable=False)
    tipo = Column(String(20), nullable=False)
    categoria = Column(String(50))
    subcategoria = Column(String(50))
    conta_pai_id = Column(Integer, ForeignKey('plano_contas_ia.id'))
    nivel = Column(Integer, default=1)
    aceita_lancamento = Column(Boolean, default=True)
    natureza = Column(String(10), default='debito')
    dre_grupo = Column(String(50))
    balanco_grupo = Column(String(50))
    tributacao = Column(JSON, default={})
    centro_custo_obrigatorio = Column(Boolean, default=False)
    classificacao_ia = Column(String(50))
    score_relevancia = Column(Integer, default=0)
    sugestoes_ia = Column(JSON, default={})
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

class FluxoCaixaPreditivo(Base):
    __tablename__ = "fluxo_caixa_preditivo"
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey('empresas_erp.id'))
    data_referencia = Column(Date, nullable=False)
    tipo = Column(String(20), nullable=False)
    categoria = Column(String(50), nullable=False)
    descricao = Column(Text)
    valor_entrada = Column(Decimal(15,2), default=0)
    valor_saida = Column(Decimal(15,2), default=0)
    saldo_acumulado = Column(Decimal(15,2), default=0)
    origem = Column(String(50))
    confiabilidade = Column(Integer, default=100)
    cenario = Column(String(20), default='realista')
    modelo_ia_usado = Column(String(50))
    fatores_influencia = Column(JSON, default={})
    intervalo_confianca = Column(JSON, default={})
    observacoes = Column(Text)
    metadata = Column(JSON, default={})
    criado_em = Column(DateTime, default=datetime.utcnow)

class ConciliacaoBancariaIA(Base):
    __tablename__ = "conciliacao_bancaria_ia"
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey('empresas_erp.id'))
    banco_conta_id = Column(Integer)
    data_conciliacao = Column(Date, nullable=False)
    extrato_item_id = Column(String(100))
    lancamento_id = Column(Integer)
    tipo_matching = Column(String(20))
    score_confianca = Column(Decimal(5,2))
    status = Column(String(20), default='pendente')
    observacoes_ia = Column(Text)
    aprovado_por = Column(Integer)
    aprovado_em = Column(DateTime)
    discrepancias = Column(JSON, default={})
    sugestoes_correcao = Column(JSON, default={})
    metadata = Column(JSON, default={})
    criado_em = Column(DateTime, default=datetime.utcnow)

class DREAutomatico(Base):
    __tablename__ = "dre_automatico"
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey('empresas_erp.id'))
    periodo_inicio = Column(Date, nullable=False)
    periodo_fim = Column(Date, nullable=False)
    receita_bruta = Column(Decimal(15,2), default=0)
    deducoes_receita = Column(Decimal(15,2), default=0)
    receita_liquida = Column(Decimal(15,2), default=0)
    custo_vendas = Column(Decimal(15,2), default=0)
    lucro_bruto = Column(Decimal(15,2), default=0)
    despesas_operacionais = Column(Decimal(15,2), default=0)
    ebitda = Column(Decimal(15,2), default=0)
    lucro_liquido = Column(Decimal(15,2), default=0)
    margem_bruta = Column(Decimal(5,2), default=0)
    margem_liquida = Column(Decimal(5,2), default=0)
    detalhamento = Column(JSON, default={})
    comparativo_periodo_anterior = Column(JSON, default={})
    insights_ia = Column(JSON, default={})
    alertas = Column(JSON, default=[])
    gerado_automaticamente = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

class PrevisaoDemandaIA(Base):
    __tablename__ = "previsao_demanda_ia"
    
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer)
    empresa_id = Column(Integer, ForeignKey('empresas_erp.id'))
    data_previsao = Column(Date, nullable=False)
    horizonte_dias = Column(Integer, default=30)
    demanda_prevista = Column(Integer, nullable=False)
    demanda_minima = Column(Integer)
    demanda_maxima = Column(Integer)
    confiabilidade = Column(Decimal(5,2))
    modelo_usado = Column(String(50))
    fatores_sazonais = Column(JSON, default={})
    fatores_externos = Column(JSON, default={})
    historico_acuracia = Column(Decimal(5,2))
    ponto_reposicao_sugerido = Column(Integer)
    estoque_seguranca = Column(Integer)
    lote_economico = Column(Integer)
    alertas = Column(JSON, default=[])
    metadata = Column(JSON, default={})
    criado_em = Column(DateTime, default=datetime.utcnow)

class ClassificacaoABCXYZ(Base):
    __tablename__ = "classificacao_abc_xyz"
    
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, nullable=False)
    empresa_id = Column(Integer, ForeignKey('empresas_erp.id'))
    periodo_analise = Column(String(20))
    classe_abc = Column(String(1))
    classe_xyz = Column(String(1))
    valor_vendas = Column(Decimal(15,2))
    percentual_vendas = Column(Decimal(5,2))
    quantidade_vendas = Column(Integer)
    frequencia_vendas = Column(Integer)
    variabilidade_demanda = Column(Decimal(5,2))
    coeficiente_variacao = Column(Decimal(5,2))
    estrategia_sugerida = Column(String(100))
    prioridade_gestao = Column(String(20))
    observacoes_ia = Column(Text)
    data_classificacao = Column(Date, default=datetime.utcnow)
    criado_em = Column(DateTime, default=datetime.utcnow)

class ClienteAnalise360(Base):
    __tablename__ = "cliente_analise_360"
    
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, nullable=False)
    empresa_id = Column(Integer, ForeignKey('empresas_erp.id'))
    score_credito = Column(Integer)
    score_fidelidade = Column(Integer)
    categoria_cliente = Column(String(30))
    potencial_compra = Column(String(20))
    risco_churn = Column(Decimal(5,2))
    valor_vida_estimado = Column(Decimal(15,2))
    frequencia_compras = Column(Decimal(5,2))
    ticket_medio = Column(Decimal(10,2))
    ultima_compra = Column(Date)
    produtos_favoritos = Column(JSON, default=[])
    canais_preferidos = Column(JSON, default=[])
    comportamento_pagamento = Column(JSON, default={})
    segmentacao_automatica = Column(String(50))
    recomendacoes_ia = Column(JSON, default=[])
    alertas = Column(JSON, default=[])
    data_analise = Column(Date, default=datetime.utcnow)
    criado_em = Column(DateTime, default=datetime.utcnow)

class SegmentacaoAutomatica(Base):
    __tablename__ = "segmentacao_automatica"
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey('empresas_erp.id'))
    nome_segmento = Column(String(100), nullable=False)
    descricao = Column(Text)
    criterios_segmentacao = Column(JSON, nullable=False)
    algoritmo_usado = Column(String(50))
    quantidade_clientes = Column(Integer, default=0)
    valor_medio_cliente = Column(Decimal(15,2))
    potencial_receita = Column(Decimal(15,2))
    estrategias_sugeridas = Column(JSON, default=[])
    campanhas_recomendadas = Column(JSON, default=[])
    ativo = Column(Boolean, default=True)
    data_criacao = Column(Date, default=datetime.utcnow)
    ultima_atualizacao = Column(DateTime, default=datetime.utcnow)
    criado_em = Column(DateTime, default=datetime.utcnow)

class DashboardExecutivo(Base):
    __tablename__ = "dashboard_executivo"
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey('empresas_erp.id'))
    usuario_id = Column(Integer)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    tipo = Column(String(30), default='personalizado')
    configuracao = Column(JSON, nullable=False)
    kpis_configurados = Column(JSON, default=[])
    widgets_ativos = Column(JSON, default=[])
    filtros_padrao = Column(JSON, default={})
    publico = Column(Boolean, default=False)
    tags = Column(ARRAY(Text))
    favorito = Column(Boolean, default=False)
    acessos = Column(Integer, default=0)
    ultima_visualizacao = Column(DateTime)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow)

class ConectoresERPNativos(Base):
    __tablename__ = "conectores_erp_nativos"
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey('empresas_erp.id'))
    nome = Column(String(100), nullable=False)
    tipo = Column(String(50), nullable=False)
    provedor = Column(String(100))
    url_api = Column(String(500))
    chave_api = Column(Text)
    token_acesso = Column(Text)
    configuracoes = Column(JSON, default={})
    ativa = Column(Boolean, default=False)
    ultima_sincronizacao = Column(DateTime)
    status_conexao = Column(String(20), default='desconectado')
    logs_sync = Column(JSON, default=[])
    frequencia_sync = Column(String(20), default='manual')
    mapeamento_campos = Column(JSON, default={})
    webhook_url = Column(String(500))
    estatisticas_sync = Column(JSON, default={})
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow)

class ModelosML(Base):
    __tablename__ = "modelos_ml"
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey('empresas_erp.id'))
    nome_modelo = Column(String(100), nullable=False)
    tipo_modelo = Column(String(50), nullable=False)
    algoritmo = Column(String(50))
    versao = Column(String(20))
    parametros = Column(JSON, default={})
    metricas_performance = Column(JSON, default={})
    dados_treinamento = Column(JSON, default={})
    status = Column(String(20), default='treinando')
    acuracia = Column(Decimal(5,2))
    data_treinamento = Column(DateTime)
    data_deploy = Column(DateTime)
    ativo = Column(Boolean, default=False)
    observacoes = Column(Text)
    metadata = Column(JSON, default={})
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow)

class PredicoesInsights(Base):
    __tablename__ = "predicoes_insights_automaticos"
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey('empresas_erp.id'))
    tipo_predicao = Column(String(50), nullable=False)
    entidade_id = Column(Integer)
    entidade_tipo = Column(String(50))
    predicao = Column(JSON, nullable=False)
    confiabilidade = Column(Decimal(5,2))
    modelo_usado = Column(String(100))
    data_predicao = Column(DateTime, default=datetime.utcnow)
    data_validade = Column(DateTime)
    status = Column(String(20), default='ativa')
    acoes_sugeridas = Column(JSON, default=[])
    impacto_estimado = Column(JSON, default={})
    feedback_usuario = Column(JSON, default={})
    acuracia_real = Column(Decimal(5,2))
    observacoes = Column(Text)
    metadata = Column(JSON, default={})
    criado_em = Column(DateTime, default=datetime.utcnow)
