import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TranscriptPanel } from '../components/tutor/TranscriptPanel';
import { api } from '../services/api';
import type { Message, ConversationSummary } from '../store/types';

interface ApiMessage {
  role: string;
  content: string;
  timestamp?: string;
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
  const [exporting, setExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      setError(t('history.error', 'Failed to load conversation history'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (conversationId: string) => {
    if (expandedId === conversationId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(conversationId);

    if (!conversationDetails[conversationId]) {
      try {
        setLoadingDetails(conversationId);
        const data = await api.getConversation(conversationId);
        
        const mappedMessages: Message[] = (data.messages || []).map((msg: ApiMessage, index: number) => ({
          id: `${conversationId}-${index}`,
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now(),
        }));
        
        setConversationDetails(prev => ({
          ...prev,
          [conversationId]: mappedMessages
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetails(null);
      }
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await api.exportConversations();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `german-tutor-conversations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm(t('history.confirmDelete', 'Are you sure you want to delete this conversation?'))) {
      return;
    }

    try {
      setDeletingId(conversationId);
      await api.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (expandedId === conversationId) {
        setExpandedId(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeletingAll(true);
      await api.deleteAllConversations();
      setConversations([]);
      setConversationDetails({});
      setExpandedId(null);
      setShowDeleteAllConfirm(false);
    } catch (err) {
      console.error('Delete all failed:', err);
    } finally {
      setDeletingAll(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
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
          
          {conversations.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2"
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
                {t('history.export', 'Export')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteAllConfirm(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {t('history.deleteAll', 'Delete All')}
              </Button>
            </div>
          )}
        </div>

        {/* Delete All Confirmation Modal */}
        {showDeleteAllConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {t('history.deleteAllTitle', 'Delete All Conversations?')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('history.deleteAllDesc', 'This action cannot be undone. All your conversation history will be permanently deleted.')}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteAllConfirm(false)}
                    disabled={deletingAll}
                  >
                    {t('common.cancel', 'Cancel')}
                  </Button>
                  <Button
                    onClick={handleDeleteAll}
                    disabled={deletingAll}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deletingAll ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {t('common.deleting', 'Deleting...')}
                      </span>
                    ) : (
                      t('history.deleteAll', 'Delete All')
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

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
                key={conv.id} 
                className={`transition-all duration-300 ${
                  expandedId === conv.id ? 'ring-2 ring-german-gold ring-opacity-50' : 'hover:shadow-md'
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => handleExpand(conv.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-german-gold font-bold text-lg border border-primary-100">
                        {conv.level}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatDate(conv.started_at)}
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
                      <button
                        onClick={(e) => handleDelete(conv.id, e)}
                        disabled={deletingId === conv.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('history.delete', 'Delete')}
                      >
                        {deletingId === conv.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                      <div className={`transform transition-transform duration-300 ${expandedId === conv.id ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedId === conv.id && (
                  <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in">
                    {loadingDetails === conv.id ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-german-gold"></div>
                      </div>
                    ) : conversationDetails[conv.id] ? (
                      <div className="bg-gray-50 rounded-xl border border-gray-100 h-[500px] flex flex-col">
                        <TranscriptPanel messages={conversationDetails[conv.id]} />
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
