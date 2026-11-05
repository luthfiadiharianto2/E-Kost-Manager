import { describe, expect, it } from 'vitest';
import { resolveAcceptInviteView } from './acceptInviteView';

describe('resolveAcceptInviteView', () => {
  it('shows loading while the token is being validated', () => {
    expect(resolveAcceptInviteView(true, null)).toBe('loading');
    expect(resolveAcceptInviteView(true, { invitation: { email: 'a@b.c' } })).toBe('loading');
  });

  it('shows invalid only when load finished without an invitation', () => {
    expect(resolveAcceptInviteView(false, null)).toBe('invalid');
  });

  it('keeps the password form when invitation is valid even if a form error string exists elsewhere', () => {
    // Regression: old gate was `!invitation || error`, so a short-password /
    // mismatch / accept API error flipped the UI to "Undangan Tidak Valid".
    const invitation = {
      invitation: { email: 'tenant@example.com' },
      owner_name: 'Pemilik',
      kost_name: 'Kost A',
    };
    expect(resolveAcceptInviteView(false, invitation)).toBe('form');
  });
});
