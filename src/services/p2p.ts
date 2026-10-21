import Peer, { DataConnection } from 'peerjs';

export interface P2PCallbacks {
  onMessageReceived: (data: {
    type: 'direct' | 'group';
    targetId: string;
    senderId: string;
    senderName: string;
    encryptedPayload: string;
    timestamp: number;
    expiresAt: number;
  }) => void;
  onPeerConnected?: (peerId: string) => void;
  onPeerDisconnected?: (peerId: string) => void;
  onError?: (err: any) => void;
}

class P2PManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private callbacks: P2PCallbacks | null = null;
  private myPeerId: string = '';

  public init(peerId: string, callbacks: P2PCallbacks): Promise<string> {
    return new Promise((resolve, reject) => {
      this.callbacks = callbacks;
      this.myPeerId = peerId;

      // Clean up previous instance if any
      if (this.peer) {
        this.peer.destroy();
      }

      // Initialize peer with standard secure public STUN servers
      this.peer = new Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('P2P Notice:', err);
        if (this.callbacks?.onError) {
          this.callbacks.onError(err);
        }
        // If error on initial open, still allow user to enter UI
        resolve(peerId);
      });
    });
  }

  public getPeerId(): string {
    return this.myPeerId;
  }

  private setupConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      if (this.callbacks?.onPeerConnected) {
        this.callbacks.onPeerConnected(conn.peer);
      }
    });

    conn.on('data', (data: any) => {
      if (this.callbacks && data && data.type) {
        this.callbacks.onMessageReceived(data);
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      if (this.callbacks?.onPeerDisconnected) {
        this.callbacks.onPeerDisconnected(conn.peer);
      }
    });

    conn.on('error', (err) => {
      console.warn('Connection error with peer:', conn.peer, err);
      this.connections.delete(conn.peer);
    });
  }

  public connectToPeer(targetPeerId: string): Promise<DataConnection> {
    return new Promise((resolve, reject) => {
      if (!this.peer) {
        reject(new Error('P2P Peer not initialized'));
        return;
      }

      const existing = this.connections.get(targetPeerId);
      if (existing && existing.open) {
        resolve(existing);
        return;
      }

      try {
        const conn = this.peer.connect(targetPeerId, {
          reliable: true,
        });

        conn.on('open', () => {
          this.connections.set(targetPeerId, conn);
          this.setupConnection(conn);
          resolve(conn);
        });

        conn.on('error', (err) => {
          console.warn('Could not connect to peer:', targetPeerId, err);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public sendToPeer(targetPeerId: string, payload: any): boolean {
    const conn = this.connections.get(targetPeerId);
    if (conn && conn.open) {
      conn.send(payload);
      return true;
    }
    // Try to connect and send
    this.connectToPeer(targetPeerId)
      .then((newConn) => {
        newConn.send(payload);
      })
      .catch((err) => {
        console.warn('Failed to send payload to peer:', targetPeerId, err);
      });
    return false;
  }

  public broadcastToPeers(peerIds: string[], payload: any) {
    peerIds.forEach((id) => {
      if (id !== this.myPeerId) {
        this.sendToPeer(id, payload);
      }
    });
  }

  public destroy() {
    this.connections.forEach((c) => c.close());
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

export const p2pService = new P2PManager();
