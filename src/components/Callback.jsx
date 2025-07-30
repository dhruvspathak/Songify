import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import axios from 'axios'
import queryString from 'query-string'
import Layout from './Layout'
import BeforeLogin from '../pages/AfterLogin'
import { getToken } from '../services/spotifyService'

const Callback = ({ handleLogin }) => {
  const [accessToken, setAccessToken] = useState(null)

  useEffect(() => {
    const fetchToken = async () => {
      const code = queryString.parse(window.location.search).code
      const state = queryString.parse(window.location.search).state

      if (!state) {
          window.location.href = '/#' + queryString.stringify({ error: 'state_mismatch' })
      } else {
          try {
              const tokenData = await getToken(code)
              setAccessToken(tokenData.access_token)
              sessionStorage.setItem('access_token', tokenData.access_token)
          } catch (error) {
              console.error('Error fetching token:', error)
          }
      }
  }
  

    fetchToken()
  }, [accessToken])

  return (
    <div>
      <Layout handleLogin={handleLogin} />
      <BeforeLogin />
    </div>
  )
}

Callback.propTypes = {
  handleLogin: PropTypes.func.isRequired,
}

export default Callback
