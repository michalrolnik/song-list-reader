// הוק לטעינת רשימת השירים מהשרת
// אין בו UI — הוא רק מטפל בלוגיקה של הבקשה, טעינה ושגיאות

import { useState, useEffect } from "react";
import { getSongs, type Song } from "../api/songs";

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ברגע שהקומפוננטה נטענת – טוענים את השירים
    setLoading(true);
    getSongs()
      .then((data) => {
        setSongs(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch songs:", err);
        setError(err.message || "Failed to fetch songs");
      })
      .finally(() => setLoading(false));
  }, []);

  // מחזירים את כל הערכים לשימוש בקומפוננטות
  return { songs, loading, error };
}
