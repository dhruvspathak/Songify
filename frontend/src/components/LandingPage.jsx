import { useEffect, useState } from 'react'
import AfterLogin from '../pages/AfterLogin'
import BeforeLogin from '../pages/BeforeLogin'
import { checkAuthStatus } from '../utils/auth'

const LandingPageContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const handleAuthCheck = async () => {
      try {
        const isAuth = await checkAuthStatus();
        setIsAuthenticated(isAuth);
        
        // If login was successful, clean up the URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('login') === 'success') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    handleAuthCheck()
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div>
      {isAuthenticated ? <AfterLogin /> : <BeforeLogin />}
    </div>
  )
}

const LandingPage = () => {
  return <LandingPageContent />
}

export default LandingPage
