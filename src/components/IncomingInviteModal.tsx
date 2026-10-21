import React from 'react';
import { Users, Lock, CheckCircle2, X } from 'lucide-react';
import { GroupInviteData } from '../utils/invite';

interface IncomingInviteModalProps {
  invite: GroupInviteData;
  onAccept: () => void;
  onDismiss: () => void;
}

export const IncomingInviteModal: React.FC<IncomingInviteModalProps> = ({
  invite,
  onAccept,
  onDismiss,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="max-w-md w-full bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl relative glow-border text-center">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto mb-4">
          <Users className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-white font-mono">
          GROUP INVITATION
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          You have been invited to enter an encrypted group room.
        </p>

        <div className="my-5 p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-left font-mono">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Group Name:</span>
            <span className="text-cyan-300 font-bold text-sm">{invite.name}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Room Code:</span>
            <span className="text-slate-200">{invite.join}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Security:</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> End-to-End Encrypted
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs font-mono tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>ACCEPT & ENTER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
