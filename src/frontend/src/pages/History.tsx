import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TranscriptPanel } from '../components/tutor/TranscriptPanel';
import type { Message } from '../store/types';

interface ConversationSummary {
  id: string;
  session_id: string;
  level: string;
  created_at: string;
  duration_seconds: number;
  message_count: number;
}

interface ApiMessage {
  role: string;
  content: string;
  timestamp?: number;
}

export default function History() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [conversationDetails, setConversationDetails] = useState<Record<string, Message[]>>({});
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);

  const getApiUrl = async () => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    try {
      const response = await fetch('/config.json');
      if (response.ok) {
        const config = await response.json();
        return config.apiUrl || 'http://localhost:8000';
      }
    } catch {
    }
    return 'http://localhost:8000';
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const apiUrl = await getApiUrl();
      const response = await fetch(`${apiUrl}/api/conversations`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(t('history.error', 'Failed to load conversation history'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (sessionId: string) => {
    if (expandedId === sessionId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(sessionId);

    if (!conversationDetails[sessionId]) {
      try {
        setLoadingDetails(sessionId);
        const apiUrl = await getApiUrl();
        const response = await fetch(`${apiUrl}/api/conversations/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch conversation details');
        }
        
        const data = await response.json();
        
        const mappedMessages: Message[] = (data.messages || []).map((msg: ApiMessage, index: number) => ({
          id: `${sessionId}-${index}`,
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: msg.timestamp ? msg.timestamp * 1000 : Date.now(),
        }));
        
        setConversationDetails(prev => ({
          ...prev,
          [sessionId]: mappedMessages
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetails(null);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 animate-fade-in-up">
          <div className="flex items-center gap-4">
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
            <h1 className="text-2xl font-bold text-gray-900">{t('history.title', 'Conversation History')}</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
               <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200 animate-pulse">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-german-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-german-gold"></span>
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {t('history.loading', 'Loading history...')}
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-xl border border-red-100">
              <p className="text-red-500">{error}</p>
              <Button 
                variant="ghost" 
                onClick={fetchConversations}
                className="mt-4"
              >
                {t('history.retry', 'Try Again')}
              </Button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 border-dashed animate-fade-in-up">
              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('history.empty', 'No conversations yet')}</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                {t('history.emptyDesc', 'Start a new session to practice your German skills.')}
              </p>
              <Button onClick={() => navigate('/tutor')}>
                {t('home.start', 'Start Learning')}
              </Button>
            </div>
          ) : (
            conversations.map((conv, idx) => (
              <Card 
                key={conv.session_id} 
                className={`transition-all duration-300 ${
                  expandedId === conv.session_id ? 'ring-2 ring-german-gold ring-opacity-50' : 'hover:shadow-md'
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => handleExpand(conv.session_id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-german-gold font-bold text-lg border border-primary-100">
                        {conv.level}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatDate(conv.created_at)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDuration(conv.duration_seconds)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            {conv.message_count} {t('history.messages', 'messages')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className={`transform transition-transform duration-300 ${expandedId === conv.session_id ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedId === conv.session_id && (
                  <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in">
                    {loadingDetails === conv.session_id ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-german-gold"></div>
                      </div>
                    ) : conversationDetails[conv.session_id] ? (
                      <div className="bg-gray-50 rounded-xl border border-gray-100 h-[500px] flex flex-col">
                        <TranscriptPanel messages={conversationDetails[conv.session_id]} />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-red-500">
                        {t('history.errorDetails', 'Failed to load details')}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
