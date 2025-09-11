import { useEffect, useState } from 'react'
import AfterLogin from '../pages/AfterLogin'
import BeforeLogin from '../pages/BeforeLogin'
// import authService from '../api/authService'

const LandingPageContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuthStatus = async () => {
      try {
        // Check for access token in sessionStorage
        const accessToken = sessionStorage.getItem('access_token')
        setIsAuthenticated(!!accessToken)
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
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
