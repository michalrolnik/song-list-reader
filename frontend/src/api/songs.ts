import { apiGet } from './client';

export type Song = { id: number; band: string; title: string };

export function getSongs(): Promise<Song[]> {
  return apiGet<Song[]>('/songs');
}

/** טיפוס לתשובת הקורסור מהשרת */
export type CursorResponse = {
  items: Song[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
};
//
 // קריאה עם Cursor Pagination:
 // GET /songs/cursor?limit=&cursor=
 // - limit: כמה רשומות להביא בכל טעינה (ברירת מחדל 20)
// - cursor: המחרוזת שקיבלת בסבב הקודם מ-nextCursor (או null בהתחלה)

export function getSongsByCursor(
  limit = 20,
  cursor?: string | null
): Promise<CursorResponse> {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (cursor) params.set('cursor', cursor);

  return apiGet<CursorResponse>(`/songs/cursor?${params.toString()}`);
}

