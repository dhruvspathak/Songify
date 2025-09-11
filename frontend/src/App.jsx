import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Callback from "./components/Callback";
import AlbumPage from "./pages/AlbumPage";
import Layout from "./components/Layout";
import PlaylistOnClick from "./pages/PlaylistOnclick";
import AlbumOnClick from "./pages/AlbumOnClick";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/me", {
        credentials: "include",
      });
      setIsLoggedIn(response.ok);
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoggedIn(false);
    }
  };

  const handleLogin = () => {
    window.location.href = "http://localhost:3000/auth/login";
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setIsLoggedIn(false);
      } else {
        console.error("Logout failed: Server returned an error");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          element={
            <Layout
              handleLogin={handleLogin}
              handleLogout={handleLogout}
              isLoggedIn={isLoggedIn}
            />
          }
        >
          <Route path="/" element={<LandingPage />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/album" element={<AlbumPage />} />
          <Route path="/playlist" element={<PlaylistOnClick />} />
          <Route path="/albumItems" element={<AlbumOnClick />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
