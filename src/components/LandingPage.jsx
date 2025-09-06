import { useEffect, useState } from 'react'
import AfterLogin from '../pages/AfterLogin'
import BeforeLogin from '../pages/BeforeLogin'
// import authService from '../api/authService'

const LandingPageContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated via secure backend
    const checkAuthStatus = async () => {
      try {
        // const user = await authService.getCurrentUser()
        // setIsAuthenticated(!!user)
        setIsAuthenticated(false) // Temporary for testing
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
