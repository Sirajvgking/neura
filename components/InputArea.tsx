import React, { useRef, useState, useEffect } from 'react';
import { Plus, X, Image as ImageIcon, Mic, MicOff, ArrowUp, Zap, ChevronDown, Sparkles } from 'lucide-react';
import { Attachment, AIConfig } from '../types';
import { MODELS } from '../constants';

interface InputAreaProps {
  onSend: (text: string, attachments: Attachment[], config: AIConfig) => void;
  isLoading: boolean;
  config: AIConfig;
  setConfig: React.Dispatch<React.SetStateAction<AIConfig>>;
}

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading, config, setConfig }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setText(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
    }
    onSend(text, attachments, config);
    setText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const filePromises = files.map((file) => new Promise<Attachment>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve({
                mimeType: file.type,
                data: (event.target?.result as string).split(',')[1],
                name: file.name
            });
        };
        reader.readAsDataURL(file);
      }));
      const newAttachments = await Promise.all(filePromises);
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const currentModel = MODELS.find(m => m.id === config.modelId) || MODELS[0];

  return (
    <div className="w-full max-w-[850px] mx-auto px-4 pb-6">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
          <div className="flex gap-3 px-2 pb-3 overflow-x-auto">
            {attachments.map((att, i) => (
              <div key={i} className="relative group flex-shrink-0 animate-fade-in-up">
                {att.mimeType.startsWith('image/') ? (
                    <img src={`data:${att.mimeType};base64,${att.data}`} className="h-16 w-16 object-cover rounded-xl border border-white/10 shadow-lg" alt="preview" />
                ) : (
                    <div className="h-16 w-16 bg-[#1e1e1e] flex items-center justify-center rounded-xl border border-white/10">
                        <ImageIcon size={24} className="text-gray-400" />
                    </div>
                )}
                <button 
                    onClick={() => removeAttachment(i)}
                    className="absolute -top-2 -right-2 bg-black/80 text-white rounded-full p-1 hover:bg-red-500 transition-colors shadow-md border border-white/10"
                >
                    <X size={12} />
                </button>
              </div>
            ))}
          </div>
      )}

      {/* Main Input Bar */}
      <div className={`
        relative flex items-end gap-2 bg-[#1e1e1e] rounded-[28px] p-2 pr-3
        transition-all duration-200
        ${isListening ? 'ring-1 ring-red-500/50' : ''}
      `}>
        
        {/* Left Actions Group */}
        <div className="flex items-center gap-1 mb-1 ml-1">
            {/* Add Button */}
            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect}/>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2d2d30] transition-colors"
            >
                <Plus size={20} strokeWidth={2} />
            </button>

            {/* Tools Button */}
            <button
                onClick={() => setConfig(prev => ({...prev, useSearch: !prev.useSearch}))}
                className={`
                   h-8 px-3 rounded-full flex items-center gap-1.5 text-xs font-medium transition-colors border border-transparent
                   ${config.useSearch 
                     ? 'bg-[#2d2d30] text-blue-400 border-white/5' 
                     : 'text-gray-400 hover:text-gray-200 hover:bg-[#2d2d30]'}
                `}
            >
                <Sparkles size={14} />
                <span>Tools</span>
            </button>
        </div>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Neura"
          rows={1}
          className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 py-3 px-2 resize-none outline-none max-h-[150px] text-[16px] leading-relaxed mb-0.5"
          style={{ minHeight: '44px' }}
        />

        {/* Right Actions Group */}
        <div className="flex items-center gap-2 mb-1">
             {/* Model Selector */}
             <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setShowModelMenu(!showModelMenu)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#2d2d30] hover:bg-[#38383b] text-xs font-medium text-gray-300 transition-colors"
                >
                    {currentModel.icon}
                    <span>{currentModel.name}</span>
                    <ChevronDown size={12} className="opacity-50" />
                </button>

                {/* Dropdown Menu */}
                {showModelMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#2d2d30] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-1">
                        {MODELS.map(model => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    setConfig(prev => ({...prev, modelId: model.id}));
                                    setShowModelMenu(false);
                                }}
                                className={`
                                    w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-[#3f3f42] transition-colors
                                    ${config.modelId === model.id ? 'bg-[#3f3f42]' : ''}
                                `}
                            >
                                <span className="text-lg">{model.icon}</span>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-200">{model.name}</div>
                                    <div className="text-[10px] text-gray-500">{model.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
             </div>

            {/* Mic / Send Button */}
            {text || attachments.length > 0 ? (
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className={`
                        w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
                        bg-white text-black hover:bg-gray-200 shadow-md
                        ${isLoading ? 'opacity-50' : ''}
                    `}
                >
                    <ArrowUp size={18} strokeWidth={2.5} />
                </button>
            ) : (
                <button
                    onClick={toggleListening}
                    className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${isListening ? 'bg-red-500/10 text-red-500 animate-pulse' : 'hover:bg-[#2d2d30] text-gray-400 hover:text-white'}`}
                >
                    {isListening ? <MicOff size={18} /> : <Mic size={20} />}
                </button>
            )}
        </div>
      </div>
      
      <div className="text-center mt-3">
         <p className="text-[11px] text-gray-500">
            Neura can make mistakes, so double-check it.
         </p>
      </div>
    </div>
  );
};