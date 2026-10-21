// Native browser Web Crypto API (SubtleCrypto)
// 100% Client-Side. No cloud server ever sees unencrypted plaintext or keys.

const PBKDF2_ITERATIONS = 100000;
const SALT_FIXED = new TextEncoder().encode("CIPHER_VAULT_ZERO_KNOWLEDGE_EPHEMERAL_SALT_2026");

/**
 * Derives a 256-bit AES-GCM CryptoKey from a given password/passphrase
 */
export async function deriveKeyFromPassword(password: string, customSalt?: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const salt = customSalt ? enc.encode(customSalt) : SALT_FIXED;

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts plaintext string using AES-256-GCM
 * Returns formatted string: `${iv_hex}:${ciphertext_hex}`
 */
export async function encryptMessage(text: string, key: CryptoKey): Promise<string> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV recommended for GCM

  const encodedText = enc.encode(text);
  const encryptedBuf = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedText
  );

  const ivHex = bufferToHex(iv.buffer);
  const cipherHex = bufferToHex(encryptedBuf);

  return `${ivHex}:${cipherHex}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string (`${iv_hex}:${ciphertext_hex}`)
 */
export async function decryptMessage(payload: string, key: CryptoKey): Promise<string> {
  const parts = payload.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid cipher format");
  }

  const iv = hexToBuffer(parts[0]);
  const cipherBuf = hexToBuffer(parts[1]);

  const decryptedBuf = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv),
    },
    key,
    cipherBuf
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuf);
}

// Byte array helpers
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Generate a cryptographically secure random alphanumeric ID
 */
export function generateSecureId(prefix = "", length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  let result = prefix ? `${prefix}-` : "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}
