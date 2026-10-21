export interface GroupInviteData {
  join: string; // Room Code
  name: string; // Room Name
  pass: string; // Room Password / Key
}

/**
 * Creates a one-click shareable group invite link
 */
export function createGroupInviteUrl(groupId: string, name: string, pass: string): string {
  const defaultDomain = 'https://cipherchat-six.vercel.app';
  const origin =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.origin
      : defaultDomain;

  const params = new URLSearchParams();
  params.set('join', groupId);
  params.set('name', name);
  params.set('pass', pass);

  return `${origin}/?${params.toString()}`;
}

/**
 * Parses URL query parameters for an incoming group invite
 */
export function parseGroupInviteUrl(): GroupInviteData | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const join = urlParams.get('join');
    const name = urlParams.get('name') || join;
    const pass = urlParams.get('pass');

    if (join && pass) {
      return {
        join: join.trim(),
        name: name ? name.trim() : join.trim(),
        pass: pass.trim(),
      };
    }
  } catch (err) {
    console.warn('Failed to parse group invite URL:', err);
  }

  return null;
}

/**
 * Cleans the query parameters from the browser address bar without reloading
 */
export function clearInviteUrlParams(): void {
  if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}
