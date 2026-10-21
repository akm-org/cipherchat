export interface UserAccount {
  id: string;             // Unique internal ID
  username: string;       // Chosen alias
  friendCode: string;     // Unique P2P Peer identifier
  createdAt: number;
}

export interface Friend {
  peerId: string;
  username: string;
  status: 'online' | 'offline' | 'connecting';
  unreadCount?: number;
}

export interface ChatGroup {
  id: string;             // Room code
  name: string;           // Group name
  passwordRequired: boolean;
  memberCount: number;
  isHost?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;        // Decrypted plaintext in memory only
  timestamp: number;      // Creation timestamp
  expiresAt: number;      // Timestamp when message self-destructs (timestamp + 30 mins)
  targetId: string;       // Friend peerId or Room code
  isMine: boolean;
}

export interface SecurityEvent {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'danger';
}
