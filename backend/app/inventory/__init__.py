"""
Inventory module for stock management
"""

from .models import (
    Category, Unit, Product, Location, MovementReason,
    StockMovement, StockMovementLine, StockLevel,
    MovementTypeEnum, ReasonDirectionEnum
)

from .schemas import (
    StockMovementCreate, StockMovementResponse,
    StockPositionFilter, StockPositionResponse,
    MovementHistoryFilter, CategoryResponse,
    UnitResponse, ProductResponse, LocationResponse,
    MovementReasonResponse
)

from .services import InventoryService
from .repositories import InventoryRepository
from .api import router as inventory_router

__all__ = [
    # Models
    "Category", "Unit", "Product", "Location", "MovementReason",
    "StockMovement", "StockMovementLine", "StockLevel",
    "MovementTypeEnum", "ReasonDirectionEnum",
    
    # Schemas
    "StockMovementCreate", "StockMovementResponse",
    "StockPositionFilter", "StockPositionResponse",
    "MovementHistoryFilter", "CategoryResponse",
    "UnitResponse", "ProductResponse", "LocationResponse",
    "MovementReasonResponse",
    
    # Services and Repository
    "InventoryService", "InventoryRepository",
    
    # Router
    "inventory_router"
]
