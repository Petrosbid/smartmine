# SmartMine Frontend Architecture

## Overview

This frontend is a React + TypeScript app connected to the FastAPI backend.

- Backend base path: `/api/v1`
- Default dev proxy: Vite proxies `/api/*` to `http://127.0.0.1:8000`
- API calls are implemented in `services/api/`

If backend calls fail, some screens still fall back to existing in-memory state so
UI remains usable.

## Structure

- `app/`: app entry and router
- `context/`: shared session + connected app state
- `pages/`: route-level pages
- `services/api/`: real HTTP API client + DTO/domain mappers
- `services/mock/`: legacy mock logic (kept for fallback/prompts)
- `types/`: shared domain models
- `data/`: initial seed display data

## Integration pattern

1. `services/api/client.ts` provides a typed `fetch` wrapper.
2. `services/api/types.ts` defines backend DTO contracts.
3. `services/api/mappers.ts` maps backend DTOs to UI/domain types.
4. `services/api/smartmineApi.ts` exposes feature-level API methods.
5. `AppStateContext` initializes session/data and keeps pages synchronized.
