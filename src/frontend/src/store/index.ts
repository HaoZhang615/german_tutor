import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  AuthState,
  AuthStatus,
  GermanLevel,
  UILanguage,
  TutorVoice,
  ConnectionStatus,
  SessionStatus,
  Message,
  User,
} from './types';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      germanLevel: 'A1',
      uiLanguage: 'en',
      tutorVoice: 'alloy',
      connectionStatus: 'disconnected',
      sessionStatus: 'idle',
      messages: [],
      isRecording: false,
      audioLevel: 0,

      setGermanLevel: (level: GermanLevel) => set({ germanLevel: level }),
      
      setUILanguage: (language: UILanguage) => set({ uiLanguage: language }),
      
      setTutorVoice: (voice: TutorVoice) => set({ tutorVoice: voice }),
      
      setConnectionStatus: (status: ConnectionStatus) => set({ connectionStatus: status }),
      
      setSessionStatus: (status: SessionStatus) => set({ sessionStatus: status }),
      
      addMessage: (message: Omit<Message, 'id' | 'timestamp'>) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),
      
      clearMessages: () => set({ messages: [] }),
      
      setIsRecording: (isRecording: boolean) => set({ isRecording }),
      
      setAudioLevel: (level: number) => set({ audioLevel: level }),
    }),
    {
      name: 'german-tutor-storage',
      partialize: (state) => ({
        germanLevel: state.germanLevel,
        uiLanguage: state.uiLanguage,
        tutorVoice: state.tutorVoice,
      }),
    }
  )
);

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: 'idle' as AuthStatus,
      error: null,

      setUser: (user: User | null) => set({ user }),
      
      setStatus: (status: AuthStatus) => set({ status }),
      
      setError: (error: string | null) => set({ error }),
      
      logout: () => set({ user: null, status: 'unauthenticated', error: null }),
    }),
    {
      name: 'german-tutor-auth',
      partialize: (state) => ({
        // Only persist user data, not status or error
        user: state.user,
      }),
    }
  )
);

export type {
  GermanLevel,
  UILanguage,
  TutorVoice,
  ConnectionStatus,
  SessionStatus,
  Message,
  User,
  AuthStatus,
};
