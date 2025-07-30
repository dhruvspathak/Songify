import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import axios from 'axios'
import queryString from 'query-string'
import Layout from './Layout'
import BeforeLogin from '../pages/AfterLogin'

const Callback = ({ handleLogin }) => {
  const [accessToken, setAccessToken] = useState(null)

  useEffect(() => {
    const fetchToken = async () => {
      const code = queryString.parse(window.location.search).code
      const state = queryString.parse(window.location.search).state

      if (!state) {
          window.location.href = '/#' + queryString.stringify({ error: 'state_mismatch' })
      } else {
          const redirect_uri = 'http://localhost:5173/callback'
          const client_id = import.meta.env.VITE_CLIENT_ID
          const client_secret = import.meta.env.VITE_CLIENT_SECRET
  
          const authHeader = 'Basic ' + btoa(client_id + ':' + client_secret)
  
          const authOptions = {
              method: 'POST',
              url: 'https://accounts.spotify.com/api/token',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Authorization': authHeader,
              },
              data: queryString.stringify({
                  code: code,
                  redirect_uri: redirect_uri,
                  grant_type: 'authorization_code',
                  client_id: client_id
              })
          }
  
          try {
              const response = await axios(authOptions)
              const access_token = response.data.access_token
              console.log('access_token:', access_token)
              sessionStorage.setItem('access_token', access_token)
              setAccessToken(access_token)
          } catch (error) {
              console.log('Error fetching token:', error)
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
