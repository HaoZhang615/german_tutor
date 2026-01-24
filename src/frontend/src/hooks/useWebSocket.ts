import { useCallback, useRef, useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { getAccessToken, loadConfig } from '../services/api';

const SAMPLE_RATE = 24000;

interface UseWebSocketOptions {
  level: string;
  uiLanguage: string;
  voice: string;
}

export function useWebSocket({ level, uiLanguage, voice }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { setConnectionStatus, setSessionStatus, addMessage } = useAppStore();
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const currentAudioSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);

  const stopAllAudio = useCallback(() => {
    currentAudioSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // ignored - source may already be stopped
      }
    });
    currentAudioSourcesRef.current = [];
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    nextPlayTimeRef.current = 0;
  }, []);

  const playNextAudioChunk = useCallback(async () => {
    if (audioQueueRef.current.length === 0) {
      if (!isPlayingRef.current) {
        setSessionStatus('idle');
      }
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });
    }

    const ctx = audioContextRef.current;
    
    while (audioQueueRef.current.length > 0) {
      const audioData = audioQueueRef.current.shift()!;
      
      const audioBuffer = ctx.createBuffer(1, audioData.length, SAMPLE_RATE);
      audioBuffer.getChannelData(0).set(audioData);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      currentAudioSourcesRef.current.push(source);
      
      source.onended = () => {
        const index = currentAudioSourcesRef.current.indexOf(source);
        if (index > -1) {
          currentAudioSourcesRef.current.splice(index, 1);
        }
        if (currentAudioSourcesRef.current.length === 0 && audioQueueRef.current.length === 0) {
          isPlayingRef.current = false;
          setSessionStatus('idle');
        }
      };

      const startTime = Math.max(ctx.currentTime, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;
      
      isPlayingRef.current = true;
      setSessionStatus('speaking');
    }
  }, [setSessionStatus]);

  // Define handleMessage BEFORE connect so it can be referenced
  const handleMessage = useCallback((data: Record<string, unknown>) => {
    const eventType = data.type as string;

    switch (eventType) {
      case 'session.created':
      case 'session.updated':
        break;

      case 'response.audio.delta': {
        const base64Audio = data.delta as string;
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const int16Array = new Int16Array(bytes.buffer);
        const floatArray = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
          floatArray[i] = int16Array[i] / 32768;
        }
        audioQueueRef.current.push(floatArray);
        playNextAudioChunk();
        break;
      }

      case 'response.audio_transcript.delta': {
        break;
      }

      case 'response.audio_transcript.done': {
        const transcript = data.transcript as string;
        if (transcript) {
          addMessage({ role: 'assistant', content: transcript });
        }
        break;
      }

      case 'conversation.item.input_audio_transcription.completed': {
        const transcript = data.transcript as string;
        if (transcript) {
          addMessage({ role: 'user', content: transcript });
        }
        break;
      }

      case 'input_audio_buffer.speech_started':
        stopAllAudio();
        setSessionStatus('listening');
        break;

      case 'input_audio_buffer.speech_stopped':
        setSessionStatus('thinking');
        break;

      case 'error': {
        const errorMsg = (data.error as Record<string, string>)?.message || 'Unknown error';
        console.error('WebSocket error:', errorMsg);
        break;
      }
    }
  }, [addMessage, setSessionStatus, playNextAudioChunk, stopAllAudio]);

  const connect = useCallback(async () => {
    setConnectionStatus('connecting');
    
    const config = await loadConfig();
    const token = getAccessToken();
    
    // Build WebSocket URL with auth token
    const params = new URLSearchParams({
      level,
      ui_language: uiLanguage,
      voice,
    });
    if (token) {
      params.append('token', token);
    }
    
    const wsUrl = `${config.wsUrl}/ws/realtime?${params.toString()}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
    };

    ws.onclose = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      wsRef.current = null;
    };

    ws.onerror = () => {
      setConnectionStatus('error');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleMessage(data);
      } catch {
        console.error('Failed to parse message');
      }
    };
  }, [level, uiLanguage, voice, setConnectionStatus, handleMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const base64 = btoa(String.fromCharCode(...new Uint8Array(audioData)));
      wsRef.current.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: base64,
      }));
    }
  }, []);

  const sendText = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text }],
        },
      }));
      wsRef.current.send(JSON.stringify({ type: 'response.create' }));
      addMessage({ role: 'user', content: text });
    }
  }, [addMessage]);

  useEffect(() => {
    return () => {
      disconnect();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
    sendAudio,
    sendText,
  };
}
