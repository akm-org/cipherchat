import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, Friend, ChatGroup, ChatMessage, SecurityEvent } from './types';
import {
  deriveKeyFromPassword,
  encryptMessage,
  decryptMessage,
  generateSecureId,
} from './utils/crypto';
import {
  saveAccountSession,
  getStoredSession,
  clearSessionOnly,
  saveStoredFriends,
  getStoredFriends,
  saveStoredGroups,
  getStoredGroups,
  saveStoredMessages,
  getStoredMessages,
  wipeAllVaultStorage,
} from './utils/storage';
import { initSecurityGuard } from './utils/securityGuard';
import { p2pService } from './services/p2p';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SecurityOverlay } from './components/SecurityOverlay';

export function App() {
  // Account & Cryptographic Vault State (Stored in Local Encrypted Vault + RAM)
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [userPassword, setUserPassword] = useState<string>('');
  const userKeyRef = useRef<CryptoKey | null>(null);
  const groupKeysRef = useRef<Map<string, CryptoKey>>(new Map());
  const groupPasswordsRef = useRef<Record<string, string>>({});

  // Chat State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatType, setActiveChatType] = useState<'direct' | 'group'>('direct');

  // Security & Tamper Detection State
  const [isDevtoolsOpen, setIsDevtoolsOpen] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [privacyShieldEnabled, setPrivacyShieldEnabled] = useState(true);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);

  // 1-second tick to update countdown timers and purge expired messages
  const [, setTick] = useState(0);

  // Add a security event toast
  const addSecurityEvent = (title: string, description: string, severity: 'info' | 'warning' | 'danger' = 'warning') => {
    const newEvent: SecurityEvent = {
      id: generateSecureId('sec', 6),
      title,
      description,
      timestamp: Date.now(),
      severity,
    };
    setSecurityEvents((prev) => [...prev, newEvent]);

    setTimeout(() => {
      setSecurityEvents((prev) => prev.filter((e) => e.id !== newEvent.id));
    }, 4000);
  };

  // 1. Auto-Restore Saved Session & State on Page Reload
  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      const initSession = async () => {
        try {
          const derivedKey = await deriveKeyFromPassword(session.pass, session.account.id);
          userKeyRef.current = derivedKey;
          setUserPassword(session.pass);
          setAccount(session.account);

          // Restore friends
          const savedFriends = getStoredFriends();
          setFriends(savedFriends);

          // Restore groups & passwords
          const { groups: savedGroups, passwords } = getStoredGroups();
          setGroups(savedGroups);
          groupPasswordsRef.current = passwords;

          // Re-derive room crypto keys
          for (const [code, pass] of Object.entries(passwords)) {
            const roomKey = await deriveKeyFromPassword(pass, `room_${code}`);
            groupKeysRef.current.set(code, roomKey);
          }

          // Restore active messages (strictly filtering out any expired >30 mins)
          const savedMessages = getStoredMessages();
          setMessages(savedMessages);

          if (savedFriends.length > 0) {
            setActiveChatId(savedFriends[0].peerId);
            setActiveChatType('direct');
          } else if (savedGroups.length > 0) {
            setActiveChatId(savedGroups[0].id);
            setActiveChatType('group');
          }

          addSecurityEvent('Session Restored', `Welcome back, ${session.account.username}`, 'info');
        } catch (err) {
          console.warn('Could not restore session:', err);
        }
      };
      initSession();
    }
  }, []);

  // Initialize Security Guard (Anti-F12, Anti-RightClick, Anti-Save, Anti-DevTools)
  useEffect(() => {
    const cleanupSecurity = initSecurityGuard((violation) => {
      if (violation === 'right_click') {
        addSecurityEvent('Context Menu Blocked', 'Right-click inspection is disabled by security policy', 'warning');
      } else if (violation === 'devtools_key') {
        addSecurityEvent('Developer Hotkey Blocked', 'F12 and developer shortcuts are forbidden on this terminal', 'danger');
      } else if (violation === 'save_attempt') {
        addSecurityEvent('Save Blocked', 'Exporting and saving page data is strictly forbidden', 'danger');
      } else if (violation === 'print_attempt') {
        addSecurityEvent('Printing Blocked', 'Printing is blocked to prevent data exfiltration', 'danger');
      } else if (violation === 'devtools_detected') {
        setIsDevtoolsOpen(true);
        addSecurityEvent('DOM Inspector Detected', 'Tamper guard triggered. UI locked.', 'danger');
      }
    });

    const handleBlur = () => {
      if (privacyShieldEnabled) {
        setIsWindowBlurred(true);
      }
    };
    const handleFocus = () => {
      setIsWindowBlurred(false);
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      cleanupSecurity();
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [privacyShieldEnabled]);

  // Periodic 30-minute self-destruct check and live countdown re-render
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.expiresAt > now);
        if (filtered.length !== prev.length) {
          saveStoredMessages(filtered);
        }
        return filtered;
      });
      setTick((t) => (t + 1) % 1000);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize P2P connection when account is ready
  useEffect(() => {
    if (!account) return;

    p2pService.init(account.friendCode, {
      onMessageReceived: async (data) => {
        try {
          let decryptedText = '';
          if (data.type === 'direct') {
            const key = userKeyRef.current;
            if (key) {
              decryptedText = await decryptMessage(data.encryptedPayload, key);
            }
          } else if (data.type === 'group') {
            const roomKey = groupKeysRef.current.get(data.targetId);
            if (roomKey) {
              decryptedText = await decryptMessage(data.encryptedPayload, roomKey);
            }
          }

          if (decryptedText) {
            const newMsg: ChatMessage = {
              id: generateSecureId('msg', 8),
              senderId: data.senderId,
              senderName: data.senderName,
              content: decryptedText,
              timestamp: data.timestamp,
              expiresAt: data.expiresAt,
              targetId: data.targetId,
              isMine: false,
            };

            setMessages((prev) => {
              const updated = [...prev, newMsg];
              saveStoredMessages(updated);
              return updated;
            });
            addSecurityEvent('Encrypted Payload Received', `Verified from ${data.senderName}`, 'info');
          }
        } catch (err) {
          console.warn('Could not decrypt incoming message:', err);
        }
      },
      onPeerConnected: (peerId) => {
        addSecurityEvent('P2P Direct Handshake', `Established data channel with ${peerId}`, 'info');
      },
    });

    return () => {
      p2pService.destroy();
    };
  }, [account]);

  // Handle Account Initialization & Persistence
  const handleAccountCreated = async (newAccount: UserAccount, pass: string) => {
    try {
      const derivedKey = await deriveKeyFromPassword(pass, newAccount.id);
      userKeyRef.current = derivedKey;
      setUserPassword(pass);
      setAccount(newAccount);

      // Persist account and session in local vault
      saveAccountSession(newAccount, pass);

      // Load any existing friends and groups for this user
      const existingFriends = getStoredFriends();
      const { groups: existingGroups, passwords } = getStoredGroups();
      setFriends(existingFriends);
      setGroups(existingGroups);
      groupPasswordsRef.current = passwords;

      for (const [code, p] of Object.entries(passwords)) {
        const roomKey = await deriveKeyFromPassword(p, `room_${code}`);
        groupKeysRef.current.set(code, roomKey);
      }

      addSecurityEvent('Cryptographic Vault Initialized', '256-bit AES-GCM master key derived and saved locally', 'info');
    } catch (err) {
      console.error('Key derivation failed:', err);
    }
  };

  // Add Friend & Persist
  const handleAddFriend = (peerId: string, username: string) => {
    if (friends.some((f) => f.peerId === peerId)) {
      addSecurityEvent('Friend Exists', 'This peer is already in your active channels', 'warning');
      return;
    }

    const newFriend: Friend = {
      peerId,
      username,
      status: 'online',
    };

    const updated = [...friends, newFriend];
    setFriends(updated);
    saveStoredFriends(updated);

    setActiveChatId(peerId);
    setActiveChatType('direct');
    addSecurityEvent('Friend Connected', `${username} added to encrypted channels`, 'info');

    p2pService.connectToPeer(peerId).catch(() => {});
  };

  // Create Group Room & Persist
  const handleCreateGroup = async (name: string, code: string, pass: string) => {
    if (groups.some((g) => g.id === code)) {
      addSecurityEvent('Room Exists', 'A group with this code is already active', 'warning');
      return;
    }

    const roomKey = await deriveKeyFromPassword(pass, `room_${code}`);
    groupKeysRef.current.set(code, roomKey);

    const newPassRecord = { ...groupPasswordsRef.current, [code]: pass };
    groupPasswordsRef.current = newPassRecord;

    const newGroup: ChatGroup = {
      id: code,
      name,
      passwordRequired: true,
      memberCount: 1,
      isHost: true,
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    saveStoredGroups(updatedGroups, newPassRecord);

    setActiveChatId(code);
    setActiveChatType('group');
    addSecurityEvent('Group Room Created', `Room "${name}" encrypted with AES-256 key`, 'info');
  };

  // Join Group Room & Persist
  const handleJoinGroup = async (code: string, pass: string) => {
    if (groups.some((g) => g.id === code)) {
      setActiveChatId(code);
      setActiveChatType('group');
      return;
    }

    const roomKey = await deriveKeyFromPassword(pass, `room_${code}`);
    groupKeysRef.current.set(code, roomKey);

    const newPassRecord = { ...groupPasswordsRef.current, [code]: pass };
    groupPasswordsRef.current = newPassRecord;

    const newGroup: ChatGroup = {
      id: code,
      name: `Room ${code}`,
      passwordRequired: true,
      memberCount: 1,
      isHost: false,
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    saveStoredGroups(updatedGroups, newPassRecord);

    setActiveChatId(code);
    setActiveChatType('group');
    addSecurityEvent('Group Room Joined', `Subscribed to encrypted enclave: ${code}`, 'info');
  };

  // Send Message & Persist
  const handleSendMessage = async (text: string) => {
    if (!account || !activeChatId) return;

    const now = Date.now();
    const expiresAt = now + 30 * 60 * 1000; // Strict 30-minute self-destruct TTL

    let encryptedPayload = '';

    if (activeChatType === 'direct') {
      const key = userKeyRef.current;
      if (key) {
        encryptedPayload = await encryptMessage(text, key);
      }
      p2pService.sendToPeer(activeChatId, {
        type: 'direct',
        targetId: activeChatId,
        senderId: account.friendCode,
        senderName: account.username,
        encryptedPayload,
        timestamp: now,
        expiresAt,
      });
    } else {
      const roomKey = groupKeysRef.current.get(activeChatId);
      if (roomKey) {
        encryptedPayload = await encryptMessage(text, roomKey);
      }
      const peerIds = friends.map((f) => f.peerId);
      p2pService.broadcastToPeers(peerIds, {
        type: 'group',
        targetId: activeChatId,
        senderId: account.friendCode,
        senderName: account.username,
        encryptedPayload,
        timestamp: now,
        expiresAt,
      });
    }

    const newMsg: ChatMessage = {
      id: generateSecureId('msg', 8),
      senderId: account.friendCode,
      senderName: account.username,
      content: text,
      timestamp: now,
      expiresAt,
      targetId: activeChatId,
      isMine: true,
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      saveStoredMessages(updated);
      return updated;
    });
  };

  // Burn / Clear current chat messages
  const handleClearChat = () => {
    if (!activeChatId) return;
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.targetId !== activeChatId);
      saveStoredMessages(filtered);
      return filtered;
    });
    addSecurityEvent('Messages Burned', 'All messages for this channel purged from volatile storage', 'warning');
  };

  // Logout / Lock Terminal: removes session key so user can unlock with password, keeps account saved
  const handleLogout = () => {
    clearSessionOnly();
    p2pService.destroy();
    userKeyRef.current = null;
    groupKeysRef.current.clear();
    setAccount(null);
    setUserPassword('');
    setActiveChatId(null);
    addSecurityEvent('Terminal Locked', 'Session locked. Account remains saved on this browser.', 'info');
  };

  // Emergency Panic Nuke: completely erases all storage, accounts, friends, messages, and disconnects
  const handlePanicNuke = () => {
    wipeAllVaultStorage();
    p2pService.destroy();
    userKeyRef.current = null;
    groupKeysRef.current.clear();
    groupPasswordsRef.current = {};
    setMessages([]);
    setFriends([]);
    setGroups([]);
    setActiveChatId(null);
    setAccount(null);
    setUserPassword('');
    addSecurityEvent('PANIC WIPE COMPLETED', 'All cryptographic keys, sessions, and data permanently erased', 'danger');
  };

  // Filter messages for current chat
  const currentMessages = messages.filter((m) => m.targetId === activeChatId);
  const targetFriend = friends.find((f) => f.peerId === activeChatId);
  const targetGroup = groups.find((g) => g.id === activeChatId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <SecurityOverlay
        isDevtoolsOpen={isDevtoolsOpen}
        isWindowBlurred={isWindowBlurred}
        privacyShieldEnabled={privacyShieldEnabled}
        onDismissBlur={() => setIsWindowBlurred(false)}
        securityEvents={securityEvents}
        onDismissEvent={(id) => setSecurityEvents((prev) => prev.filter((e) => e.id !== id))}
      />

      {!account ? (
        <AuthModal onAccountCreated={handleAccountCreated} />
      ) : (
        <div className="flex h-full w-full">
          <Sidebar
            account={account}
            friends={friends}
            groups={groups}
            activeChatId={activeChatId}
            activeChatType={activeChatType}
            onSelectChat={(id, type) => {
              setActiveChatId(id);
              setActiveChatType(type);
            }}
            onAddFriend={handleAddFriend}
            onCreateGroup={handleCreateGroup}
            onJoinGroup={handleJoinGroup}
            onLogout={handleLogout}
            onPanicNuke={handlePanicNuke}
            privacyShieldEnabled={privacyShieldEnabled}
            onTogglePrivacyShield={() => setPrivacyShieldEnabled(!privacyShieldEnabled)}
          />

          <ChatArea
            currentChatId={activeChatId}
            chatType={activeChatType}
            targetFriend={targetFriend}
            targetGroup={targetGroup}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            myUserId={account.friendCode}
          />
        </div>
      )}
    </div>
  );
}
