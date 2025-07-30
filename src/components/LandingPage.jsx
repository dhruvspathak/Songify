import queryString from 'query-string'
import Layout from './Layout'
import AfterLogin from '../pages/AfterLogin'
import BeforeLogin from '../pages/BeforeLogin'

const access_token = sessionStorage.getItem('access_token')

const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const scopeList = 'streaming user-read-playback-state user-modify-playback-state user-read-currently-playing'

const handleLogin = () => {
  const state = generateRandomString(16)
  const queryParams = queryString.stringify({
    response_type: 'code',
    client_id: import.meta.env.VITE_CLIENT_ID,
    scope: scopeList,
    redirect_uri: 'http://localhost:5173/callback',
    state: state,
    show_dialog: true,
  })

  window.location.href = `https://accounts.spotify.com/authorize?${queryParams}`
}

const LandingPage = () => {
  return (
    <div>
      <Layout handleLogin={handleLogin} />
      {access_token ? <AfterLogin /> : <BeforeLogin />}
    </div>
  )
}

export default LandingPage
