import type { Song } from "../types/song";

import { useEffect } from 'react';
import { useSongsCursor } from '../hooks/useSongsCursor';

  

export default function SongsTable({ songs }: { songs: Song[] }) {
    const { items, load, hasMore, loading, error } = useSongsCursor(20);

   useEffect(() => { load(); }, [load]); // טען עמוד ראשון
  return (
    <section className="card">
      <div className="table-wrap">
        <table className="songs">
          <thead>
            <tr>
              <th className="col-id">#</th>
              <th>Band</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((s, i) => (
              <tr key={s.id ?? i}>
                <td className="col-id">{i + 1}</td>
                <td className="cap">{s.band}</td>
                <td className="cap">{s.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        <button onClick={load} disabled={!hasMore || loading} style={{ marginTop: 12 }}>
        {loading ? 'Loading…' : hasMore ? 'Load more' : 'No more'}
      </button>
    </section>
  );
}
