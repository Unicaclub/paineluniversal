"""
Inventory models for SQLAlchemy ORM
"""
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from enum import Enum as PyEnum

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Date, Numeric,
    ForeignKey, Index, UniqueConstraint, CheckConstraint
)
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class MovementTypeEnum(PyEnum):
    IN = "IN"
    OUT = "OUT"
    TRANSFER = "TRANSFER"
    ADJUSTMENT = "ADJUSTMENT"


class ReasonDirectionEnum(PyEnum):
    IN = "IN"
    OUT = "OUT"
    BOTH = "BOTH"


class LocationTypeEnum(PyEnum):
    PRINCIPAL = "principal"
    BAR = "bar"
    DEPOSITO = "deposito"


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (
        Index('idx_categories_org_active', 'organization_id', 'is_active'),
        {"schema": "inventory"}
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    organization_id: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    products: Mapped[List["Product"]] = relationship("Product", back_populates="category")


class Unit(Base):
    __tablename__ = "units"
    __table_args__ = (
        UniqueConstraint('code', name='uq_units_code'),
        {"schema": "inventory"}
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(10), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    factor_to_base: Mapped[Decimal] = mapped_column(Numeric(18, 6), default=Decimal('1.0'), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    products: Mapped[List["Product"]] = relationship("Product", back_populates="base_unit")
    movement_lines: Mapped[List["StockMovementLine"]] = relationship("StockMovementLine", back_populates="unit")


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        Index('idx_products_org_active', 'organization_id', 'is_active'),
        Index('idx_products_sku', 'sku'),
        Index('idx_products_barcode', 'barcode'),
        {"schema": "inventory"}
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    organization_id: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey('inventory.categories.id'), nullable=False)
    base_unit_id: Mapped[int] = mapped_column(Integer, ForeignKey('inventory.units.id'), nullable=False)
    barcode: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    min_stock: Mapped[Decimal] = mapped_column(Numeric(18, 3), default=Decimal('0'), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    category: Mapped["Category"] = relationship("Category", back_populates="products")
    base_unit: Mapped["Unit"] = relationship("Unit", back_populates="products")
    movement_lines: Mapped[List["StockMovementLine"]] = relationship("StockMovementLine", back_populates="product")
    stock_levels: Mapped[List["StockLevel"]] = relationship("StockLevel", back_populates="product")


class Location(Base):
    __tablename__ = "locations"
    __table_args__ = (
        Index('idx_locations_org_active', 'organization_id', 'is_active'),
        {"schema": "inventory"}
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    organization_id: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[LocationTypeEnum] = mapped_column(
        ENUM(LocationTypeEnum, schema='inventory', name='location_type_enum'), 
        nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    movements_from: Mapped[List["StockMovement"]] = relationship(
        "StockMovement", 
        foreign_keys="StockMovement.location_from_id",
        back_populates="location_from"
    )
    movements_to: Mapped[List["StockMovement"]] = relationship(
        "StockMovement", 
        foreign_keys="StockMovement.location_to_id",
        back_populates="location_to"
    )
    stock_levels: Mapped[List["StockLevel"]] = relationship("StockLevel", back_populates="location")


class MovementReason(Base):
    __tablename__ = "movement_reasons"
    __table_args__ = (
        Index('idx_movement_reasons_org_direction', 'organization_id', 'direction'),
        {"schema": "inventory"}
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    organization_id: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    direction: Mapped[ReasonDirectionEnum] = mapped_column(
        ENUM(ReasonDirectionEnum, schema='inventory', name='reason_direction_enum'), 
        nullable=False
    )
    affects_cost: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    accounting_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    movements: Mapped[List["StockMovement"]] = relationship("StockMovement", back_populates="reason")


class StockMovement(Base):
    __tablename__ = "stock_movements"
    __table_args__ = (
        Index('idx_stock_movements_org_date', 'organization_id', 'document_date'),
        Index('idx_stock_movements_document_ref', 'document_ref'),
        Index('idx_stock_movements_type', 'movement_type'),
        {"schema": "inventory"}
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    organization_id: Mapped[int] = mapped_column(Integer, nullable=False)
    movement_type: Mapped[MovementTypeEnum] = mapped_column(
        ENUM(MovementTypeEnum, schema='inventory', name='movement_type_enum'), 
        nullable=False
    )
    reason_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('inventory.movement_reasons.id'), nullable=True)
    document_ref: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    document_date: Mapped[date] = mapped_column(Date, nullable=False)
    location_from_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('inventory.locations.id'), nullable=True)
    location_to_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('inventory.locations.id'), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(Integer, nullable=False)  # FK to users table
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    status: Mapped[str] = mapped_column(String(20), default='completed', nullable=False)

    # Relationships
    reason: Mapped[Optional["MovementReason"]] = relationship("MovementReason", back_populates="movements")
    location_from: Mapped[Optional["Location"]] = relationship(
        "Location", 
        foreign_keys=[location_from_id],
        back_populates="movements_from"
    )
    location_to: Mapped[Optional["Location"]] = relationship(
        "Location", 
        foreign_keys=[location_to_id],
        back_populates="movements_to"
    )
    lines: Mapped[List["StockMovementLine"]] = relationship(
        "StockMovementLine", 
        back_populates="movement",
        cascade="all, delete-orphan"
    )


class StockMovementLine(Base):
    __tablename__ = "stock_movement_lines"
    __table_args__ = (
        Index('idx_stock_movement_lines_movement', 'movement_id'),
        Index('idx_stock_movement_lines_product', 'product_id'),
        {"schema": "inventory"}
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    movement_id: Mapped[int] = mapped_column(Integer, ForeignKey('inventory.stock_movements.id', ondelete='CASCADE'), nullable=False)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey('inventory.products.id'), nullable=False)
    unit_id: Mapped[int] = mapped_column(Integer, ForeignKey('inventory.units.id'), nullable=False)
    qty: Mapped[Decimal] = mapped_column(Numeric(18, 3), nullable=False)
    unit_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 6), nullable=True)
    qty_base: Mapped[Decimal] = mapped_column(Numeric(18, 3), nullable=False)
    value_total: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 6), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    movement: Mapped["StockMovement"] = relationship("StockMovement", back_populates="lines")
    product: Mapped["Product"] = relationship("Product", back_populates="movement_lines")
    unit: Mapped["Unit"] = relationship("Unit", back_populates="movement_lines")


class StockLevel(Base):
    __tablename__ = "stock_levels"
    __table_args__ = (
        UniqueConstraint('organization_id', 'product_id', 'location_id', name='uq_stock_levels_org_product_location'),
        Index('idx_stock_levels_org_location', 'organization_id', 'location_id'),
        Index('idx_stock_levels_product', 'product_id'),
        {"schema": "inventory"}
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    organization_id: Mapped[int] = mapped_column(Integer, nullable=False)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey('inventory.products.id'), nullable=False)
    location_id: Mapped[int] = mapped_column(Integer, ForeignKey('inventory.locations.id'), nullable=False)
    on_hand: Mapped[Decimal] = mapped_column(Numeric(18, 3), default=Decimal('0'), nullable=False)
    reserved: Mapped[Decimal] = mapped_column(Numeric(18, 3), default=Decimal('0'), nullable=False)
    cost_avg: Mapped[Decimal] = mapped_column(Numeric(18, 6), default=Decimal('0'), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="stock_levels")
    location: Mapped["Location"] = relationship("Location", back_populates="stock_levels")

    @property
    def available(self) -> Decimal:
        """Available quantity (on_hand - reserved)"""
        return self.on_hand - self.reserved

    @property
    def value_total(self) -> Decimal:
        """Total value (on_hand * cost_avg)"""
        return self.on_hand * self.cost_avg

    @property
    def is_below_min_stock(self) -> bool:
        """Check if current stock is below minimum"""
        return self.on_hand < self.product.min_stock if self.product else False
