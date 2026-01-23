# AGENTS.md - German Tutor

Guidelines for AI agents working in this repository.

## Project Overview

AI-powered German language tutor for Chinese speakers using Azure OpenAI Realtime API.
- **Backend**: Python 3.13, FastAPI, WebSockets (`src/backend/`)
- **Frontend**: React 19, TypeScript 5.9, Vite, Tailwind CSS (`src/frontend/`)
- **Infrastructure**: Azure Container Apps, Bicep (`infra/`)

## Build & Run Commands

### Backend (Python/FastAPI)

```bash
# Install dependencies (from repo root)
uv sync

# Install with dev dependencies
uv sync --dev

# Run development server
cd src/backend
uvicorn app.main:app --reload

# Or from repo root
uv run uvicorn app.main:app --reload --app-dir src/backend
```

### Frontend (React/Vite)

```bash
cd src/frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Linting & Type Checking

```bash
# Backend - Ruff (linting + formatting)
uv run ruff check src/backend          # Check for issues
uv run ruff check src/backend --fix    # Auto-fix issues
uv run ruff format src/backend         # Format code

# Backend - MyPy (type checking)
uv run mypy src/backend

# Frontend - ESLint
cd src/frontend
npm run lint
```

### Testing

```bash
# Backend - pytest (no tests exist yet, but this is the pattern)
uv run pytest                           # Run all tests
uv run pytest tests/test_foo.py         # Run single test file
uv run pytest tests/test_foo.py::test_bar  # Run single test function
uv run pytest -k "test_name"            # Run tests matching pattern

# Frontend (no test runner configured yet)
```

### Azure Deployment

```bash
azd auth login
azd up              # Provision and deploy
azd deploy          # Deploy only (after initial setup)
```

## Code Style Guidelines

### Python (Backend)

**Tools**: Ruff (linting/formatting), MyPy (strict mode)

**Imports** - Order enforced by Ruff:
1. Standard library
2. Third-party packages
3. Local imports

```python
# Correct
import asyncio
import logging
from typing import Any

from fastapi import APIRouter, WebSocket
from pydantic import BaseModel

from app.config import get_settings
from app.models import SessionConfig
```

**Type Annotations** - Required everywhere (MyPy strict):
```python
# Functions must have return types
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}

# Use modern generics (Python 3.13)
def get_items() -> list[str]:        # Not List[str]
    ...
def get_mapping() -> dict[str, int]: # Not Dict[str, int]
    ...
```

**Naming Conventions**:
- `snake_case` for functions, variables, modules
- `PascalCase` for classes
- `SCREAMING_SNAKE_CASE` for constants
- Private: prefix with `_`

**Pydantic Models** - Use for all data structures:
```python
from pydantic import BaseModel
from typing import Literal

class SessionConfig(BaseModel):
    german_level: Literal["A1", "A2", "B1", "B2", "C1", "C2"] = "A1"
    voice: str = "alloy"
```

**Error Handling**:
```python
try:
    result = await some_async_operation()
except SpecificError as e:
    logger.error(f"Operation failed: {e}")
    raise
except Exception as e:
    logger.error(f"Unexpected error: {e}")
```

**Logging** - Use module-level logger:
```python
import logging
logger = logging.getLogger(__name__)

logger.info(f"Processing request: {request_id}")
logger.error(f"Failed to connect: {error}")
```

### TypeScript/React (Frontend)

**Tools**: ESLint, TypeScript (strict mode)

**Imports** - Order:
1. React/external libraries
2. Local components/hooks
3. Types (use `type` keyword)

```typescript
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../ui/Button';
import { useAppStore } from '../../store';

import type { Message, GermanLevel } from '../../store/types';
```

**Type Definitions** - Use `type` for unions/primitives, `interface` for objects:
```typescript
// Types for unions and simple types
export type GermanLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

// Interfaces for object shapes
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
```

**Component Structure**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  return (
    <button className={`${baseStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};
```

**State Management** - Zustand with persistence:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      germanLevel: 'A1',
      setGermanLevel: (level: GermanLevel) => set({ germanLevel: level }),
    }),
    { name: 'german-tutor-storage' }
  )
);
```

**Styling** - Tailwind CSS classes inline:
```typescript
<button className="px-4 py-2 bg-german-gold text-german-black hover:bg-amber-400 rounded-lg">
```

## Project Structure

```
src/
  backend/
    app/
      main.py           # FastAPI app entry point
      config.py         # Settings via pydantic-settings
      models/           # Pydantic models
      api/
        routes/         # HTTP endpoints
        websocket/      # WebSocket handlers
      services/         # Business logic
  frontend/
    src/
      main.tsx          # React entry point
      App.tsx           # Router setup
      pages/            # Page components
      components/       # Reusable components
        ui/             # Generic UI (Button, Card, Select)
        layout/         # Layout components
        tutor/          # Tutor-specific components
        audio/          # Audio-related components
      hooks/            # Custom React hooks
      store/            # Zustand state management
      i18n.ts           # i18next configuration
    public/
      locales/          # Translation files (en, zh, de)
```

## Key Patterns

1. **Configuration**: Use `pydantic-settings` with `.env` files
2. **WebSocket**: Backend relays to Azure OpenAI Realtime API
3. **i18n**: React-i18next with JSON translation files
4. **Auth**: Azure DefaultAzureCredential (managed identity or API key)

## Environment Variables

Required in `.env`:
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI resource URL
- `AZURE_OPENAI_REALTIME_DEPLOYMENT` - gpt-4o-realtime deployment name

See `.env.example` for full list.
