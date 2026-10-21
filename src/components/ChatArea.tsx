import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Lock,
  Flame,
  Shield,
  Trash2,
  Clock,
  CheckCheck,
  AlertTriangle,
  User,
  Hash
} from 'lucide-react';
import { ChatMessage, Friend, ChatGroup } from '../types';

interface ChatAreaProps {
  currentChatId: string | null;
  chatType: 'direct' | 'group';
  targetFriend?: Friend;
  targetGroup?: ChatGroup;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  myUserId: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  currentChatId,
  chatType,
  targetFriend,
  targetGroup,
  messages,
  onSendMessage,
  onClearChat,
  myUserId,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  if (!currentChatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8 text-center select-none">
        <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 glow-border">
          <Shield className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold font-mono text-white tracking-wide">
          SECURE TERMINAL READY
        </h2>
        <p className="text-sm text-slate-400 max-w-md mt-2 leading-relaxed">
          Select a friend from the sidebar or join an encrypted group room.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg w-full text-left font-mono">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="text-[11px] text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> ZERO CLOUD DB
            </div>
            <div className="text-[10px] text-slate-400">
              Messages never hit any remote database or disk.
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="text-[11px] text-amber-400 font-bold mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> 30M SELF-DESTRUCT
            </div>
            <div className="text-[10px] text-slate-400">
              Strict 30-minute countdown per message in volatile RAM.
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="text-[11px] text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> TAMPER PROOF
            </div>
            <div className="text-[10px] text-slate-400">
              F12, inspect, right-click & export disabled.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const title = chatType === 'direct' ? targetFriend?.username || currentChatId : targetGroup?.name || currentChatId;
  const subtitle = chatType === 'direct' ? `Peer ID: ${currentChatId}` : `Room Code: ${currentChatId}`;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative select-none">
      {/* Chat Header */}
      <div className="px-6 py-3.5 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            {chatType === 'direct' ? <User className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono rounded flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> AES-256
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span>{subtitle}</span>
              <span>•</span>
              <span className="text-amber-400 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Auto-burn: 30m
              </span>
            </div>
          </div>
        </div>

        {/* Clear Chat Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClearChat}
            title="Immediately burn and erase current messages from memory"
            className="px-3 py-1.5 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-300 rounded-lg text-xs font-mono transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Burn Room Chat</span>
          </button>
        </div>
      </div>

      {/* Ephemeral Warning Sub-banner */}
      <div className="bg-amber-950/20 border-b border-amber-900/30 px-6 py-1.5 text-center text-[10px] font-mono text-amber-300/80 flex items-center justify-center gap-2">
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        <span>EPHEMERAL ENCLAVE: All messages self-destruct in 30 minutes. No cloud storage or backups exist.</span>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Clock className="w-8 h-8 text-slate-700 mb-2 animate-spin-slow" />
            <p className="text-xs font-mono">No messages in memory</p>
            <p className="text-[11px] text-slate-600 mt-1 max-w-xs">
              Say hello! Every message sent will automatically vanish after 30 minutes.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === myUserId || msg.isMine;
            const remainingMs = Math.max(0, msg.expiresAt - Date.now());
            const remainingMins = Math.floor(remainingMs / 60000);
            const remainingSecs = Math.floor((remainingMs % 60000) / 1000);
            const timeString = `${remainingMins}:${remainingSecs.toString().padStart(2, '0')}`;

            const isUrgent = remainingMins < 5;
            const isWarning = remainingMins < 15;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group`}
              >
                {/* Sender & Timestamp */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mb-1 px-1">
                  <span className="font-semibold text-slate-400">{msg.senderName}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-cyan-500/70">[AES-256]</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl shadow-lg border relative transition-all ${
                    isMine
                      ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-50 rounded-tr-none'
                      : 'bg-slate-900/90 border-slate-800 text-slate-100 rounded-tl-none'
                  }`}
                >
                  <p className="text-sm break-words whitespace-pre-wrap leading-relaxed select-none">
                    {msg.content}
                  </p>

                  {/* Countdown Timer Footer */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3 text-[10px] font-mono">
                    <span
                      className={`flex items-center gap-1 font-bold ${
                        isUrgent
                          ? 'text-red-400 animate-pulse'
                          : isWarning
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                      title="Time remaining before message is permanently erased"
                    >
                      <Clock className="w-2.5 h-2.5" />
                      ⏱ {timeString}
                    </span>

                    {isMine && (
                      <span className="text-cyan-400/80 flex items-center gap-0.5">
                        <CheckCheck className="w-3 h-3 text-cyan-400" />
                        Delivered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type end-to-end encrypted message... (Enter to send)"
            className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 rounded-xl shadow-lg transition duration-150 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>🔒 End-to-End Encrypted via WebCrypto SubtleCrypto</span>
          <span>Right-click & Developer Tools Protected</span>
        </div>
      </div>
    </div>
  );
};
