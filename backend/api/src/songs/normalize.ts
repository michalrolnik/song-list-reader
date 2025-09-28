// lowercase + trim, וידוא מחרוזת
export function normalizeSongFields(band: string, title: string) {
  const norm = (s: string) => (s ?? '').toString().trim().toLowerCase();
  return { band: norm(band), title: norm(title) };
}
