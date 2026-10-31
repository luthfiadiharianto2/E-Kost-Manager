// Simple mock invite service using localStorage for frontend-only demo
// lightweight id generator (not cryptographically secure) for mock purposes
const simpleId = () => Math.floor(Math.random() * 1e9).toString(36) + Date.now().toString(36);

export interface Invite {
  id: string;
  ownerId: number | string;
  email: string;
  name?: string;
  token: string;
  expiresAt: string;
  used: boolean;
}

const STORAGE_KEY = 'mock_invites_v1';

function read(): Invite[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Invite[];
  } catch {
    return [];
  }
}

function write(items: Invite[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const mockInviteService = {
  createInvite(ownerId: number | string, email: string, name?: string, expiresHours = 72) {
    const token = simpleId();
    const invite: Invite = {
      id: simpleId(),
      ownerId,
      email,
      name,
      token,
      expiresAt: new Date(Date.now() + expiresHours * 3600 * 1000).toISOString(),
      used: false,
    };
    const items = read();
    items.push(invite);
    write(items);
    return invite;
  },

  listForOwner(ownerId: number | string) {
    return read().filter(i => i.ownerId === ownerId);
  },

  validateToken(token: string) {
    const items = read();
    const found = items.find(i => i.token === token && !i.used && new Date(i.expiresAt) > new Date());
    return found || null;
  },

  markUsed(token: string) {
    const items = read();
    const idx = items.findIndex(i => i.token === token);
    if (idx >= 0) {
      items[idx].used = true;
      write(items);
      return items[idx];
    }
    return null;
  },
};
