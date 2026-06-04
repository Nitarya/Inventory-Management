from typing import List, Optional

from sqlalchemy.orm import Session, joinedload

from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderUpdate


class OrderService:
    @staticmethod
    def list_orders(db: Session, skip: int = 0, limit: int = 100) -> List[Order]:
        return (
            db.query(Order)
            .options(joinedload(Order.items), joinedload(Order.customer))
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_order(db: Session, order_id: int) -> Optional[Order]:
        return (
            db.query(Order)
            .options(joinedload(Order.items), joinedload(Order.customer))
            .filter(Order.id == order_id)
            .first()
        )

    @staticmethod
    def create_order(db: Session, data: OrderCreate) -> Order:
        # Validate customer exists
        customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
        if not customer:
            raise ValueError(f"Customer with id {data.customer_id} not found")

        total_amount = 0.0
        order_items_data = []

        # Validate inventory for each item
        for item in data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise ValueError(f"Product with id {item.product_id} not found")
            if product.quantity < item.quantity:
                raise ValueError(
                    f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                    f"Available: {product.quantity}, requested: {item.quantity}"
                )
            total_amount += product.price * item.quantity
            order_items_data.append({"product": product, "quantity": item.quantity})

        # Create order
        order = Order(customer_id=data.customer_id, total_amount=total_amount)
        db.add(order)
        db.flush()  # Get order.id without committing

        # Create order items and reduce stock
        for oi_data in order_items_data:
            product = oi_data["product"]
            quantity = oi_data["quantity"]
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=product.price,
            )
            db.add(order_item)
            # Reduce stock
            product.quantity -= quantity

        db.commit()
        db.refresh(order)
        # Eager-load relationships for the response
        return (
            db.query(Order)
            .options(joinedload(Order.items), joinedload(Order.customer))
            .filter(Order.id == order.id)
            .first()
        )

    @staticmethod
    def update_order_status(db: Session, order_id: int, data: OrderUpdate) -> Optional[Order]:
        order = OrderService.get_order(db, order_id)
        if not order:
            return None
        if data.status:
            order.status = data.status
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def delete_order(db: Session, order_id: int) -> bool:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return False
        db.delete(order)
        db.commit()
        return True
