// src/pages/SongsPage.tsx
import { useState } from "react";
import { useSongs } from "../hooks/useSongs";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import SongsTable from "../components/SongsTable";
import type { Song } from "../types/song";

export default function SongsPage() {
  const { songs, loading, error } = useSongs();
  const [query, setQuery] = useState<string>("");

  if (loading) return <Loader />;

  // error יכול להיות string | null – עכשיו ErrorState יודע לקבל גם null
  if (error) return <ErrorState message={error} />;

  const q = query.trim().toLowerCase();
  const visible: Song[] =
    q.length > 0
      ? songs.filter(
          (s) =>
            s.band.toLowerCase().includes(q) ||
            s.title.toLowerCase().includes(q)
        )
      : songs;

  return (
    <section>
      {/* אופציונלי: שדה חיפוש */}
      {/* <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="חפש להקה/שיר..."
        style={{ marginBottom: 12 }}
      /> */}
      <SongsTable songs={visible} />
    </section>
  );
}
