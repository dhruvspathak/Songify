import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import LandingPage from './components/LandingPage'
import Callback from './components/Callback'
import AlbumPage from './pages/AlbumPage'
import Layout from './components/Layout'
import PlaylistOnClick from './pages/PlaylistOnclick'
import AlbumOnClick from './pages/AlbumOnClick'

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout handleLogin={handleLogin} />}>
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
