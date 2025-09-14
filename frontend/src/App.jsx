import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LandingPage, Callback, Layout } from './components';
import { AlbumPage, PlaylistDetails, AlbumDetails } from './pages';
import { useAuth } from './hooks';
import './styles/globals.css';

const App = () => {
  const { login: handleLogin, logout: handleLogout } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          element={
            <Layout
              handleLogin={handleLogin}
              handleLogout={handleLogout}
            />
          }
        >
          <Route path="/" element={<LandingPage />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/album" element={<AlbumPage />} />
          <Route path="/playlist" element={<PlaylistDetails />} />
          <Route path="/albumItems" element={<AlbumDetails />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
