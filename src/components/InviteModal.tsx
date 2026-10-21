import React, { useState } from 'react';
import { Share2, Copy, Check, Users, Shield, Lock, X } from 'lucide-react';
import { createGroupInviteUrl } from '../utils/invite';

interface InviteModalProps {
  groupId: string;
  groupName: string;
  groupPassword?: string;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  groupId,
  groupName,
  groupPassword = '',
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const inviteUrl = createGroupInviteUrl(groupId, groupName, groupPassword);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="max-w-md w-full bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative glow-border">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>INVITE TO GROUP</span>
              <span className="px-1.5 py-0.2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] rounded">
                1-CLICK LINK
              </span>
            </h3>
            <p className="text-xs text-slate-400">Share this private link with anyone to invite them</p>
          </div>
        </div>

        {/* Group Details */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl mb-4 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Group Name:</span>
            <span className="text-white font-bold">{groupName}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Room Code:</span>
            <span className="text-cyan-400">{groupId}</span>
          </div>
          {groupPassword && (
            <div className="flex justify-between text-slate-400">
              <span>Decryption Key:</span>
              <span className="text-emerald-400">Embedded in link</span>
            </div>
          )}
        </div>

        {/* Link Display Box */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 block mb-1.5">Direct Invite Link</label>
          <div className="p-2.5 bg-slate-950 border border-slate-700 rounded-xl flex items-center justify-between gap-2">
            <span className="text-xs text-slate-300 font-mono truncate select-all">
              {inviteUrl}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCopy}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs font-mono tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition duration-150"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-slate-950" />
              <span>INVITE LINK COPIED!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>COPY GROUP INVITE LINK</span>
            </>
          )}
        </button>

        {/* Security Info */}
        <div className="mt-4 p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-start gap-2 text-[11px] text-slate-500 leading-snug">
          <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            When opened, this link automatically connects the user to this room and configures the AES-256 room encryption key.
          </span>
        </div>
      </div>
    </div>
  );
};
