import React from 'react';
import { Trash2, Plus, Download, Search, LogOut, MessageSquare } from 'lucide-react';
import { Session, User } from '../types';
import { Logo } from './Logo';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onExportSession: () => void;
  user: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpen,
  onExportSession,
  user,
  onLogout
}) => {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-[280px] bg-[#0c0c0e] border-r border-white/5 
        transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col font-sans
      `}
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
         <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 text-white">
                <Logo className="w-full h-full" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Neura</span>
         </div>

        {/* New Chat Button */}
        <button 
            onClick={onNewSession}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white text-black hover:bg-gray-200 rounded-xl transition-all font-medium shadow-lg shadow-white/5"
        >
            <Plus size={18} />
            <span>New Chat</span>
        </button>
      </div>

      {/* Navigation placeholder */}
      <div className="px-5 py-2">
          <div className="flex items-center gap-3 text-sm text-gray-500 hover:text-gray-300 cursor-pointer px-2 py-2 rounded-lg transition-colors">
              <Search size={18} />
              <span>Search history</span>
          </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        <div className="text-xs font-semibold text-gray-600 px-4 py-2 uppercase tracking-widest mt-2">
          Recent
        </div>
        {sessions.length === 0 ? (
            <div className="text-gray-600 text-sm px-4 py-2 italic font-light">
                No conversation history.
            </div>
        ) : (
            sessions.map((session) => (
            <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`
                group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all duration-200 relative border border-transparent
                ${
                    activeSessionId === session.id
                    ? 'bg-[#18181b] text-white border-white/5 shadow-sm'
                    : 'text-gray-400 hover:bg-[#18181b]/50 hover:text-gray-200'
                }
                `}
            >
                <MessageSquare size={16} className={activeSessionId === session.id ? 'text-white' : 'text-gray-600'} />
                <span className="truncate flex-1 pr-6">{session.title}</span>
                
                {/* Delete Action */}
                <div 
                  className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#18181b] pl-2 ${activeSessionId !== session.id ? 'bg-transparent' : ''}`}
                >
                     <div
                        role="button"
                        onClick={(e) => onDeleteSession(e, session.id)}
                        className="p-1.5 hover:bg-red-900/30 hover:text-red-400 text-gray-500 rounded-md transition-colors"
                    >
                        <Trash2 size={14} />
                    </div>
                </div>
            </button>
            ))
        )}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 bg-[#09090b]">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#18181b] border border-white/5 shadow-inner">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden shrink-0">
                {user.avatar ? (
                   <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                   <span className="text-xs font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user.name}</div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
            
            <div className="flex items-center">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onExportSession(); }}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors"
                    title="Export Data"
                >
                    <Download size={16} />
                </button>
                <button 
                    onClick={onLogout}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                    title="Log Out"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </div>
      </div>
    </aside>
  );
};