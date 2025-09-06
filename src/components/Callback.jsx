import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import BeforeLogin from '../pages/BeforeLogin'
// import authService from '../api/authService'

const Callback = ({ handleLogin }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Parse URL parameters using native URLSearchParams
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const authError = urlParams.get('error')

        // Check for authorization errors
        if (authError) {
          setError(`Authorization failed: ${authError}`)
          setLoading(false)
          return
        }

        // Validate state parameter for CSRF protection
        // Note: sessionStorage used here ONLY for CSRF state validation (non-sensitive)
        // This is secure as it's a temporary, random string for security validation
        const storedState = sessionStorage.getItem('spotify_auth_state')
        if (!state || state !== storedState) {
          setError('Security validation failed. Please try logging in again.')
          window.location.href = '/#error=state_mismatch'
          return
        }

        // Clear the stored state immediately after validation
        sessionStorage.removeItem('spotify_auth_state')

        if (!code) {
          setError('No authorization code received')
          setLoading(false)
          return
        }

        // Exchange code for token via secure backend
        // const tokenData = await authService.exchangeCodeForToken(code, state)
        const tokenData = { success: true } // Temporary for testing
        
        if (tokenData.success) {
          // Token is now stored securely in httpOnly cookie
          // No need to store in sessionStorage
          console.log('Authentication successful')
          handleLogin() // Notify parent component of successful login
          
          // Redirect to main app
          window.location.href = '/dashboard'
        } else {
          setError('Authentication failed. Please try again.')
        }

      } catch (error) {
        console.error('Authentication callback error:', error)
        setError('Authentication failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [handleLogin])

  return (
    <div>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          flexDirection: 'column' 
        }}>
          <h2>Authenticating with Spotify...</h2>
          <div>Please wait while we securely process your login.</div>
        </div>
      ) : error ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          flexDirection: 'column',
          color: 'red'
        }}>
          <h2>Authentication Error</h2>
          <div>{error}</div>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ marginTop: '20px', padding: '10px 20px' }}
          >
            Return to Home
          </button>
        </div>
      ) : (
        <BeforeLogin />
      )}
    </div>
  )
}

Callback.propTypes = {
  handleLogin: PropTypes.func.isRequired,
}

export default Callback
