import type { Song } from "../types/song";

export default function SongsTable({ songs }: { songs: Song[] }) {
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
    </section>
  );
}
