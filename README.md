# German Tutor

German Tutor is an AI-powered language learning application designed for native Chinese speakers to practice German through real-time voice conversations. It leverages the Azure OpenAI GPT-4o Realtime API to provide immersive, level-appropriate language tutoring.

## Features

- Real-time Voice Conversation: Low-latency voice interaction using the Azure OpenAI Realtime API.
- CEFR-Aligned Levels: Supports all Common European Framework of Reference for Languages (CEFR) levels from A1 to C2.
- Multilingual Interface: UI available in English, Chinese (Simplified), and German.
- Dual Interaction Modes: Support for both voice-based and text-based communication.
- Pedagogical Guidance: The AI tutor adjusts vocabulary, grammar, and speaking pace based on the selected proficiency level and provides explanations in the user's native language when necessary.
- Live Transcript: Real-time transcription of conversations for better comprehension.

## Prerequisites

To run this project locally, you will need:

- Node.js 20+
- Python 3.13+
- uv (Python package installer and resolver)
- Azure CLI
- Azure Developer CLI (azd)

## Local Development Setup

### 1. Configure Environment Variables

Copy the `.env.example` file to `.env` in the root directory and fill in your Azure OpenAI credentials:

```bash
cp .env.example .env
```

### 2. Backend Setup

The backend is a FastAPI application that acts as a WebSocket relay to Azure OpenAI.

```bash
cd src/backend
uv sync
uvicorn app.main:app --reload
```

The backend will be available at http://localhost:8000.

### 3. Frontend Setup

The frontend is built with React, TypeScript, and Vite.

```bash
cd src/frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173.

## Environment Variables

| Variable | Description |
|----------|-------------|
| AZURE_OPENAI_ENDPOINT | The endpoint URL of your Azure OpenAI resource |
| AZURE_OPENAI_API_KEY | Your Azure OpenAI API key |
| AZURE_OPENAI_REALTIME_DEPLOYMENT | The deployment name of the gpt-realtime model |
| AZURE_OPENAI_TTS_DEPLOYMENT | The deployment name of the gpt-4o-mini-tts model for voice preview |
| AZURE_OPENAI_API_VERSION | Azure OpenAI API version (e.g., 2025-08-28) |
| BACKEND_HOST | Host for the FastAPI server (default: 0.0.0.0) |
| BACKEND_PORT | Port for the FastAPI server (default: 8000) |
| CORS_ORIGINS | Allowed origins for CORS (e.g., http://localhost:5173) |
| VITE_API_URL | Frontend environment variable for the backend HTTP URL |
| VITE_WS_URL | Frontend environment variable for the backend WebSocket URL |

## Deployment (Azure)

This project is designed to be deployed using the Azure Developer CLI (azd). It provisions Azure Container Apps for the backend and Azure Static Web Apps for the frontend.

1. Authenticate with Azure:
   ```bash
   azd auth login
   ```

2. Provision and deploy the resources:
   ```bash
   azd up
   ```

   During deployment, you will be prompted to select:
   - **Azure Location**: The primary region for all resources
   - **Azure OpenAI Location**: The region for Azure OpenAI (must support `gpt-realtime` and `gpt-4o-mini-tts` models, e.g., `eastus2`)

This command will use the Bicep templates in the infra/ directory to create the necessary infrastructure and deploy the application.

## Project Structure

- `src/backend/`: FastAPI application, WebSocket relay logic, and tutor service configuration.
- `src/frontend/`: React application with Tailwind CSS and Zustand for state management.
- `infra/`: Bicep templates for infrastructure as code.
- `azure.yaml`: Configuration for Azure Developer CLI.
- `.env.example`: Template for environment variables.

## Technical Details

- Backend: Python 3.13, FastAPI, WebSockets.
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, i18next.
- AI Integration: Azure OpenAI Realtime API (WebSockets) with PCM16 audio at 24kHz.
- Target Audience: Native Chinese speakers learning German.
- Supported Proficiency Levels: A1 (Beginner), A2 (Elementary), B1 (Intermediate), B2 (Upper Intermediate), C1 (Advanced), C2 (Mastery).
- UI Languages: English (en), Chinese (zh), German (de).
