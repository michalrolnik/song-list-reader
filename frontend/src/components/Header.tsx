export default function Header() {
  return (
   <header className='page-header'>
        <h1>Song List <span>🎵</span></h1>

        {/* אופציונלי: שדה חיפוש */}
        {/* <input
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder="חפש להקה/שיר..."
          style={{ marginBottom: 12 }}
      /> */}
      </header>
  );
}
