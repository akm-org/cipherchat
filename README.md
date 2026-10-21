# 🛡️ CipherVault - Zero-Knowledge Ephemeral P2P Chat

A hardened, zero-knowledge, peer-to-peer ephemeral chat application designed for maximum privacy, ready to deploy to **Vercel** and push to **GitHub**.

---

## 🔒 Security & Privacy Features

- **Zero Cloud Database**: Messages travel directly peer-to-peer (WebRTC DataChannel) between browsers. No database or server ever touches, parses, or logs your messages.
- **Account Generation**: Any alias/username with a secure password (**minimum 4 characters**).
- **PBKDF2 & AES-256-GCM Cryptography**: Keys are derived in the browser's RAM via 100,000 iterations of SHA-256 PBKDF2; payloads are encrypted with native Web Crypto API (SubtleCrypto).
- **30-Minute Self-Destruct**: Every message has a strict 30-minute time-to-live (TTL). Live countdown timers tick on each message and permanently purge them from volatile RAM upon expiration.
- **Direct 1-on-1 & Encrypted Groups**:
  - Add friends via unique Friend Codes (Peer IDs).
  - Create and join password-protected group chat rooms where messages are encrypted using the room's key.
- **Tamper & Anti-Exfiltration Defenses**:
  - **F12 & DevTools Shortcuts Blocked**: Prevents `F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+Shift+C`, `Ctrl+U`, `Ctrl+S`, `Ctrl+P`.
  - **Right-Click Disabled**: Custom security interceptor cancels the browser context menu.
  - **DevTools Open Detection**: Triggers a full Tamper Guard screen blackout if DOM inspection is detected.
  - **Privacy Shield**: Auto-blurs the entire chat interface when switching windows or tabs.
  - **Anti-Export & Print Protection**: Browser print commands are intercepted and CSS suppresses rendering under print media.
  - **Panic Nuke Button**: One-click purge that clears all in-memory keys, wipes message arrays, destroys P2P channels, and disconnects immediately.

---

## 🚀 How to Upload to GitHub

1. Create a new empty repository on [GitHub](https://github.com/new) (e.g. `cipher-vault-chat`).
2. Run the following commands in the project folder:

```bash
cd /path/to/cipherchat

# Add your GitHub remote URL (replace <your-username> and <your-repo>)
git remote add origin https://github.com/<your-username>/<your-repo>.git

# Push your code to GitHub
git push -u origin main
```

---

## ⚡ How to Host on Vercel

### Method 1: 1-Click via GitHub (Recommended)
1. Log into [vercel.com](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository (`cipher-vault-chat`).
4. Vercel automatically detects **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Your site will be live on a secure HTTPS URL in seconds!

### Method 2: Via Vercel CLI
```bash
# In the project directory:
npx vercel
```
Follow the prompts to link and deploy to your Vercel account.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser. Open a second incognito or private window to test 1-on-1 chatting or group rooms between peers in real time!

---

## 📁 Project Structure

```
cipherchat/
├── index.html                 # Root document with anti-print & security styles
├── package.json               # Dependencies (React, Vite, PeerJS, Tailwind, Lucide)
├── vercel.json                # Vercel deployment rewrite rules & hardened HTTP headers
├── tailwind.config.js         # Cyberpunk/stealth dark theme
├── vite.config.ts             # Vite configuration
└── src/
    ├── App.tsx                # Master state, volatile RAM messages, 30m auto-purge loop
    ├── main.tsx               # Application bootstrap
    ├── index.css              # Global styling & privacy blur classes
    ├── types/                 # TypeScript interfaces (User, Friend, Group, Message)
    ├── services/
    │   └── p2p.ts             # Direct WebRTC DataChannel connection manager (PeerJS)
    ├── utils/
    │   ├── crypto.ts          # WebCrypto SubtleCrypto AES-256-GCM & PBKDF2 derivation
    │   └── securityGuard.ts   # Anti-F12, Anti-RightClick, DevTools & Tamper detection
    └── components/
        ├── AuthModal.tsx      # Account generation (alias + 4+ char password)
        ├── Sidebar.tsx        # Friend list, group rooms, friend code sharing, Panic button
        ├── ChatArea.tsx       # Message enclave, live 30m timers, auto-scroll, send input
        └── SecurityOverlay.tsx# Tamper Guard alert modal, window blur privacy shield, toasts
```
