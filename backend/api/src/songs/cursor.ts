export type SongCursor = { band: string; title: string; id: number };

export function encodeCursor(c: SongCursor) {
  return Buffer.from(JSON.stringify(c)).toString('base64url');
}
export function decodeCursor(s?: string | null): SongCursor | null {
  if (!s) return null;
  try { return JSON.parse(Buffer.from(s, 'base64url').toString('utf8')); }
  catch { return null; }
}
