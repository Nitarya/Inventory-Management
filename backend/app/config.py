from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/inventory_db"
    APP_NAME: str = "Inventory & Order Management API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"
    JWT_SECRET: str = "change-this-secret-key-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
