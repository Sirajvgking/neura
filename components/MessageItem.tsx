import React from 'react';
import { User, FileText, ExternalLink, Download } from 'lucide-react';
import { Message } from '../types';
import { MarkdownRenderer } from '../utils/markdown';
import { Logo } from './Logo';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const handleDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`w-full py-4 ${isUser ? '' : ''}`}>
      <div className="max-w-[850px] mx-auto px-4 flex gap-4 md:gap-6">
        
        {/* Avatar - Only for Bot */}
        {!isUser && (
            <div className="flex-shrink-0 flex flex-col relative pt-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                <Logo className="w-6 h-6 text-white" />
              </div>
            </div>
        )}

        {/* Spacer for User if we want alignment, but usually we just float right */}
        {isUser && <div className="flex-1" />}

        {/* Content Container */}
        <div className={`
            relative overflow-hidden min-w-0 max-w-[85%]
            ${isUser ? 'bg-[#27272a] px-5 py-3.5 rounded-3xl rounded-tr-md text-gray-100' : 'flex-1 pt-1'}
        `}>
          
          {/* User Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`flex flex-wrap gap-2 mb-3 ${isUser ? 'justify-end' : ''}`}>
              {message.attachments.map((att, idx) => (
                att.mimeType.startsWith('image/') ? (
                   <img 
                    key={idx} 
                    src={`data:${att.mimeType};base64,${att.data}`} 
                    alt="attachment" 
                    className="h-40 w-auto object-cover rounded-xl border border-white/10 shadow-md"
                   />
                ) : (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-black/20 rounded-lg border border-white/5">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-xs text-gray-300">{att.name || 'Attached File'}</span>
                    </div>
                )
              ))}
            </div>
          )}

          {/* Text Content */}
          <div className={`prose prose-invert max-w-none text-[15px] leading-7 font-light tracking-wide ${isUser ? 'text-gray-100' : 'text-gray-200'}`}>
            {message.content ? (
                <MarkdownRenderer content={message.content} />
            ) : (
                !message.generatedImages && <span className="animate-pulse text-gray-500">Thinking...</span>
            )}
          </div>
          
          {/* Generated Images (Bot only usually) */}
          {message.generatedImages && message.generatedImages.length > 0 && (
             <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {message.generatedImages.map((img, idx) => (
                     <div key={idx} className="relative group/image overflow-hidden rounded-2xl border border-white/10 shadow-lg bg-black/20">
                         <img 
                            src={`data:${img.mimeType};base64,${img.data}`} 
                            alt={`Generated ${idx + 1}`} 
                            className="w-full h-auto"
                         />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                                onClick={() => handleDownload(`data:${img.mimeType};base64,${img.data}`, `neura-generated-${idx}.png`)}
                                className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-colors"
                            >
                                <Download size={20} />
                            </button>
                         </div>
                     </div>
                 ))}
             </div>
          )}

          {/* Grounding Sources (Bot only) */}
          {message.groundingSources && message.groundingSources.length > 0 && (
             <div className="mt-4 pt-3 border-t border-white/5">
                 <div className="flex items-center gap-2 mb-2">
                     <div className="p-1 rounded bg-[#27272a]">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                     </div>
                     <span className="text-xs font-medium text-gray-400">Sources</span>
                 </div>
                 <div className="flex flex-wrap gap-2">
                     {message.groundingSources.slice(0, 3).map((source, i) => (
                         <a 
                            key={i} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#27272a] rounded-full text-xs text-gray-300 transition-colors border border-white/5 max-w-[200px]"
                         >
                            <ExternalLink size={10} className="text-gray-500" />
                            <span className="truncate">{source.title || new URL(source.uri).hostname}</span>
                         </a>
                     ))}
                 </div>
             </div>
          )}

          {/* Error State */}
          {message.error && (
             <div className="mt-2 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/10 inline-block">
                 Request failed.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};