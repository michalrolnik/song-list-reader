import "./App.css";
import Header from "./components/Header";
import SongsPage from "./pages/SongsPage";

export default function App() {
  return (
    <main className="page">
      <Header />
      <SongsPage />
    </main>
  );
}
