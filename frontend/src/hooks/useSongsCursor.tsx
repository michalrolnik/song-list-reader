import { useCallback, useState } from 'react';
import { getSongsByCursor, type Song } from '../api/songs';

type State = {
  items: Song[];
  cursor: string | null;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
};

export function useSongsCursor(limit = 20) {
  const [state, setState] = useState<State>({
    items: [],
    cursor: null,
    hasMore: true,
    loading: false,
    error: null,
  });

  const load = useCallback(() => {
    if (state.loading || !state.hasMore) return;
    setState(s => ({ ...s, loading: true, error: null }));

    getSongsByCursor(limit, state.cursor)
      .then(res => {
        setState(s => ({
          items: [...s.items, ...res.items],
          cursor: res.nextCursor,
          hasMore: Boolean(res.nextCursor),
          loading: false,
          error: null,
        }));
      })
      .catch(err => {
        setState(s => ({ ...s, loading: false, error: String(err?.message || err) }));
      });
  }, [limit, state.cursor, state.hasMore, state.loading]);

  const reset = useCallback(() => {
    setState({ items: [], cursor: null, hasMore: true, loading: false, error: null });
  }, []);

  return {
    items: state.items,
    hasMore: state.hasMore,
    loading: state.loading,
    error: state.error,
    load,
    reset,
  };
}
