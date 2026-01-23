import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '../store';

const SAMPLE_RATE = 24000;

interface UseAudioRecorderOptions {
  onAudioData?: (data: ArrayBuffer) => void;
}

export function useAudioRecorder({ onAudioData }: UseAudioRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const { setIsRecording: setStoreRecording, setAudioLevel } = useAppStore();
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average);
    
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isRecording, setAudioLevel]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });

      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      await audioContextRef.current.audioWorklet.addModule(
        URL.createObjectURL(
          new Blob([`
            class AudioProcessor extends AudioWorkletProcessor {
              process(inputs) {
                const input = inputs[0];
                if (input && input[0]) {
                  const samples = input[0];
                  const int16 = new Int16Array(samples.length);
                  for (let i = 0; i < samples.length; i++) {
                    int16[i] = Math.max(-32768, Math.min(32767, samples[i] * 32768));
                  }
                  this.port.postMessage(int16.buffer);
                }
                return true;
              }
            }
            registerProcessor('audio-processor', AudioProcessor);
          `], { type: 'application/javascript' })
        )
      );

      workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, 'audio-processor');
      workletNodeRef.current.port.onmessage = (event) => {
        onAudioData?.(event.data);
      };

      source.connect(workletNodeRef.current);
      
      setIsRecording(true);
      setStoreRecording(true);
      updateAudioLevel();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [onAudioData, setStoreRecording, updateAudioLevel]);

  const stopRecording = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
    setStoreRecording(false);
    setAudioLevel(0);
  }, [setStoreRecording, setAudioLevel]);

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
}
