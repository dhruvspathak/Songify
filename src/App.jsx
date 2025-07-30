import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Callback from "./components/Callback";
import AlbumPage from "./pages/AlbumPage";
import Layout from "./components/Layout";
import PlaylistOnClick from "./pages/PlaylistOnclick";
import AlbumOnClick from "./pages/AlbumOnClick";

const App = () => {
  const handleLogin = () => {
    // Define the handleLogin function logic here
    const access_token = sessionStorage.getItem("access_token");

    const generateRandomString = (length) => {
      let text = "";
      const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    const scopeList =
      "streaming user-read-playback-state user-modify-playback-state user-read-currently-playing";

    const handleLogin = () => {
      const state = generateRandomString(16);
      const queryParams = queryString.stringify({
        response_type: "code",
        client_id: import.meta.env.VITE_CLIENT_ID,
        scope: scopeList,
        redirect_uri: "http://localhost:5173/callback",
        state: state,
        show_dialog: true,
      });

      window.location.href = `https://accounts.spotify.com/authorize?${queryParams}`;
    };
  };

  const trackId = null; // Initialize trackId with a default value

  return (
    <Router>
      <Routes>
        <Route element={<Layout handleLogin={handleLogin} trackId={trackId} />}>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/callback"
            element={<Callback handleLogin={handleLogin} />}
          />
          <Route path="/album" element={<AlbumPage />} />
          <Route path="/playlist" element={<PlaylistOnClick />} />
          <Route path="/albumItems" element={<AlbumOnClick />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
