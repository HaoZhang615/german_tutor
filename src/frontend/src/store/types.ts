export type GermanLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type UILanguage = 'en' | 'zh' | 'de';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type SessionStatus = 'idle' | 'listening' | 'speaking' | 'thinking';
export type TutorVoice = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse';
export type OAuthProvider = 'google' | 'github';
export type LearningMode = 'teacher' | 'immersive';
export type ScenarioDifficulty = 'Easy' | 'Medium' | 'Hard';

// Scenario types - matching backend models (with camelCase for frontend)
export interface Scenario {
  id: string;
  title: string;
  titleDe: string;
  description: string;
  descriptionDe: string;
  targetRole: string;
  difficulty: ScenarioDifficulty;
  suggestedLevel: GermanLevel;
  icon: string;
  topics: string[];
  userId?: string;
  createdAt?: string;
  isPublic?: boolean;
  isCustom?: boolean;
}

export interface ScenarioCreate {
  title: string;
  description: string;
  targetRole: string;
  difficulty?: ScenarioDifficulty;
  suggestedLevel: GermanLevel;
  topics?: string[];
  titleDe?: string;
  descriptionDe?: string;
  icon?: string;
}

export interface ScenarioGenerateRequest {
  topic: string;
  level: GermanLevel;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
}

// Auth types - matching backend models
export interface UserProfile {
  display_name: string;
  native_language: UILanguage;
  preferred_ui_language: UILanguage;
  german_level: GermanLevel;
  preferred_voice: TutorVoice;
}

export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  oauth_provider: OAuthProvider | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LevelStats {
  total_conversations: number;
  total_time_seconds: number;
  total_messages: number;
}

export interface Milestone {
  type: string;
  achieved_at: string;
  details?: Record<string, unknown>;
}

export interface UserProgress {
  user_id: string;
  current_level: GermanLevel;
  total_conversations: number;
  total_time_seconds: number;
  total_messages: number;
  level_stats: Record<GermanLevel, LevelStats>;
  streak_days: number;
  longest_streak: number;
  last_activity_date: string | null;
  milestones: Milestone[];
  total_hours: number;
}

export interface ConversationSummary {
  id: string;
  user_id: string;
  level: GermanLevel;
  started_at: string;
  ended_at: string | null;
  message_count: number;
  duration_seconds: number | null;
  summary?: ConversationAnalysis | null;
}

export interface ConversationAnalysis {
  overall_score: number;
  fluency: number;
  grammar: number;
  vocabulary: number;
  comprehension: number;
  highlights: string[];
  improvements: string[];
  new_vocabulary: string[];
  topic: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: ConversationMessage[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Auth state
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export interface AppState {
  germanLevel: GermanLevel;
  uiLanguage: UILanguage;
  tutorVoice: TutorVoice;
  learningMode: LearningMode;
  selectedScenarioId: string | null;
  connectionStatus: ConnectionStatus;
  sessionStatus: SessionStatus;
  messages: Message[];
  isRecording: boolean;
  audioLevel: number;
  
  setGermanLevel: (level: GermanLevel) => void;
  setUILanguage: (language: UILanguage) => void;
  setTutorVoice: (voice: TutorVoice) => void;
  setLearningMode: (mode: LearningMode) => void;
  setSelectedScenarioId: (id: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSessionStatus: (status: SessionStatus) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setIsRecording: (isRecording: boolean) => void;
  setAudioLevel: (level: number) => void;
}
