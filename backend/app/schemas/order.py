from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderItemResponse(OrderItemBase):
    id: int
    unit_price: float

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemBase] = Field(..., min_length=1)


class OrderUpdate(BaseModel):
    status: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    status: str
    total_amount: float
    items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
