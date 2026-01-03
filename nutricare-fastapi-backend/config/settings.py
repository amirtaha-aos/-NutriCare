from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Database
    MONGODB_URL: str
    DB_NAME: str = "nutricare"

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # AI Configuration
    AI_API_KEY: str = ""  # Your custom AI service API key
    AI_PROVIDER: str = "openai"  # openai, gemini, or custom
    AI_BASE_URL: str = "https://api.openai.com/v1"  # Base URL for custom API

    # OpenAI (will use AI_API_KEY if OPENAI_API_KEY is empty)
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4-vision-preview"
    OPENAI_MAX_TOKENS: int = 4000

    @property
    def api_key(self) -> str:
        """Get API key - prioritize OPENAI_API_KEY, fallback to AI_API_KEY"""
        return self.OPENAI_API_KEY if self.OPENAI_API_KEY else self.AI_API_KEY

    # Samsung Health (Optional)
    SAMSUNG_CLIENT_ID: str = ""
    SAMSUNG_CLIENT_SECRET: str = ""
    SAMSUNG_REDIRECT_URI: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # File Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/jpg,image/webp"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def allowed_image_types_list(self) -> List[str]:
        return [img_type.strip() for img_type in self.ALLOWED_IMAGE_TYPES.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
