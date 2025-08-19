from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Numeric, Date, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
import enum

# Create a separate base for inventory models with inventory schema
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class MovementTypeEnum(enum.Enum):
    IN = "IN"
    OUT = "OUT"
    TRANSFER = "TRANSFER"
    ADJUSTMENT = "ADJUSTMENT"

class ReasonDirectionEnum(enum.Enum):
    IN = "IN"
    OUT = "OUT"
    BOTH = "BOTH"

class LocationTypeEnum(enum.Enum):
    PRINCIPAL = "principal"
    BAR = "bar"
    DEPOSITO = "deposito"

class Category(Base):
    __tablename__ = "categories"
    __table_args__ = {"schema": "inventory"}
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="category")

class Unit(Base):
    __tablename__ = "units"
    __table_args__ = {"schema": "inventory"}
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    factor_to_base = Column(Numeric(18, 6), nullable=False, default=1.0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="base_unit")
    movement_lines = relationship("StockMovementLine", back_populates="unit")

class Product(Base):
    __tablename__ = "products"
    __table_args__ = {"schema": "inventory"}
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, nullable=False)
    name = Column(String(255), nullable=False)
    sku = Column(String(100))
    category_id = Column(Integer, ForeignKey("inventory.categories.id"), nullable=False)
    base_unit_id = Column(Integer, ForeignKey("inventory.units.id"), nullable=False)
    barcode = Column(String(100))
    min_stock = Column(Numeric(18, 3), nullable=False, default=0)
    description = Column(Text)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    category = relationship("Category", back_populates="products")
    base_unit = relationship("Unit", back_populates="products")
    movement_lines = relationship("StockMovementLine", back_populates="product")
    stock_levels = relationship("StockLevel", back_populates="product")

class Location(Base):
    __tablename__ = "locations"
    __table_args__ = {"schema": "inventory"}
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(SQLEnum(LocationTypeEnum), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    stock_levels = relationship("StockLevel", back_populates="location")
    movements_from = relationship("StockMovement", foreign_keys="StockMovement.location_from_id", back_populates="location_from")
    movements_to = relationship("StockMovement", foreign_keys="StockMovement.location_to_id", back_populates="location_to")

class MovementReason(Base):
    __tablename__ = "movement_reasons"
    __table_args__ = {"schema": "inventory"}
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, nullable=False)
    name = Column(String(255), nullable=False)
    direction = Column(SQLEnum(ReasonDirectionEnum), nullable=False)
    affects_cost = Column(Boolean, default=True, nullable=False)
    accounting_code = Column(String(50))
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    movements = relationship("StockMovement", back_populates="reason")

class StockMovement(Base):
    __tablename__ = "stock_movements"
    __table_args__ = {"schema": "inventory"}
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, nullable=False)
    movement_type = Column(SQLEnum(MovementTypeEnum), nullable=False)
    reason_id = Column(Integer, ForeignKey("inventory.movement_reasons.id"))
    document_ref = Column(String(100))
    document_date = Column(Date, nullable=False)
    location_from_id = Column(Integer, ForeignKey("inventory.locations.id"))
    location_to_id = Column(Integer, ForeignKey("inventory.locations.id"))
    notes = Column(Text)
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(20), nullable=False, default="completed")
    
    # Relationships
    reason = relationship("MovementReason", back_populates="movements")
    location_from = relationship("Location", foreign_keys=[location_from_id], back_populates="movements_from")
    location_to = relationship("Location", foreign_keys=[location_to_id], back_populates="movements_to")
    lines = relationship("StockMovementLine", back_populates="movement", cascade="all, delete-orphan")

class StockMovementLine(Base):
    __tablename__ = "stock_movement_lines"
    __table_args__ = {"schema": "inventory"}
    
    id = Column(Integer, primary_key=True, index=True)
    movement_id = Column(Integer, ForeignKey("inventory.stock_movements.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("inventory.products.id"), nullable=False)
    unit_id = Column(Integer, ForeignKey("inventory.units.id"), nullable=False)
    qty = Column(Numeric(18, 3), nullable=False)
    unit_price = Column(Numeric(18, 6))
    qty_base = Column(Numeric(18, 3), nullable=False)
    value_total = Column(Numeric(18, 6))
    notes = Column(Text)
    
    # Relationships
    movement = relationship("StockMovement", back_populates="lines")
    product = relationship("Product", back_populates="movement_lines")
    unit = relationship("Unit", back_populates="movement_lines")

class StockLevel(Base):
    __tablename__ = "stock_levels"
    __table_args__ = {"schema": "inventory"}
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, nullable=False)
    product_id = Column(Integer, ForeignKey("inventory.products.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("inventory.locations.id"), nullable=False)
    on_hand = Column(Numeric(18, 3), nullable=False, default=0)
    reserved = Column(Numeric(18, 3), nullable=False, default=0)
    cost_avg = Column(Numeric(18, 6), nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="stock_levels")
    location = relationship("Location", back_populates="stock_levels")
