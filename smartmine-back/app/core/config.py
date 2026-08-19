from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "SmartMine API"
    app_env: str = "development"
    app_version: str = "1.0.0"
    debug: bool = True

    database_url: str = "sqlite:///./smartmine.db"
    cors_origins: str = Field(default="http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174")

    ai_provider: str = "google"
    ai_api_key: str = ""
    ai_model: str = "gemini-1.5-flash"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
