from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    gemini_api_key: str
    
    mongodb_uri: str
    mongodb_db_name: str = "threatiq"
    
    firebase_project_id: str
    firebase_private_key: str
    firebase_client_email: str
    
    cors_origins: str = "http://localhost:3000"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    environment: str = "development"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
