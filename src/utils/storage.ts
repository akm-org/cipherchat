import { UserAccount, Friend, ChatGroup, ChatMessage } from '../types';

const STORAGE_KEYS = {
  ACCOUNT: 'cv_vault_account',
  SESSION_PASS: 'cv_vault_session_key',
  FRIENDS: 'cv_vault_friends',
  GROUPS: 'cv_vault_groups',
  GROUP_PASSWORDS: 'cv_vault_group_passwords',
  MESSAGES: 'cv_vault_messages',
};

// 1. Account & Session Management
export function saveAccountSession(account: UserAccount, pass: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNT, JSON.stringify(account));
    // Store obfuscated local session credential for seamless auto-reload
    localStorage.setItem(STORAGE_KEYS.SESSION_PASS, btoa(encodeURIComponent(pass)));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

export function getStoredAccount(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getStoredSession(): { account: UserAccount; pass: string } | null {
  try {
    const rawAcc = localStorage.getItem(STORAGE_KEYS.ACCOUNT);
    const rawPass = localStorage.getItem(STORAGE_KEYS.SESSION_PASS);
    if (!rawAcc || !rawPass) return null;

    const account = JSON.parse(rawAcc) as UserAccount;
    const pass = decodeURIComponent(atob(rawPass));
    return { account, pass };
  } catch {
    return null;
  }
}

export function clearSessionOnly(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION_PASS);
  } catch (e) {
    console.warn(e);
  }
}

// 2. Friends Persistence
export function saveStoredFriends(friends: Friend[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
  } catch (e) {
    console.warn(e);
  }
}

export function getStoredFriends(): Friend[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// 3. Groups & Passwords Persistence
export function saveStoredGroups(groups: ChatGroup[], passwords: Record<string, string>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    localStorage.setItem(STORAGE_KEYS.GROUP_PASSWORDS, JSON.stringify(passwords));
  } catch (e) {
    console.warn(e);
  }
}

export function getStoredGroups(): { groups: ChatGroup[]; passwords: Record<string, string> } {
  try {
    const rawGroups = localStorage.getItem(STORAGE_KEYS.GROUPS);
    const rawPass = localStorage.getItem(STORAGE_KEYS.GROUP_PASSWORDS);
    const groups = rawGroups ? JSON.parse(rawGroups) : [];
    const passwords = rawPass ? JSON.parse(rawPass) : {};
    return { groups, passwords };
  } catch {
    return { groups: [], passwords: {} };
  }
}

// 4. Messages Persistence (Strictly enforcing 30-minute self-destruct)
export function saveStoredMessages(messages: ChatMessage[]): void {
  try {
    const now = Date.now();
    // Only persist messages that have not yet expired
    const active = messages.filter((m) => m.expiresAt > now);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(active));
  } catch (e) {
    console.warn(e);
  }
}

export function getStoredMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    const now = Date.now();
    // Filter out any messages that expired while page was closed
    const active = parsed.filter((m) => m.expiresAt > now);
    return active;
  } catch {
    return [];
  }
}

// 5. Total Panic Wipe
export function wipeAllVaultStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT);
    localStorage.removeItem(STORAGE_KEYS.SESSION_PASS);
    localStorage.removeItem(STORAGE_KEYS.FRIENDS);
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
    localStorage.removeItem(STORAGE_KEYS.GROUP_PASSWORDS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  } catch (e) {
    console.warn(e);
  }
}
