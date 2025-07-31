import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Callback from "./components/Callback";
import AlbumPage from "./pages/AlbumPage";
import Layout from "./components/Layout";
import PlaylistOnClick from "./pages/PlaylistOnclick";
import AlbumOnClick from "./pages/AlbumOnClick";
import axios from "axios";
import qs from "qs";

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

const SPOTIFY_AUTH_BASE = "https://accounts.spotify.com/api";

const App = () => {
  async function handleLogin() {
    try {
      const tokenUrl = `${SPOTIFY_AUTH_BASE}/token`;

      const tokenResponse = await axios.post(
        tokenUrl,
        qs.stringify({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;
      console.log("Access Token Granted");
    } catch (error) {
      console.error(
        "Error retrieving access token:",
        error.response?.data || error.message
      );
    }
  }

  useEffect(() => {
    handleLogin();
  }, []);

  return (
    <Router>
      <Routes>
        <Route element={<Layout handleLogin={handleLogin} />}>
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
