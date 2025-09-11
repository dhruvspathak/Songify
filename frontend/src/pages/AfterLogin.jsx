import './AfterLogin.css'
import { useState, useEffect } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import axios from 'axios'
import { Grid, Card, CardContent, CardMedia } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { getAccessToken } from '../utils/auth'

const AfterLogin = () => {
    const [playlists, setPlaylists] = useState([])
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('')
    const [accessToken, setAccessToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    // Fetch access token on component mount
    useEffect(() => {
        const fetchToken = async () => {
            const token = await getAccessToken()
            setAccessToken(token)
            setLoading(false)
        }
        fetchToken()
    }, [])

    useEffect(() => {
        const fetchFeaturedPlaylists = async () => {
            if (!accessToken) return
            
            try {
                let response;
                let playlists = [];

                // Try multiple endpoints in order of preference
                const endpoints = [
                    {
                        name: 'User Playlists',
                        url: 'https://api.spotify.com/v1/me/playlists',
                        params: { limit: 20 },
                        dataPath: 'items'
                    },
                    {
                        name: 'User Top Tracks (as playlist alternative)',
                        url: 'https://api.spotify.com/v1/me/top/tracks',
                        params: { limit: 10, time_range: 'short_term' },
                        dataPath: 'items',
                        transform: (tracks) => tracks.map(track => ({
                            id: `top-track-${track.id}`,
                            name: `🎵 ${track.name}`,
                            images: track.album.images,
                            description: `By ${track.artists.map(a => a.name).join(', ')}`,
                            type: 'track'
                        }))
                    }
                ];

                // Try each endpoint until one works
                for (const endpoint of endpoints) {
                    try {
                        console.log(`Trying ${endpoint.name} endpoint...`);
                        response = await axios.get(endpoint.url, {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`
                            },
                            params: endpoint.params || {}
                        });

                        let data = response.data[endpoint.dataPath] || [];
                        
                        // Apply transformation if provided
                        if (endpoint.transform) {
                            data = endpoint.transform(data);
                        }

                        if (data && data.length > 0) {
                            playlists = data;
                            console.log(`✅ Successfully loaded ${data.length} items from ${endpoint.name}`);
                            break;
                        }
                    } catch (endpointError) {
                        console.log(`❌ ${endpoint.name} failed:`, endpointError.response?.status, endpointError.response?.data?.error?.message);
                        continue;
                    }
                }

                // If we still have no playlists, try the featured playlists as last resort
                if (playlists.length === 0) {
                    try {
                        console.log('Trying featured playlists as last resort...');
                        response = await axios.get('https://api.spotify.com/v1/browse/featured-playlists', {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`
                            }
                        });
                        playlists = response.data.playlists?.items || [];
                        console.log('✅ Featured playlists worked!');
                    } catch (featuredError) {
                        console.log('❌ Featured playlists also failed:', featuredError.response?.status);
                    }
                }

                // Set the playlists or fallback to demo content
                if (playlists.length > 0) {
                    setPlaylists(playlists);
                } else {
                    console.log('🔄 Using demo content - no API endpoints accessible');
                    setPlaylists([
                        {
                            id: 'demo1',
                            name: '🚧 Development Mode Active',
                            images: [{ url: 'https://via.placeholder.com/300x300/ff9800/ffffff?text=Dev+Mode' }],
                            description: 'Add yourself as test user in Spotify Developer Dashboard'
                        },
                        {
                            id: 'demo2',
                            name: '🔑 Premium Required',
                            images: [{ url: 'https://via.placeholder.com/300x300/4caf50/ffffff?text=Premium' }],
                            description: 'Some features require Spotify Premium account'
                        },
                        {
                            id: 'demo3',
                            name: '📱 Sample Playlist',
                            images: [{ url: 'https://via.placeholder.com/300x300/2196f3/ffffff?text=Sample' }],
                            description: 'This is how your playlists will appear'
                        }
                    ]);
                }
            } catch (err) {
                console.error('Unexpected error in playlist fetching:', err);
                setPlaylists([
                    {
                        id: 'error1',
                        name: '❌ Connection Error',
                        images: [{ url: 'https://via.placeholder.com/300x300/f44336/ffffff?text=Error' }],
                        description: 'Please check your internet connection'
                    }
                ]);
            }
        }

        fetchFeaturedPlaylists()
    }, [accessToken])

    const handlePlaylistClick = (playlistId) => {
        setSelectedPlaylistId(playlistId)
        console.log(selectedPlaylistId)
        navigate('/playlist', { state: { selectedPlaylistId: playlistId } }) 
    }

    if (loading) {
        return (
            <Box className='songBox'>
                <Typography variant='h5' className='songHead'>
                    Loading playlists...
                </Typography>
            </Box>
        )
    }

    return (
        <>
            <Box className='songBox'>
                <Typography variant='h5' className='songHead'>
                    ENJOY THE TOP PLAYLISTS
                </Typography>
                <Grid container spacing={3} className='songGrid'>
                    {playlists && playlists.length > 0 ? playlists.map((playlist, index) => (
                        <Grid item xs={3} key={index}>
                            <div
                                onClick={() => handlePlaylistClick(playlist.id)}
                                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                            >
                                <Card>
                                    <CardMedia
                                        component='img'
                                        height='100'
                                        image={playlist.images && playlist.images.length > 0 ? playlist.images[0].url : 'https://via.placeholder.com/300x300/1db954/ffffff?text=No+Image'}
                                        alt='Playlist Cover'
                                    />
                                    <CardContent>
                                        <Typography variant='body1' component='p'>
                                            {playlist.name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </div>
                        </Grid>
                    )) : (
                        <Grid item xs={12}>
                            <Typography variant='body1' style={{textAlign: 'center', padding: '20px'}}>
                                No playlists available. Please check your Spotify permissions or try refreshing the page.
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </>
    )
}

export default AfterLogin
