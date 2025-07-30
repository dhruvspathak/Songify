// import PropTypes from 'prop-types'

// const MusicPlayerSlider = () => {

//   const trackId= '51EC3I1nQXpec4gDk0mQyP'
//   return (
//     <>
//       <div className="container">
//         <iframe
//           title="Spotify Player"
//           src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
//           width="95%"
//           height="390"
//           frameBorder="0"
//           allow="encrypted-media"
//         ></iframe>
//       </div>
//       <h6>{trackId ? trackId : `no id`}</h6>
//     </>
//   )
// }

// MusicPlayerSlider.propTypes = {
//   trackId: PropTypes.string.isRequired
// }


// export default MusicPlayerSlider







/////////////////////////////////////////////////////////////////////////






// import { useState, useEffect } from 'react'
// import PropTypes from 'prop-types'
import './Player.css'

// function MusicPlayerSlider({ trackId }) {
//     const accessToken = sessionStorage.getItem('access_token')
//     const track = {
//         name: "",
//         album: {
//             images: [{ url: "" }]
//         },
//         artists: [{ name: "" }]
//     }
//     const [player, setPlayer] = useState(undefined)
//     const [deviceID, setDeviceID] = useState(null)
//     const [is_paused, setPaused] = useState(false)
//     const [is_active, setActive] = useState(false)
//     const [current_track, setTrack] = useState(track)


//     useEffect(() => {
//         const script = document.createElement("script")
//         script.src = "https://sdk.scdn.co/spotify-player.js"
//         script.async = true
//         script.onload = () => console.log("Spotify SDK script loaded")
//         document.body.appendChild(script)

//         window.onSpotifyWebPlaybackSDKReady = () => {
//             console.log("Spotify Web Playback SDK is ready")

//             const player = new window.Spotify.Player({
//                 name: 'Web Playback SDK',
//                 getOAuthToken: cb => { cb(accessToken) },
//                 volume: 0.5
//             })

//             setPlayer(player)

//             player.addListener('initialization_error', ({ message }) => {
//                 console.error('Failed to initialize', message)
//             })
//             player.addListener('authentication_error', ({ message }) => {
//                 console.error('Failed to authenticate', message)
//             })
//             player.addListener('account_error', ({ message }) => {
//                 console.error('Failed to validate Spotify account', message)
//             })
//             player.addListener('playback_error', ({ message }) => {
//                 console.error('Failed to perform playback', message)
//             })

//             player.addListener('ready', ({ device_id }) => {
//                 console.log('Ready with Device ID', device_id)
//                 setDeviceID(device_id)
//                 console.log('Set Device ID:', device_id)
//             })

//             player.addListener('not_ready', ({ device_id }) => {
//                 console.log('Device ID has gone offline', device_id)
//             })

//             player.addListener('player_state_changed', (state) => {
//                 if (!state) {
//                     return
//                 }
//                 setTrack(state.track_window.current_track)
//                 setPaused(state.paused)
//                 player.getCurrentState().then(state => {
//                     setActive(!!state)
//                 })
//             })

//             player.connect().then(success => {
//                 if (success) {
//                     console.log('The Web Playback SDK successfully connected to Spotify!')
//                 } else {
//                     console.error('The Web Playback SDK failed to connect to Spotify.')
//                 }
//             })
//         }
//     }, [])


//     useEffect(() => {
//         if (player && trackId && deviceID) {
//             console.log("Pausing player before playing new track")
//             player.pause().then(() => {
//                 fetch(`https://api.spotify.com/v1/me/player/play`, {
//                     method: 'PUT',
//                     headers: {
//                         'Authorization': `Bearer ${accessToken}`,
//                         'Content-Type': 'application/json'
//                     },
//                     body: JSON.stringify({ uris: [`spotify:track:${trackId}`] })
//                 }).then(response => {
//                     if (response.ok) {
//                         console.log(`Playing track ID: ${trackId}`)
//                     } else {
//                         console.error('Failed to play track:', response)
//                     }
//                 }).catch(err => {
//                     console.error('Error playing track:', err)
//                 })
//             }).catch(err => {
//                 console.error('Error pausing player:', err)
//             })
//         }
//     }, [player, trackId, deviceID, accessToken])

//     const transferPlayback = async () => {
//         if (!deviceID) {
//             console.error('No device ID available for transfer playback')
//             return
//         }

//         try {
//             const response = await fetch('https://api.spotify.com/v1/me/player', {
//                 method: 'PUT',
//                 headers: {
//                     'Authorization': `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     device_ids: [deviceID],
//                     play: true
//                 })
//             })

//             if (!response.ok) {
//                 throw new Error('Failed to transfer playback')
//             }

//             console.log('Playback transferred successfully')
//         } catch (error) {
//             console.error('Error transferring playback:', error)
//         }
//     }

//     return (
//         <div className="container">
//             <div className="main-wrapper">
//                 <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />
//                 <div className="now-playing__side">
//                     <div className="now-playing__name">{current_track.name}</div>
//                     <div className="now-playing__artist">{current_track.artists[0].name}</div>
//                 </div>
//                 <div className='buttonList'>
//                 <button className="btn-spotify" onClick={() => player.previousTrack()}>&lt;&lt;</button>
//                 <button className="btn-spotify" onClick={() => player.togglePlay()}>{is_paused ? "PLAY" : "PAUSE"}</button>
//                 <button className="btn-spotify" onClick={() => player.nextTrack()}>&gt;&gt;</button>
//                 </div>
//             </div>
//             <div className="controls">
//                 <button className="btn-spotify" onClick={transferPlayback}>Transfer Playback</button>
//             </div>
//         </div>
//     )
// }

// MusicPlayerSlider.propTypes = {
//     trackId: PropTypes.string.isRequired
// }

// export default MusicPlayerSlider

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

function MusicPlayerSlider({ trackId }) {
    const accessToken = sessionStorage.getItem('access_token')
    const track = {
        name: "",
        album: {
            images: [{ url: "" }]
        },
        artists: [{ name: "" }]
    }
    const [player, setPlayer] = useState(undefined)
    const [deviceID, setDeviceID] = useState(null)
    const [is_paused, setPaused] = useState(false)
    const [is_active, setActive] = useState(false)
    const [current_track, setTrack] = useState(track)

    const fetchDeviceIDs = async () => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                console.log('Available devices:', data)
                const device = data.devices.find(d => d.is_active)
                if (device) {
                    setDeviceID(device.id)
                    console.log('Active device ID:', device.id)
                } else {
                    console.warn('No active device found.')
                }
            } else {
                console.error('Failed to fetch devices:', response)
            }
        } catch (error) {
            console.error('Error fetching devices:', error)
        }
    }

    useEffect(() => {
        const script = document.createElement("script")
        script.src = "https://sdk.scdn.co/spotify-player.js"
        script.async = true
        script.onload = () => console.log("Spotify SDK script loaded")
        document.body.appendChild(script)

        window.onSpotifyWebPlaybackSDKReady = () => {
            console.log("Spotify Web Playback SDK is ready")

            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(accessToken) },
                volume: 0.5
            })

            setPlayer(player)

            player.addListener('initialization_error', ({ message }) => {
                console.error('Failed to initialize', message)
            })
            player.addListener('authentication_error', ({ message }) => {
                console.error('Failed to authenticate', message)
            })
            player.addListener('account_error', ({ message }) => {
                console.error('Failed to validate Spotify account', message)
            })
            player.addListener('playback_error', ({ message }) => {
                console.error('Failed to perform playback', message)
            })

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id)
                setDeviceID(device_id)
                console.log('Set Device ID:', device_id)
                fetchDeviceIDs()
            })

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id)
            })

            player.addListener('player_state_changed', (state) => {
                if (!state) {
                    return
                }
                setTrack(state.track_window.current_track)
                setPaused(state.paused)
                player.getCurrentState().then(state => {
                    setActive(!!state)
                })
            })

            player.connect().then(success => {
                if (success) {
                    console.log('The Web Playback SDK successfully connected to Spotify!')
                } else {
                    console.error('The Web Playback SDK failed to connect to Spotify.')
                }
            })
        }
    }, [])

    useEffect(() => {
        if (player && trackId && deviceID) {
            console.log("Pausing player before playing new track")
            player.pause().then(() => {
                fetch(`https://api.spotify.com/v1/me/player/play`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ uris: [`spotify:track:${trackId}`] })
                }).then(response => {
                    if (response.ok) {
                        console.log(`Playing track ID: ${trackId}`)
                    } else {
                        console.error('Failed to play track:', response)
                    }
                }).catch(err => {
                    console.error('Error playing track:', err)
                })
            }).catch(err => {
                console.error('Error pausing player:', err)
            })
        }
    }, [player, trackId, deviceID, accessToken])

    const handlePlayerAction = (action) => {
        if (player) {
            player[action]().catch(err => {
                console.error(`Error performing ${action}:`, err)
            })
        } else {
            console.error('Player is not initialized')
        }
    }

    const transferPlayback = async () => {
        if (!deviceID) {
            console.error('No device ID available for transfer playback')
            return
        }

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    device_ids: [deviceID],
                    play: true
                })
            })

            if (!response.ok) {
                throw new Error('Failed to transfer playback')
            }

            console.log('Playback transferred successfully')
        } catch (error) {
            console.error('Error transferring playback:', error)
        }
    }

    return (
        <div className="container">
            <div className="main-wrapper">
                <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />
                <div className="now-playing__side">
                    <div className="now-playing__name">{current_track.name}</div>
                    <div className="now-playing__artist">{current_track.artists[0].name}</div>
                </div>
                <div className='buttonList'>
                <button className="btn-spotify" onClick={() => { player.previousTrack() }}>&lt;&lt;</button>
                <button className="btn-spotify" onClick={() => { player.togglePlay() }}>{is_paused ? "PLAY" : "PAUSE"}</button>
                <button className="btn-spotify" onClick={() => handlePlayerAction('nextTrack')}>&gt;&gt;</button>
                </div>
            </div>
            <div className="controls">
                <button className="btn-spotify" onClick={transferPlayback}>Transfer Playback</button>
            </div>
        </div>
    )
}

MusicPlayerSlider.propTypes = {
    trackId: PropTypes.string.isRequired
}

export default MusicPlayerSlider
