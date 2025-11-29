import React, { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { InputArea } from './InputArea';
import { Message, AIConfig, Attachment } from '../types';
import { Share } from 'lucide-react';
import { PLACEHOLDER_QUESTIONS } from '../constants';
import { Logo } from './Logo';

interface ChatAreaProps {
  messages: Message[];
  onSend: (text: string, attachments: Attachment[], config: AIConfig) => void;
  isLoading: boolean;
  config: AIConfig;
  setConfig: React.Dispatch<React.SetStateAction<AIConfig>>;
  isSidebarOpen: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSend, isLoading, config, setConfig, isSidebarOpen }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#09090b] relative">
        {/* Minimal Header */}
        <div className="absolute top-0 right-0 z-10 p-4">
             <button className="p-2 hover:bg-[#1e1e1e] rounded-full text-gray-400 hover:text-white transition-colors" title="Share Chat">
                <Share size={18} />
             </button>
        </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center pt-20">
             <div className="w-16 h-16 bg-gradient-to-br from-[#1e1e1e] to-black rounded-2xl flex items-center justify-center mb-6 shadow-2xl border border-white/5 p-3 animate-fade-in-up">
                 <Logo className="w-full h-full text-white" />
             </div>
             <h2 className="text-2xl font-medium text-white mb-8 tracking-tight">How can I help you today?</h2>
             <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-3 px-4">
                 {PLACEHOLDER_QUESTIONS.map((q, i) => (
                     <button 
                        key={i} 
                        onClick={() => onSend(q, [], config)}
                        className="text-sm p-4 bg-[#1e1e1e] border border-white/5 hover:bg-[#27272a] hover:border-white/10 rounded-2xl text-left transition-all text-gray-300 hover:text-white"
                    >
                         {q}
                     </button>
                 ))}
             </div>
          </div>
        ) : (
          <div className="pb-4 pt-4">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>
      
      <div className="w-full bg-[#09090b]">
        <InputArea onSend={onSend} isLoading={isLoading} config={config} setConfig={setConfig} />
      </div>
    </div>
  );
};