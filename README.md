# German Tutor

German Tutor is an AI-powered language learning application designed for native Chinese speakers to practice German through real-time voice conversations. It leverages the Azure OpenAI GPT-Realtime API to provide immersive, level-appropriate language tutoring.

## Features

- **Real-time Voice Conversation**: Low-latency voice interaction using the Azure OpenAI Realtime API
- **CEFR-Aligned Levels**: Supports all Common European Framework of Reference for Languages (CEFR) levels from A1 to C2
- **Multilingual Interface**: UI available in English, Chinese (Simplified), and German
- **Learning Modes**: 
  - **Teacher Mode**: AI provides explanations and corrections in your native language
  - **Immersive Mode**: Full German conversation for advanced learners
- **Custom Scenarios**: Create and save your own roleplay scenarios with AI generation
- **18 Predefined Scenarios**: From ordering coffee (A1) to legal consultations (C2)
- **Dual Interaction**: Support for both voice-based and text-based communication
- **Live Transcript**: Real-time transcription of conversations for better comprehension
- **User Authentication**: Secure login via email/password, Google OAuth, or GitHub OAuth
- **Progress Tracking**: Track your learning journey, conversation history, and achievements
- **Persistent Data**: Custom scenarios and conversation logs stored in Azure Cosmos DB

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

## Architecture

### Backend API Endpoints

- `POST /api/auth/register` - User registration with email/password
- `POST /api/auth/login` - User login (returns JWT tokens)
- `POST /api/auth/oauth/{provider}` - OAuth login (Google, GitHub)
- `GET /api/auth/me` - Get current user profile
- `GET /api/scenarios` - List all scenarios (default + custom)
- `POST /api/scenarios` - Create custom scenario
- `POST /api/scenarios/generate` - AI-generate scenario from topic
- `DELETE /api/scenarios/{id}` - Delete custom scenario
- `GET /api/users/progress` - Get user learning progress
- `GET /api/conversations` - Get conversation history
- `WS /ws/realtime` - WebSocket for real-time voice tutoring

### Data Flow

1. **Voice Input**: User speaks → Browser captures audio → Sent via WebSocket
2. **Backend Relay**: FastAPI forwards audio to Azure OpenAI Realtime API
3. **AI Processing**: GPT-realtime processes voice and generates response
4. **Voice Output**: AI response → WebSocket → Browser plays audio
5. **Persistence**: Conversations logged to Cosmos DB for history/analytics

### Authentication Flow

1. User registers/logs in → Backend generates JWT tokens
2. Frontend stores tokens in localStorage (via Zustand)
3. Protected requests include `Authorization: Bearer <token>` header
4. WebSocket connections authenticated via `token` query parameter

## Environment Variables

### Core Configuration

| Variable | Description |
|----------|-------------|
| `AZURE_OPENAI_ENDPOINT` | The endpoint URL of your Azure OpenAI resource |
| `AZURE_OPENAI_API_KEY` | Your Azure OpenAI API key (optional if using managed identity) |
| `AZURE_OPENAI_REALTIME_DEPLOYMENT` | The deployment name of the gpt-realtime model |
| `AZURE_OPENAI_TTS_DEPLOYMENT` | The deployment name of the gpt-mini-tts model |
| `AZURE_OPENAI_API_VERSION` | Azure OpenAI API version (default: 2025-04-01-preview) |

### Database Configuration

| Variable | Description |
|----------|-------------|
| `COSMOSDB_ENDPOINT` | Azure Cosmos DB endpoint URL |
| `COSMOSDB_DATABASE` | Database name (default: GermanTutor) |
| `COSMOSDB_CONVERSATIONS_CONTAINER` | Container for conversation logs (default: Conversations) |
| `COSMOSDB_SCENARIOS_CONTAINER` | Container for custom scenarios (default: Scenarios) |
| `COSMOSDB_USERS_CONTAINER` | Container for user profiles (default: Users) |
| `COSMOSDB_PROGRESS_CONTAINER` | Container for user progress tracking (default: UserProgress) |

### Backend Configuration

| Variable | Description |
|----------|-------------|
| `BACKEND_HOST` | Host for the FastAPI server (default: 0.0.0.0) |
| `BACKEND_PORT` | Port for the FastAPI server (default: 8000) |
| `CORS_ORIGINS` | Allowed origins for CORS (e.g., http://localhost:5173) |
| `FRONTEND_URL` | Frontend URL for OAuth redirects |

### Authentication Configuration

| Variable | Description |
|----------|-------------|
| `JWT_SECRET_KEY` | Secret key for JWT token signing (generate securely!) |
| `JWT_ALGORITHM` | JWT algorithm (default: HS256) |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Access token expiration (default: 60) |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiration (default: 7) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID (optional) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret (optional) |

### Email Configuration (Optional)

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | SMTP server hostname (e.g., smtp.sendgrid.net) |
| `SMTP_PORT` | SMTP server port (default: 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASSWORD` | SMTP password or API key |
| `SMTP_FROM_EMAIL` | Sender email address |
| `SMTP_FROM_NAME` | Sender name (default: German Tutor) |
| `SMTP_USE_TLS` | Enable TLS (default: true) |

See `.env.example` for a complete template.

## Deployment (Azure)

This project is designed to be deployed using the Azure Developer CLI (azd). It provisions:
- **Azure Container Apps** for the backend API
- **Azure Static Web Apps** for the frontend
- **Azure Cosmos DB** for data persistence
- **Azure OpenAI** for AI-powered tutoring
- **Azure Application Insights** for monitoring

### Deployment Steps

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
   - **Azure OpenAI Location**: The region for Azure OpenAI (must support `gpt-realtime` and `gpt-mini-tts` models, e.g., `eastus2`)

3. After successful deployment:
   - Your local `.env` file will be automatically populated with Azure resource URLs
   - Custom scenarios and user data will persist in Cosmos DB
   - The application is ready for production use

### Subsequent Deployments

For updates after initial deployment:
```bash
azd deploy              # Deploy code changes only
azd deploy backend      # Deploy backend only
azd deploy frontend     # Deploy frontend only
```

### Infrastructure as Code

All infrastructure is defined in Bicep templates under `infra/`:
- `main.bicep` - Main orchestration
- `modules/` - Modular resource definitions
- `hooks/` - Post-provision automation scripts

## Project Structure

```
src/
  backend/
    app/
      main.py              # FastAPI app entry point
      config.py            # Settings via pydantic-settings
      models/              # Pydantic models (scenario, user, auth, etc.)
      api/
        routes/            # HTTP endpoints (auth, scenarios, users, etc.)
        websocket/         # WebSocket handlers (realtime voice)
      services/            # Business logic
        scenario_service.py  # Custom scenario CRUD + AI generation
        tutor.py            # System prompt generation
        conversation_logger.py  # Cosmos DB conversation logging
        user_db.py          # User management
  frontend/
    src/
      main.tsx             # React entry point
      App.tsx              # Router setup
      pages/               # Page components
        HomePage.tsx
        TutorPage.tsx
        ScenariosPage.tsx
        ProgressPage.tsx
        LoginPage.tsx
      components/          # Reusable components
        ui/                # Generic UI (Button, Card, Select)
        layout/            # Layout components (Navbar)
        tutor/             # Tutor-specific (ScenarioCard, MessageList)
        audio/             # Audio-related (VoiceVisualizer)
      hooks/               # Custom React hooks
      store/               # Zustand state management
      data/                # Static data (default scenarios)
      i18n.ts              # i18next configuration
    public/
      locales/             # Translation files (en, zh, de)
infra/
  main.bicep             # Main Bicep template
  modules/               # Modular Bicep templates
    container-apps.bicep
    cosmosdb.bicep
    openai.bicep
    static-web-app.bicep
  hooks/                 # Post-provision automation
    postprovision.ps1    # PowerShell (Windows)
    postprovision.sh     # Bash (Linux/Mac)
azure.yaml               # Azure Developer CLI configuration
.env.example             # Environment variables template
```

## Technical Details

### Backend Stack
- **Language**: Python 3.13
- **Framework**: FastAPI
- **Real-time Communication**: WebSockets
- **Database**: Azure Cosmos DB (NoSQL)
- **Authentication**: JWT + OAuth2 (Google, GitHub)
- **Email**: SMTP (SendGrid, etc.)

### Frontend Stack
- **Framework**: React 19
- **Language**: TypeScript 5.9
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **Internationalization**: i18next
- **Routing**: React Router v7

### AI Integration
- **API**: Azure OpenAI Realtime API (WebSockets)
- **Audio Format**: PCM16 at 24kHz
- **Models**: 
  - `gpt-realtime` for voice conversations
  - `gpt-mini-tts` for text-to-speech
  - `gpt-mini` for scenario generation

### Infrastructure
- **Hosting**: Azure Container Apps (backend), Azure Static Web Apps (frontend)
- **Database**: Azure Cosmos DB (serverless)
- **Monitoring**: Azure Application Insights
- **Container Registry**: Azure Container Registry
- **IaC**: Bicep templates

### Supported Features
- **Target Audience**: Native Chinese speakers learning German
- **Proficiency Levels**: A1 (Beginner) to C2 (Mastery)
- **UI Languages**: English (en), Chinese (zh), German (de)
- **Learning Modes**: Teacher (with explanations), Immersive (German-only)
