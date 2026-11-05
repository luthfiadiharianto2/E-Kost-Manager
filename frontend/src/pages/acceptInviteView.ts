/** Which Accept Invite screen to render after the token check finishes. */
export type AcceptInviteView = 'loading' | 'invalid' | 'form';

/**
 * Form/submit errors must not replace a validated invitation with the
 * "Undangan Tidak Valid" screen — only a missing invitation after load does.
 */
export function resolveAcceptInviteView(loading: boolean, invitation: unknown): AcceptInviteView {
  if (loading) return 'loading';
  if (!invitation) return 'invalid';
  return 'form';
}
