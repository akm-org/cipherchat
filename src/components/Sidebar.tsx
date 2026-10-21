import React, { useState } from 'react';
import {
  User,
  Users,
  UserPlus,
  PlusCircle,
  Copy,
  Check,
  Shield,
  Flame,
  Radio,
  Lock,
  MessageSquare,
  Hash,
  Eye,
  EyeOff,
  LogOut,
  ChevronRight,
  Share2
} from 'lucide-react';
import { UserAccount, Friend, ChatGroup } from '../types';

interface SidebarProps {
  account: UserAccount;
  friends: Friend[];
  groups: ChatGroup[];
  activeChatId: string | null;
  activeChatType: 'direct' | 'group';
  onSelectChat: (id: string, type: 'direct' | 'group') => void;
  onAddFriend: (peerId: string, username: string) => void;
  onCreateGroup: (name: string, code: string, pass: string) => void;
  onJoinGroup: (code: string, pass: string) => void;
  onShareGroup: (group: ChatGroup) => void;
  onLogout: () => void;
  onPanicNuke: () => void;
  privacyShieldEnabled: boolean;
  onTogglePrivacyShield: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  account,
  friends,
  groups,
  activeChatId,
  activeChatType,
  onSelectChat,
  onAddFriend,
  onCreateGroup,
  onJoinGroup,
  onShareGroup,
  onLogout,
  onPanicNuke,
  privacyShieldEnabled,
  onTogglePrivacyShield,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('friends');
  const [copiedCode, setCopiedCode] = useState(false);

  // Modals state
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);

  // Form states
  const [friendPeerIdInput, setFriendPeerIdInput] = useState('');
  const [friendNameInput, setFriendNameInput] = useState('');

  const [groupNameInput, setGroupNameInput] = useState('');
  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [groupPassInput, setGroupPassInput] = useState('');

  const [joinGroupCodeInput, setJoinGroupCodeInput] = useState('');
  const [joinGroupPassInput, setJoinGroupPassInput] = useState('');

  const copyFriendCode = () => {
    navigator.clipboard.writeText(account.friendCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendPeerIdInput.trim()) return;
    onAddFriend(
      friendPeerIdInput.trim(),
      friendNameInput.trim() || friendPeerIdInput.trim().slice(0, 8)
    );
    setFriendPeerIdInput('');
    setFriendNameInput('');
    setShowAddFriendModal(false);
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupNameInput.trim() || !groupCodeInput.trim() || groupPassInput.length < 4) return;
    onCreateGroup(groupNameInput.trim(), groupCodeInput.trim(), groupPassInput);
    setGroupNameInput('');
    setGroupCodeInput('');
    setGroupPassInput('');
    setShowCreateGroupModal(false);
  };

  const handleJoinGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinGroupCodeInput.trim() || joinGroupPassInput.length < 4) return;
    onJoinGroup(joinGroupCodeInput.trim(), joinGroupPassInput);
    setJoinGroupCodeInput('');
    setJoinGroupPassInput('');
    setShowJoinGroupModal(false);
  };

  return (
    <div className="w-80 h-full flex flex-col bg-slate-900/90 border-r border-slate-800 backdrop-blur-md select-none">
      {/* App Header & Identity */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white font-mono flex items-center gap-1.5">
                CIPHER<span className="text-cyan-400">VAULT</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded">
                  P2P
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Privacy Shield quick toggle */}
            <button
              onClick={onTogglePrivacyShield}
              title={privacyShieldEnabled ? "Disable Screen Blur Shield" : "Enable Screen Blur Shield"}
              className={`p-1.5 rounded-lg border transition ${
                privacyShieldEnabled
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {privacyShieldEnabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-xs font-bold text-slate-950 shrink-0">
                {account.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {account.username}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Peer
                </div>
              </div>
            </div>

            {/* Friend Code Copy */}
            <button
              onClick={copyFriendCode}
              title="Copy your Friend Code / Peer ID to share with friends"
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-[10px] font-mono transition"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-cyan-400" />
                  <span>Code</span>
                </>
              )}
            </button>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 font-mono truncate bg-slate-900/90 px-2 py-1 rounded border border-slate-800/80">
            ID: {account.friendCode}
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Friends vs Groups */}
      <div className="p-3 border-b border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'friends'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'groups'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Groups ({groups.length})
        </button>
      </div>

      {/* Main List Section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {activeTab === 'friends' ? (
          <>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Direct Channels
              </span>
              <button
                onClick={() => setShowAddFriendModal(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Friend</span>
              </button>
            </div>

            {friends.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-950/30 border border-dashed border-slate-800 rounded-xl">
                <UserPlus className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No friends added yet</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Share your Friend Code or add someone to start an encrypted direct chat.
                </p>
                <button
                  onClick={() => setShowAddFriendModal(true)}
                  className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 rounded-lg border border-slate-700 transition"
                >
                  + Add Friend Now
                </button>
              </div>
            ) : (
              friends.map((f) => {
                const isSelected = activeChatType === 'direct' && activeChatId === f.peerId;
                return (
                  <button
                    key={f.peerId}
                    onClick={() => onSelectChat(f.peerId, 'direct')}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition ${
                      isSelected
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-white'
                        : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-cyan-400">
                          {f.username.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium truncate">{f.username}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {f.peerId}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                  </button>
                );
              })
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Group Encrypted Rooms
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowJoinGroupModal(true)}
                  className="text-[11px] text-slate-400 hover:text-white transition"
                >
                  Join
                </button>
                <span className="text-slate-700">•</span>
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create</span>
                </button>
              </div>
            </div>

            {groups.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-950/30 border border-dashed border-slate-800 rounded-xl">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No active groups</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Create a password-protected room or join with a room code.
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setShowCreateGroupModal(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 rounded-lg border border-slate-700 transition"
                  >
                    Create Room
                  </button>
                  <button
                    onClick={() => setShowJoinGroupModal(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg border border-slate-700 transition"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            ) : (
              groups.map((g) => {
                const isSelected = activeChatType === 'group' && activeChatId === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => onSelectChat(g.id, 'group')}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-white'
                        : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate flex-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
                        <Hash className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium truncate flex items-center gap-1.5">
                          <span>{g.name}</span>
                          <Lock className="w-3 h-3 text-cyan-400" />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          Code: {g.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareGroup(g);
                        }}
                        title="Get Group Invite Link"
                        className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* Footer Controls & Emergency Wipe */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
        {/* Security Summary */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
          <span className="flex items-center gap-1 text-cyan-400">
            <Lock className="w-3 h-3" /> AES-256 GCM
          </span>
          <span className="text-amber-400 flex items-center gap-1">
            <Flame className="w-3 h-3" /> 30m Auto-Wipe
          </span>
        </div>

        {/* Buttons: Lock/Logout & Panic Nuke */}
        <div className="flex gap-2">
          <button
            onClick={onLogout}
            title="Lock terminal and log out. Account remains saved on this browser."
            className="flex-1 py-2 px-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-[11px] font-mono font-medium flex items-center justify-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Lock / Exit</span>
          </button>

          <button
            onClick={onPanicNuke}
            title="Instantly purges all messages, destroys cryptographic session keys, wipes local vault storage, and disconnects"
            className="flex-1 py-2 px-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 hover:border-red-500/70 text-red-300 rounded-xl text-[11px] font-mono font-bold tracking-tight flex items-center justify-center gap-1.5 transition duration-200"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>PANIC NUKE</span>
          </button>
        </div>
      </div>

      {/* Modal: Add Friend */}
      {showAddFriendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5 mb-3">
              <UserPlus className="w-4 h-4 text-cyan-400" />
              ADD FRIEND BY PEER CODE
            </h3>
            <form onSubmit={handleAddFriendSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Friend's ID / Code</label>
                <input
                  type="text"
                  value={friendPeerIdInput}
                  onChange={(e) => setFriendPeerIdInput(e.target.value)}
                  placeholder="e.g. cv_alex_8x9a2k"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Display Alias (Optional)</label>
                <input
                  type="text"
                  value={friendNameInput}
                  onChange={(e) => setFriendNameInput(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFriendModal(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs font-mono"
                >
                  Connect Friend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Group */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5 mb-3">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              CREATE ENCRYPTED GROUP ROOM
            </h3>
            <form onSubmit={handleCreateGroupSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Group Name</label>
                <input
                  type="text"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  placeholder="e.g. Project Phoenix"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Room Code / ID</label>
                <input
                  type="text"
                  value={groupCodeInput}
                  onChange={(e) => setGroupCodeInput(e.target.value)}
                  placeholder="e.g. room-phoenix-77"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Room Password (min 4 chars)</label>
                <input
                  type="password"
                  value={groupPassInput}
                  onChange={(e) => setGroupPassInput(e.target.value)}
                  placeholder="••••••••"
                  minLength={4}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-500">
                  Used as AES-256 encryption key. Only members with this password can decrypt messages.
                </span>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs font-mono"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Join Group */}
      {showJoinGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5 mb-3">
              <Hash className="w-4 h-4 text-cyan-400" />
              JOIN ENCRYPTED GROUP ROOM
            </h3>
            <form onSubmit={handleJoinGroupSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Room Code / ID</label>
                <input
                  type="text"
                  value={joinGroupCodeInput}
                  onChange={(e) => setJoinGroupCodeInput(e.target.value)}
                  placeholder="e.g. room-phoenix-77"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Room Password (min 4 chars)</label>
                <input
                  type="password"
                  value={joinGroupPassInput}
                  onChange={(e) => setJoinGroupPassInput(e.target.value)}
                  placeholder="••••••••"
                  minLength={4}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinGroupModal(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs font-mono"
                >
                  Join Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
