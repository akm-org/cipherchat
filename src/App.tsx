import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, Friend, ChatGroup, ChatMessage, SecurityEvent } from './types';
import {
  deriveKeyFromPassword,
  encryptMessage,
  decryptMessage,
  generateSecureId,
} from './utils/crypto';
import { initSecurityGuard } from './utils/securityGuard';
import { p2pService } from './services/p2p';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SecurityOverlay } from './components/SecurityOverlay';

export function App() {
  // Account & Cryptographic Vault State (In-Memory Only)
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [userPassword, setUserPassword] = useState<string>('');
  const userKeyRef = useRef<CryptoKey | null>(null);
  const groupKeysRef = useRef<Map<string, CryptoKey>>(new Map());

  // Chat State (Volatile RAM)
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

    // Auto-dismiss toast after 4 seconds
    setTimeout(() => {
      setSecurityEvents((prev) => prev.filter((e) => e.id !== newEvent.id));
    }, 4000);
  };

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

    // Window focus / blur privacy shield
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
              expiresAt: data.expiresAt, // 30 minutes from creation
              targetId: data.targetId,
              isMine: false,
            };

            setMessages((prev) => [...prev, newMsg]);
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

  // Handle Account Initialization
  const handleAccountCreated = async (newAccount: UserAccount, pass: string) => {
    try {
      const derivedKey = await deriveKeyFromPassword(pass, newAccount.id);
      userKeyRef.current = derivedKey;
      setUserPassword(pass);
      setAccount(newAccount);
      addSecurityEvent('Cryptographic Vault Initialized', '256-bit AES-GCM master key derived via PBKDF2', 'info');
    } catch (err) {
      console.error('Key derivation failed:', err);
    }
  };

  // Add Friend
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

    setFriends((prev) => [...prev, newFriend]);
    setActiveChatId(peerId);
    setActiveChatType('direct');
    addSecurityEvent('Friend Connected', `${username} added to encrypted channels`, 'info');

    // Pre-establish P2P WebRTC data connection
    p2pService.connectToPeer(peerId).catch(() => {
      // Peer may connect later when online
    });
  };

  // Create Group Room
  const handleCreateGroup = async (name: string, code: string, pass: string) => {
    if (groups.some((g) => g.id === code)) {
      addSecurityEvent('Room Exists', 'A group with this code is already active', 'warning');
      return;
    }

    const roomKey = await deriveKeyFromPassword(pass, `room_${code}`);
    groupKeysRef.current.set(code, roomKey);

    const newGroup: ChatGroup = {
      id: code,
      name,
      passwordRequired: true,
      memberCount: 1,
      isHost: true,
    };

    setGroups((prev) => [...prev, newGroup]);
    setActiveChatId(code);
    setActiveChatType('group');
    addSecurityEvent('Group Room Created', `Room "${name}" encrypted with AES-256 key`, 'info');
  };

  // Join Group Room
  const handleJoinGroup = async (code: string, pass: string) => {
    if (groups.some((g) => g.id === code)) {
      setActiveChatId(code);
      setActiveChatType('group');
      return;
    }

    const roomKey = await deriveKeyFromPassword(pass, `room_${code}`);
    groupKeysRef.current.set(code, roomKey);

    const newGroup: ChatGroup = {
      id: code,
      name: `Room ${code}`,
      passwordRequired: true,
      memberCount: 1,
      isHost: false,
    };

    setGroups((prev) => [...prev, newGroup]);
    setActiveChatId(code);
    setActiveChatType('group');
    addSecurityEvent('Group Room Joined', `Subscribed to encrypted enclave: ${code}`, 'info');
  };

  // Send Message
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
      // Broadcast to connected peers
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

    // Append to local state
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

    setMessages((prev) => [...prev, newMsg]);
  };

  // Burn / Clear current chat messages from RAM
  const handleClearChat = () => {
    if (!activeChatId) return;
    setMessages((prev) => prev.filter((m) => m.targetId !== activeChatId));
    addSecurityEvent('Messages Burned', 'All messages for this channel purged from volatile RAM', 'warning');
  };

  // Emergency Panic Nuke: wipes all volatile state, keys, and disconnects
  const handlePanicNuke = () => {
    p2pService.destroy();
    userKeyRef.current = null;
    groupKeysRef.current.clear();
    setMessages([]);
    setFriends([]);
    setGroups([]);
    setActiveChatId(null);
    setAccount(null);
    setUserPassword('');
    addSecurityEvent('PANIC WIPE COMPLETED', 'All cryptographic keys, sessions, and messages erased from RAM', 'danger');
  };

  // Filter messages for current chat
  const currentMessages = messages.filter((m) => m.targetId === activeChatId);
  const targetFriend = friends.find((f) => f.peerId === activeChatId);
  const targetGroup = groups.find((g) => g.id === activeChatId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Security Overlay (DevTools Tamper Lock, Window Blur Shield, Security Alerts) */}
      <SecurityOverlay
        isDevtoolsOpen={isDevtoolsOpen}
        isWindowBlurred={isWindowBlurred}
        privacyShieldEnabled={privacyShieldEnabled}
        onDismissBlur={() => setIsWindowBlurred(false)}
        securityEvents={securityEvents}
        onDismissEvent={(id) => setSecurityEvents((prev) => prev.filter((e) => e.id !== id))}
      />

      {/* Account Generation Modal if not authenticated */}
      {!account ? (
        <AuthModal onAccountCreated={handleAccountCreated} />
      ) : (
        <div className="flex h-full w-full">
          {/* Left Sidebar */}
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
            onPanicNuke={handlePanicNuke}
            privacyShieldEnabled={privacyShieldEnabled}
            onTogglePrivacyShield={() => setPrivacyShieldEnabled(!privacyShieldEnabled)}
          />

          {/* Main Chat Area */}
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
