import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { Layout } from '../components/layout/Layout';
import { TranscriptPanel } from '../components/tutor/TranscriptPanel';
import { RecordButton } from '../components/audio/RecordButton';
import { AudioVisualizer } from '../components/audio/AudioVisualizer';
import { VoiceIndicator } from '../components/audio/VoiceIndicator';
import { TextInput } from '../components/tutor/TextInput';
import { Button } from '../components/ui/Button';

export default function Tutor() {
  const navigate = useNavigate();
  const { t } = useTranslation('tutor');
  const [showTextInput, setShowTextInput] = useState(false);
  
  const { 
    germanLevel, 
    uiLanguage, 
    tutorVoice,
    messages, 
    sessionStatus, 
    audioLevel, 
    isRecording,
    connectionStatus 
  } = useAppStore();

  const { connect, disconnect, sendAudio, sendText } = useWebSocket({ 
    level: germanLevel, 
    uiLanguage,
    voice: tutorVoice,
  });

  const { startRecording, stopRecording } = useAudioRecorder({ 
    onAudioData: sendAudio 
  });

  useEffect(() => {
    connect();
    return () => {
      stopRecording();
      disconnect();
    };
  }, [connect, disconnect, stopRecording]);

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('nav.back', 'Back')}
          </Button>
          
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-german-gold" />
            <span className="font-bold text-gray-900">{germanLevel}</span>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          <TranscriptPanel messages={messages} />
          
          {connectionStatus !== 'connected' && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-german-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-german-gold"></span>
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {connectionStatus === 'connecting' ? t('status.connecting', 'Connecting...') : t('status.disconnected', 'Disconnected')}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-6">
          <div className="w-full flex justify-center h-8">
            <VoiceIndicator status={sessionStatus} />
          </div>

          <div className="w-full flex flex-col items-center gap-4">
            {showTextInput ? (
              <div className="w-full max-w-2xl animate-fade-in-up">
                <TextInput onSend={sendText} disabled={connectionStatus !== 'connected'} />
                <button 
                  onClick={() => setShowTextInput(false)}
                  className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline w-full text-center"
                >
                  {t('controls.switchToVoice', 'Switch to Voice Mode')}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-8 w-full">
                  <div className="w-24 hidden sm:block">
                  </div>
                  
                  <div className="relative">
                    <RecordButton 
                      isRecording={isRecording} 
                      onClick={toggleRecording}
                      disabled={connectionStatus !== 'connected'} 
                    />
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-48">
                      <AudioVisualizer isRecording={isRecording || sessionStatus === 'speaking'} audioLevel={audioLevel} />
                    </div>
                  </div>

                  <div className="w-24 flex justify-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTextInput(true)}
                      className="rounded-full w-10 h-10 p-0 flex items-center justify-center text-gray-400 hover:text-german-gold hover:bg-amber-50"
                      title={t('controls.keyboard', 'Use Keyboard')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
