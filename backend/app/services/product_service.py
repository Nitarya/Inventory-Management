from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    @staticmethod
    def list_products(db: Session, skip: int = 0, limit: int = 100) -> List[Product]:
        return db.query(Product).offset(skip).limit(limit).all()

    @staticmethod
    def get_product(db: Session, product_id: int) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id).first()

    @staticmethod
    def get_product_by_sku(db: Session, sku: str) -> Optional[Product]:
        return db.query(Product).filter(Product.sku == sku).first()

    @staticmethod
    def create_product(db: Session, data: ProductCreate) -> Product:
        existing = ProductService.get_product_by_sku(db, data.sku)
        if existing:
            raise ValueError(f"Product with SKU '{data.sku}' already exists")
        product = Product(**data.model_dump())
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update_product(db: Session, product_id: int, data: ProductUpdate) -> Optional[Product]:
        product = ProductService.get_product(db, product_id)
        if not product:
            return None
        update_data = data.model_dump(exclude_unset=True)
        if "sku" in update_data:
            existing = ProductService.get_product_by_sku(db, update_data["sku"])
            if existing and existing.id != product_id:
                raise ValueError(f"Product with SKU '{update_data['sku']}' already exists")
        for key, value in update_data.items():
            setattr(product, key, value)
        try:
            db.commit()
            db.refresh(product)
        except IntegrityError:
            db.rollback()
            raise ValueError("SKU conflict")
        return product

    @staticmethod
    def delete_product(db: Session, product_id: int) -> bool:
        product = ProductService.get_product(db, product_id)
        if not product:
            return False
        db.delete(product)
        db.commit()
        return True
