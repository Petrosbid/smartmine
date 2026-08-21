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
    ai_model: str = "gemini-2.5-flash"
    ai_base_url: str = ""

    # Alternative environment variable names
    gemini_api_key: str = ""
    google_api_key: str = ""
    openai_api_key: str = ""

    @property
    def resolved_ai_api_key(self) -> str:
        """Resolve AI API key with priority: ai_api_key > gemini_api_key > google_api_key > openai_api_key."""
        key = self.ai_api_key.strip()
        if key:
            return key
        if self.gemini_api_key.strip():
            return self.gemini_api_key.strip()
        if self.google_api_key.strip():
            return self.google_api_key.strip()
        if self.openai_api_key.strip():
            return self.openai_api_key.strip()
        return ""

    @property
    def resolved_ai_provider(self) -> str:
        """Resolve provider name automatically if not explicitly configured."""
        provider = self.ai_provider.lower().strip()
        if provider in {"google", "gemini", "openai", "custom"}:
            return provider
        if self.openai_api_key.strip() and not (self.gemini_api_key.strip() or self.google_api_key.strip()):
            return "openai"
        return "google"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

