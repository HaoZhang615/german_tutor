import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { Layout } from '../components/layout/Layout';
import { LiveTranscript } from '../components/tutor/LiveTranscript';
import { RecordButton } from '../components/audio/RecordButton';
import { WaveformVisualizer } from '../components/audio/WaveformVisualizer';
import { VoiceIndicator } from '../components/audio/VoiceIndicator';
import { TextInput } from '../components/tutor/TextInput';
import { Button } from '../components/ui/Button';
import { scenarios } from '../data/scenarios';

export default function Tutor() {
  const navigate = useNavigate();
  const { t } = useTranslation(['tutor', 'common']);
  const [showTextInput, setShowTextInput] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  
  const { 
    germanLevel, 
    uiLanguage, 
    tutorVoice,
    learningMode,
    selectedScenarioId,
    messages, 
    sessionStatus, 
    isRecording,
    connectionStatus 
  } = useAppStore();

  const selectedScenario = selectedScenarioId 
    ? scenarios.find(s => s.id === selectedScenarioId) 
    : null;

  const { connect, disconnect, sendAudio, sendText } = useWebSocket({ 
    level: germanLevel, 
    uiLanguage,
    voice: tutorVoice,
    learningMode,
    scenarioId: selectedScenarioId,
  });

  const { startRecording, stopRecording, togglePause, isPaused, mediaStream } = useAudioRecorder({ 
    onAudioData: sendAudio 
  });

  const audioResources = useMemo(() => {
    if (!isRecording || !mediaStream) {
      return null;
    }
    const ctx = new AudioContext({ sampleRate: 24000 });
    const sourceNode = ctx.createMediaStreamSource(mediaStream);
    return { ctx, sourceNode };
  }, [isRecording, mediaStream]);

  useEffect(() => {
    return () => {
      if (audioResources) {
        audioResources.sourceNode.disconnect();
        audioResources.ctx.close();
      }
    };
  }, [audioResources]);

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

  const handleEndConversation = () => {
    stopRecording();
    disconnect();
    setShowEndModal(true);
  };

  const handleCloseModal = () => {
    setShowEndModal(false);
    navigate('/');
  };

  const handleGoToHistory = () => {
    setShowEndModal(false);
    navigate('/history');
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
            {t('common:nav.back', 'Back')}
          </Button>
          
          {selectedScenario && (
            <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-2xl">{selectedScenario.icon}</span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  {selectedScenario.title}
                </span>
                <span className="text-xs text-gray-500">
                  {learningMode === 'immersive' 
                    ? t('common:scenario.talkingTo', 'Talking to: {{role}}', { role: selectedScenario.targetRole })
                    : t('common:scenario.practicing', 'Practicing with tutor')}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEndConversation}
              className="flex items-center gap-2 text-german-red hover:bg-red-50"
              disabled={connectionStatus !== 'connected'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              {t('common:tutor.endConversation', 'End Conversation')}
            </Button>
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-german-gold" />
              <span className="font-bold text-gray-900">{germanLevel}</span>
              {learningMode === 'immersive' && (
                <span className="text-xs px-2 py-0.5 bg-german-red/10 text-german-red rounded-full font-medium">
                  {t('common:mode.immersive', 'Immersive')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          <LiveTranscript messages={messages} />
          
          {connectionStatus !== 'connected' && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-german-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-german-gold"></span>
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {connectionStatus === 'connecting' ? t('common:status.connecting', 'Connecting...') : t('common:status.disconnected', 'Disconnected')}
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
                  {t('common:controls.switchToVoice', 'Switch to Voice Mode')}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-8 w-full">
                  <div className="w-24 flex justify-end">
                    {isRecording && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePause}
                        className={`rounded-full w-12 h-12 p-0 flex items-center justify-center transition-colors ${
                          isPaused 
                            ? 'text-german-gold bg-amber-50 hover:bg-amber-100' 
                            : 'text-gray-400 hover:text-german-gold hover:bg-amber-50'
                        }`}
                        title={isPaused ? t('common:actions.resume', 'Resume') : t('common:actions.pause', 'Pause')}
                      >
                        {isPaused ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <div className="relative flex flex-col items-center">
                    <RecordButton 
                      isRecording={isRecording} 
                      onClick={toggleRecording}
                      disabled={connectionStatus !== 'connected'} 
                    />
                    <div className="mt-4 w-64 h-16">
                      <WaveformVisualizer 
                        audioContext={audioResources?.ctx}
                        sourceNode={audioResources?.sourceNode ?? null}
                        isActive={isRecording && !isPaused}
                        color={sessionStatus === 'speaking' ? '#DD0000' : '#FFCC00'}
                      />
                    </div>
                  </div>

                  <div className="w-24 flex justify-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTextInput(true)}
                      className="rounded-full w-12 h-12 p-0 flex items-center justify-center text-gray-400 hover:text-german-gold hover:bg-amber-50"
                      title={t('common:controls.keyboard', 'Use Keyboard')}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {showEndModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl animate-fade-in-up">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                {t('common:tutor.conversationSaved', 'Conversation Saved!')}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {t('common:tutor.checkHistoryForEvaluation', 'Your conversation has been logged. Check your history for a detailed evaluation of your performance.')}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  {t('common:nav.home', 'Home')}
                </Button>
                <Button
                  onClick={handleGoToHistory}
                  className="flex-1"
                >
                  {t('common:tutor.viewHistory', 'View History')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
