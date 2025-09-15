import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks';
import { API_ENDPOINTS } from '../../constants';
import { secureLog, secureError, secureWarn } from '../../utils/secureLogger';
import './Player.css';

const MusicPlayer = ({ trackId }) => {
    // Use the auth hook instead of manual token fetching
    const { accessToken, loading: authLoading } = useAuth();
    
    const [player, setPlayer] = useState(undefined);
    const [deviceID, setDeviceID] = useState(null);
    const [isPaused, setPaused] = useState(false);
    const [isActive, setActive] = useState(false);
    const [deviceStatus, setDeviceStatus] = useState('connecting');
    
    const defaultTrack = {
        name: "No track selected",
        album: {
            images: [{ url: "" }]
        },
        artists: [{ name: "Please select a track" }]
    };
    
    const [currentTrack, setTrack] = useState(defaultTrack);

    // Initialize Spotify SDK when access token is available
    useEffect(() => {
        // Only load Spotify SDK if we have a valid access token
        if (!accessToken) {
            return
        }
        
        const script = document.createElement("script")
        script.src = "https://sdk.scdn.co/spotify-player.js"
        script.async = true
        script.onload = () => {}
        document.body.appendChild(script)

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(accessToken) },
                volume: 0.5
            })

            setPlayer(player)

            player.addListener('initialization_error', ({ message }) => {
                secureError('Failed to initialize', message)
            })
            player.addListener('authentication_error', ({ message }) => {
                secureError('Failed to authenticate', message)
            })
            player.addListener('account_error', ({ message }) => {
                secureError('Failed to validate Spotify account', message)
            })
            player.addListener('playback_error', ({ message }) => {
                secureError('Failed to perform playback', message)
            })

            player.addListener('ready', ({ device_id }) => {
                setDeviceID(device_id)
                setDeviceStatus('connected')
                fetchDeviceIDs()
            })

            player.addListener('not_ready', ({ device_id }) => {
                setDeviceStatus('disconnected')
            })

            player.addListener('player_state_changed', (state) => {
                if (!state) {
                    return;
                }
                setTrack(state.track_window.current_track);
                setPaused(state.paused);
                player.getCurrentState().then(state => {
                    const isActive = !!state;
                    setActive(isActive);
                    
                    // Emit music state change event for sidebar
                    const musicStateEvent = new CustomEvent('musicStateChange', {
                        detail: {
                            isPaused: state.paused,
                            isActive: isActive,
                            hasTrack: !!state.track_window.current_track,
                            currentTrack: state.track_window.current_track
                        }
                    });
                    window.dispatchEvent(musicStateEvent);
                });
            });

            player.connect().then(success => {
                if (!success) {
                    secureError('Web Playback SDK failed to connect')
                }
            })
        }
    }, [accessToken])

    // Handle track changes
    useEffect(() => {
        if (player && trackId && deviceID && accessToken) {
            secureLog("Attempting to play track:", { trackId: trackId ? 'track_provided' : 'no_track' })
            
            // Strategy: Use Web Playback SDK for immediate playback, fallback to API
            const playTrackViaSdk = () => {
                return new Promise((resolve, reject) => {
                    // First, ensure our web player is the active device
                    transferPlayback().then(() => {
                        // Wait a moment for device transfer to complete
                        setTimeout(() => {
                            // Now use the API to start playback on our device
                            fetch(`https://api.spotify.com/v1/me/player/play`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ 
                                    uris: [`spotify:track:${trackId}`],
                                    device_id: deviceID
                                })
                            }).then(response => {
                                if (response.ok) {
                                    secureLog(`✅ Successfully started playing track`)
                                    resolve(response)
                                } else if (response.status === 404) {
                                    // Device not found, try without specifying device
                                    return fetch(`https://api.spotify.com/v1/me/player/play`, {
                                        method: 'PUT',
                                        headers: {
                                            'Authorization': `Bearer ${accessToken}`,
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ 
                                            uris: [`spotify:track:${trackId}`]
                                        })
                                    })
                                } else {
                                    throw new Error(`API Playback failed: ${response.status}`)
                                }
                            }).then(response => {
                                if (response && response.ok) {
                                    secureLog(`✅ Successfully started playing track (no device specified)`)
                                    resolve(response)
                                } else if (response) {
                                    throw new Error(`Fallback playback failed: ${response.status}`)
                                }
                            }).catch(reject)
                        }, 1000) // Wait 1 second for device transfer
                        }).catch(transferError => {
                        secureWarn('Device transfer failed, trying direct API call:', transferError)
                        // Try direct API call without transfer
                        fetch(`https://api.spotify.com/v1/me/player/play`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ 
                                uris: [`spotify:track:${trackId}`]
                            })
                        }).then(response => {
                            if (response.ok) {
                                secureLog(`✅ Direct API playback successful`)
                                resolve(response)
                            } else {
                                throw new Error(`Direct API failed: ${response.status}`)
                            }
                        }).catch(reject)
                    })
                })
            }

            playTrackViaSdk().catch(err => {
                secureError('❌ All playback methods failed:', err)
                if (err.message.includes('404')) {
                    secureWarn('💡 Tip: Make sure you have Spotify Premium and an active Spotify session running')
                } else if (err.message.includes('403')) {
                    secureWarn('💡 Tip: Check that your Spotify app has proper permissions and is not in development mode')
                }
            })
        }
    }, [player, trackId, deviceID, accessToken])
    
    // Don't initialize player if loading or no access token
    if (authLoading) {
        return (
            <div className="player-container">
                <div className="player-wrapper">
                    <div className="player-info">
                        <div className="player-track-name">Loading...</div>
                        <div className="player-artist-name">Checking authentication</div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!accessToken) {
        return (
            <div className="player-container">
                <div className="player-wrapper">
                    <div className="player-info">
                        <div className="player-track-name">Please log in to play music</div>
                        <div className="player-artist-name">Spotify login required</div>
                    </div>
                </div>
            </div>
        );
    }

    const fetchDeviceIDs = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.SPOTIFY.PLAYER.DEVICES, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json()
                secureLog('Available devices found:', data)
                const device = data.devices.find(d => d.is_active)
                if (device) {
                    setDeviceID(device.id)
                    secureLog('Active device found:', { type: device.type, name: device.name, is_active: device.is_active })
                } else {
                    secureWarn('No active device found.')
                }
            } else {
                secureError('Failed to fetch devices:', { status: response.status, statusText: response.statusText })
            }
        } catch (error) {
            secureError('Error fetching devices:', error)
        }
    }

    const handlePlayerAction = (action) => {
        if (player) {
            player[action]().catch(err => {
                secureError(`Error performing ${action}:`, err)
                if (err.message && err.message.includes('no list was loaded')) {
                    secureWarn('💡 No track loaded in player. Please select a track first or make sure Spotify is playing something.')
                    // Try to get current playback state and resume if possible
                    fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }).then(response => {
                        if (response.ok) {
                            return response.json()
                        }
                        throw new Error('No current playback')
                    }).then(data => {
                        if (data && data.item) {
                            secureLog('Found current track, attempting to resume playback...')
                            // Set the current track and try the action again
                            setTrack(data.item)
                            // Wait a moment then retry the action
                            setTimeout(() => {
                                player[action]().catch(retryErr => {
                                    secureError(`Retry of ${action} also failed:`, retryErr)
                                })
                            }, 500)
                        }
                    }).catch(playbackErr => {
                        secureWarn('No current playback found:', playbackErr.message)
                    })
                }
            })
        } else {
            secureError('Player is not initialized')
        }
    }

    const transferPlayback = async () => {
        if (!deviceID) {
            secureError('No device ID available for transfer playback')
            return Promise.reject('No device ID')
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
                if (response.status === 404) {
                    throw new Error('Premium account required for playback control. Please upgrade to Spotify Premium.')
                }
                throw new Error(`Transfer failed: ${response.status} ${response.statusText}`)
            }

            secureLog('✅ Playback transferred to web player successfully')
            return response
        } catch (error) {
            secureError('❌ Transfer playback error:', error.message)
            if (error.message.includes('404')) {
                secureWarn('💡 This feature requires Spotify Premium and an active device')
            }
            throw error
        }
    }

    return (
        <div className="player-container">
            <div className="player-wrapper">
                <img 
                    src={currentTrack.album.images[0]?.url} 
                    className="player-cover" 
                    alt={`${currentTrack.name} cover`} 
                />
                <div className="player-info">
                    <div className="player-track-name">{currentTrack.name}</div>
                    <div className="player-artist-name">{currentTrack.artists[0]?.name}</div>
                </div>
                <div className="player-controls">
                    <button 
                        className="player-btn" 
                        onClick={() => { player?.previousTrack(); }}
                        aria-label="Previous track"
                    >
                        ⏮
                    </button>
                    <button 
                        className="player-btn player-btn--primary" 
                        onClick={() => { player?.togglePlay(); }}
                        aria-label={isPaused ? "Play" : "Pause"}
                    >
                        {isPaused ? "▶" : "⏸"}
                    </button>
                    <button 
                        className="player-btn" 
                        onClick={() => handlePlayerAction('nextTrack')}
                        aria-label="Next track"
                    >
                        ⏭
                    </button>
                </div>
            </div>
            <div className="player-debug">
                <button className="player-btn player-btn--small" onClick={transferPlayback}>
                    Transfer Playback
                </button>
                <button 
                    className="player-btn player-btn--small" 
                    onClick={() => {
                        fetch(API_ENDPOINTS.AUTH.DEBUG, { credentials: 'include' })
                        .then(r => r.json())
                        .then(data => {
                            secureLog('🔍 Debug Info:', data);
                        })
                        .catch(e => secureError('Debug failed:', e));
                    }}
                >
                    Debug Scopes
                </button>
                <div className={`player-status player-status--${deviceStatus}`}>
                    Device Status: {deviceStatus === 'connected' ? '🟢 Connected' : deviceStatus === 'disconnected' ? '🔴 Offline' : '🟡 Connecting...'}
                </div>
            </div>
        </div>
    );
}

MusicPlayer.propTypes = {
    trackId: PropTypes.string
};

export default MusicPlayer;