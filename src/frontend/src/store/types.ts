export type GermanLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type UILanguage = 'en' | 'zh' | 'de';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type SessionStatus = 'idle' | 'listening' | 'speaking' | 'thinking';
export type TutorVoice = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
}

export interface AppState {
  germanLevel: GermanLevel;
  uiLanguage: UILanguage;
  tutorVoice: TutorVoice;
  connectionStatus: ConnectionStatus;
  sessionStatus: SessionStatus;
  messages: Message[];
  isRecording: boolean;
  audioLevel: number;
  
  setGermanLevel: (level: GermanLevel) => void;
  setUILanguage: (language: UILanguage) => void;
  setTutorVoice: (voice: TutorVoice) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSessionStatus: (status: SessionStatus) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setIsRecording: (isRecording: boolean) => void;
  setAudioLevel: (level: number) => void;
}
