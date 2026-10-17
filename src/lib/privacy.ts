/** Requests this tab has sent to other servers, from Resource Timing entries. */
export function countThirdParty(entries: { name: string }[], origin: string): number {
  return entries.filter((e) => {
    try {
      return new URL(e.name).origin !== origin;
    } catch {
      return false;
    }
  }).length;
}
