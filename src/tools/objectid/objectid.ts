/**
 * ObjectId generation logic — extracted so it can be unit-tested.
 */

/** 5-byte machine+process identifier (random per session) */
export const MACHINE_ID = (() => {
  const b = new Uint8Array(5);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
})();

/** Random 3-byte counter seed */
export let counter = (() => {
  const b = new Uint8Array(3);
  crypto.getRandomValues(b);
  return ((b[0]! << 16) | (b[1]! << 8) | b[2]!) & 0xffffff;
})();

/** Generate a single MongoDB-compatible ObjectId string */
export function objectId(): string {
  const ts = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, '0');
  counter = (counter + 1) & 0xffffff;
  return ts + MACHINE_ID + counter.toString(16).padStart(6, '0');
}
