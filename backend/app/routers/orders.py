from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("", response_model=List[OrderResponse])
def list_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = OrderService.list_orders(db, skip=skip, limit=limit)
    return [_format_order(o) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = OrderService.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _format_order(order)


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    try:
        order = OrderService.create_order(db, data)
        return _format_order(order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, data: OrderUpdate, db: Session = Depends(get_db)):
    order = OrderService.update_order_status(db, order_id, data)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _format_order(order)


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    deleted = OrderService.delete_order(db, order_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Order not found")
    return None


def _format_order(order):
    """Convert Order ORM object to dict with customer_name."""
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.name if order.customer else None,
        status=order.status,
        total_amount=order.total_amount,
        items=[
            {
                "id": item.id,
                "order_id": item.order_id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
            }
            for item in order.items
        ],
        created_at=order.created_at,
        updated_at=order.updated_at,
    )
