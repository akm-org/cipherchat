import React from 'react';
import { ShieldAlert, AlertTriangle, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { SecurityEvent } from '../types';

interface SecurityOverlayProps {
  isDevtoolsOpen: boolean;
  isWindowBlurred: boolean;
  privacyShieldEnabled: boolean;
  onDismissBlur: () => void;
  securityEvents: SecurityEvent[];
  onDismissEvent: (id: string) => void;
}

export const SecurityOverlay: React.FC<SecurityOverlayProps> = ({
  isDevtoolsOpen,
  isWindowBlurred,
  privacyShieldEnabled,
  onDismissBlur,
  securityEvents,
  onDismissEvent,
}) => {
  return (
    <>
      {/* DevTools Detected Tamper Lockout */}
      {isDevtoolsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 backdrop-blur-xl animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border-2 border-red-500/80 rounded-2xl p-6 text-center shadow-2xl glow-border-danger">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/40">
              <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-red-400 tracking-wider uppercase font-mono">
              TAMPER GUARD TRIGGERED
            </h2>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Browser Developer Tools or DOM Inspection detected. All chat data has been masked to prevent unauthorized inspection or extraction.
            </p>
            <div className="mt-5 p-3 bg-red-950/40 border border-red-800/40 rounded-lg text-xs text-red-300 font-mono text-left space-y-1">
              <div>• F12 / DevTools hotkeys: BLOCKED</div>
              <div>• Context menu / Right click: BLOCKED</div>
              <div>• Cloud database export: NONE</div>
              <div>• End-to-end payload: AES-256-GCM</div>
            </div>
            <p className="text-slate-500 text-xs mt-4">
              Close Developer Tools window to resume your session.
            </p>
          </div>
        </div>
      )}

      {/* Tab/Window Blur Privacy Shield */}
      {privacyShieldEnabled && isWindowBlurred && !isDevtoolsOpen && (
        <div
          onClick={onDismissBlur}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-2xl cursor-pointer select-none transition-all"
        >
          <div className="p-6 bg-slate-900/80 border border-cyan-500/30 rounded-2xl flex flex-col items-center max-w-sm text-center shadow-2xl">
            <div className="w-14 h-14 bg-cyan-500/10 rounded-full flex items-center justify-center mb-3 border border-cyan-500/30">
              <EyeOff className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white tracking-wide">
              Privacy Shield Active
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Window focus lost. Content blurred to prevent screen capture and shoulder surfing.
            </p>
            <button className="mt-4 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 rounded-lg text-xs font-mono tracking-wider transition">
              CLICK TO RESUME SESSION
            </button>
          </div>
        </div>
      )}

      {/* Floating Security Notifications Toast */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {securityEvents.slice(-3).map((event) => (
          <div
            key={event.id}
            className={`pointer-events-auto p-3 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all animate-slide-up ${
              event.severity === 'danger'
                ? 'bg-red-950/80 border-red-500/50 text-red-200'
                : event.severity === 'warning'
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                : 'bg-slate-900/90 border-cyan-500/40 text-cyan-200'
            }`}
          >
            {event.severity === 'danger' ? (
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : event.severity === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="text-xs font-bold font-mono tracking-wide">{event.title}</div>
              <div className="text-[11px] opacity-80 mt-0.5 leading-snug">{event.description}</div>
            </div>
            <button
              onClick={() => onDismissEvent(event.id)}
              className="text-xs opacity-60 hover:opacity-100 text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
