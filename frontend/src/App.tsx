import { useEffect, useState } from 'react';
import './App.css';

// 1) מגדירים טיפוס לשיר:
type Song = {
  id: number;
  band: string;
  title: string;
};

export default function App() {
  // 2) מגדירים את הסטייט של השירים עם טיפוס מפורש:
  const [songs, setSongs] = useState<Song[]>([]);
  // 3) אם יש לך סטייטים של טעינה/שגיאה/חיפוש – טפלי גם בהם:
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // לא null בלבד
  // דוגמה לחיפוש (אם יש לך אינפוט חיפוש):
  const [query, setQuery] = useState<string>(''); // או: useState<string | null>(null)

  useEffect(() => {
    fetch('/songs')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch /songs');
        return r.json();
      })
      .then((data: Song[]) => setSongs(data))       // 4) מצהירים שזו רשימת Song
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>טוען…</div>;
  if (error) return <div>שגיאה: {error}</div>;

  // (אופציונלי) סינון לפי query
  const visible = query
    ? songs.filter(
        (s) =>
          s.band.toLowerCase().includes(query.toLowerCase()) ||
          s.title.toLowerCase().includes(query.toLowerCase())
      )
    : songs;

  return (
    <div style={{ padding: 16 }}>
      <h1>Song List</h1>

      {/* אופציונלי: שדה חיפוש */}
      {/* <input
        value={query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        placeholder="חפש להקה/שיר..."
        style={{ marginBottom: 12 }}
      /> */}

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Band</th>
            <th>Title</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((s, i) => (
            <tr key={s.id ?? i}>
              <td>{i + 1}</td>
              <td>{s.band}</td>
              <td>{s.title}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
