from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


class CustomerService:
    @staticmethod
    def list_customers(db: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
        return db.query(Customer).offset(skip).limit(limit).all()

    @staticmethod
    def get_customer(db: Session, customer_id: int) -> Optional[Customer]:
        return db.query(Customer).filter(Customer.id == customer_id).first()

    @staticmethod
    def get_customer_by_email(db: Session, email: str) -> Optional[Customer]:
        return db.query(Customer).filter(Customer.email == email).first()

    @staticmethod
    def create_customer(db: Session, data: CustomerCreate) -> Customer:
        existing = CustomerService.get_customer_by_email(db, data.email)
        if existing:
            raise ValueError(f"Customer with email '{data.email}' already exists")
        customer = Customer(**data.model_dump())
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def update_customer(db: Session, customer_id: int, data: CustomerUpdate) -> Optional[Customer]:
        customer = CustomerService.get_customer(db, customer_id)
        if not customer:
            return None
        update_data = data.model_dump(exclude_unset=True)
        if "email" in update_data:
            existing = CustomerService.get_customer_by_email(db, update_data["email"])
            if existing and existing.id != customer_id:
                raise ValueError(f"Customer with email '{update_data['email']}' already exists")
        for key, value in update_data.items():
            setattr(customer, key, value)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def delete_customer(db: Session, customer_id: int) -> bool:
        customer = CustomerService.get_customer(db, customer_id)
        if not customer:
            return False
        db.delete(customer)
        db.commit()
        return True
