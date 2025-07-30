import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Callback from './components/Callback'
import AlbumPage from './pages/AlbumPage'
import Layout from './components/Layout'
import PlaylistOnClick from './pages/PlaylistOnclick'
import AlbumOnClick from './pages/AlbumOnClick'

const App = () => {
  const handleLogin = () => {
    // Define the handleLogin function logic here
  };

  const trackId = null; // Initialize trackId with a default value

  return (
    <Router>
      <Routes>
        <Route element={<Layout handleLogin={handleLogin} trackId={trackId} />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/callback" element={<Callback handleLogin={handleLogin} />} />
          <Route path='/album' element={<AlbumPage />} />
          <Route path= '/playlist' element={<PlaylistOnClick />} />
          <Route path='/albumItems' element={<AlbumOnClick />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
