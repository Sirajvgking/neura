import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { Session, Message, AIConfig, Attachment, User } from './types';
import { DEFAULT_CONFIG } from './constants';
import { geminiService } from './services/geminiService';
import { authService } from './services/authService';
import { AuthPage } from './components/AuthPage';

// Simple UUID generator
const generateId = () => Math.random().toString(36).substring(2, 15);

function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // App State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);

  // 1. Check for existing session
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsAuthChecking(false);
  }, []);

  // 2. Initialize chats once logged in
  useEffect(() => {
     if (user && sessions.length === 0) {
         createNewSession();
     }
  }, [user]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setSessions([]);
    setActiveSessionId(null);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const createNewSession = () => {
    const newSession: Session = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      modelId: config.modelId,
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    geminiService.reset(); 
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => {
        const newSessions = prev.filter(s => s.id !== id);
        if (activeSessionId === id) {
            setActiveSessionId(newSessions.length > 0 ? newSessions[0].id : null);
        }
        return newSessions;
    });
    if (sessions.length <= 1) {
         createNewSession();
    }
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleExportSession = () => {
    if (!activeSession) return;
    try {
        const jsonString = JSON.stringify(activeSession, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chat-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export session:", error);
    }
  };

  const handleSend = async (text: string, attachments: Attachment[], currentConfig: AIConfig) => {
    if (!activeSessionId) return;

    const userMsgId = generateId();
    const modelMsgId = generateId();

    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      attachments,
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMsg],
          title: s.messages.length === 0 ? (text.slice(0, 30) + (text.length > 30 ? '...' : '')) : s.title,
          updatedAt: Date.now()
        };
      }
      return s;
    }));

    setIsLoading(true);

    const placeholderModelMsg: Message = {
        id: modelMsgId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
        isStreaming: true
    };

    setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
            return { ...s, messages: [...s.messages, placeholderModelMsg] };
        }
        return s;
    }));

    try {
        const currentSession = sessions.find(s => s.id === activeSessionId);
        const history = currentSession ? [...currentSession.messages, userMsg] : [userMsg];

        const stream = geminiService.streamMessage(
            currentConfig.modelId,
            text,
            attachments,
            history, 
            currentConfig.useSearch
        );

        let accumulatedText = "";
        let accumulatedSources: any[] = [];
        let accumulatedImages: Attachment[] = [];

        for await (const chunk of stream) {
            accumulatedText += chunk.text;
            
            if (chunk.groundingChunks) {
                const newSources = chunk.groundingChunks
                    .filter((c: any) => c.web?.uri || c.web?.title)
                    .map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
                accumulatedSources = [...accumulatedSources, ...newSources];
            }

            if (chunk.generatedImages && chunk.generatedImages.length > 0) {
                 accumulatedImages = [...accumulatedImages, ...chunk.generatedImages];
            }

            setSessions(prev => prev.map(s => {
                if (s.id === activeSessionId) {
                    const updatedMessages = s.messages.map(m => {
                        if (m.id === modelMsgId) {
                            return { 
                                ...m, 
                                content: accumulatedText,
                                groundingSources: accumulatedSources.length > 0 ? accumulatedSources : undefined,
                                generatedImages: accumulatedImages.length > 0 ? accumulatedImages : undefined
                            };
                        }
                        return m;
                    });
                    return { ...s, messages: updatedMessages };
                }
                return s;
            }));
        }

    } catch (error) {
        console.error("Error sending message", error);
        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                const updatedMessages = s.messages.map(m => {
                    if (m.id === modelMsgId) {
                        return { ...m, error: true, content: m.content || "Sorry, I encountered an error." };
                    }
                    return m;
                });
                return { ...s, messages: updatedMessages };
            }
            return s;
        }));
    } finally {
        setIsLoading(false);
        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                const updatedMessages = s.messages.map(m => {
                    if (m.id === modelMsgId) return { ...m, isStreaming: false };
                    return m;
                });
                return { ...s, messages: updatedMessages };
            }
            return s;
        }));
    }
  };

  if (isAuthChecking) return null; // Or a splash screen

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden font-sans">
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={createNewSession}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onExportSession={handleExportSession}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col h-full relative w-full bg-[#09090b]">
        {!isSidebarOpen && (
             <div className="md:hidden flex items-center p-3 absolute top-0 left-0 z-20 gap-2">
                <button 
                  onClick={() => setIsSidebarOpen(true)} 
                  className="p-2 text-gray-400 hover:text-white bg-black/40 backdrop-blur-md rounded-lg border border-white/5"
                >
                    <Menu size={20} />
                </button>
            </div>
        )}

        <ChatArea 
            messages={activeSession?.messages || []}
            onSend={handleSend}
            isLoading={isLoading}
            config={config}
            setConfig={setConfig}
            isSidebarOpen={isSidebarOpen}
        />
      </div>
    </div>
  );
}

export default App;