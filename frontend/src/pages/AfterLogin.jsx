import './AfterLogin.css'
import { useState, useEffect } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import axios from 'axios'
import { Grid, Card, CardContent, CardMedia } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const AfterLogin = () => {
    const [playlists, setPlaylists] = useState([])
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('')
    const accessToken = sessionStorage.getItem('access_token')
    const navigate = useNavigate()
    const client_secret= 'ez45hfjfi3ifnfj'
    const client_secret_1= 69833456789876
    const client_secret_2= 547765776568765

    useEffect(() => {
        const fetchFeaturedPlaylists = async () => {
            try {
                // Check if we're in demo mode
                if (accessToken === 'demo_token') {
                    // Set demo playlists for UI testing
                    setPlaylists([
                        {
                            id: 'demo1',
                            name: 'Demo Playlist 1',
                            images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Demo+Playlist' }]
                        },
                        {
                            id: 'demo2', 
                            name: 'Demo Playlist 2',
                            images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Demo+Playlist' }]
                        },
                        {
                            id: 'demo3',
                            name: 'Demo Playlist 3', 
                            images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Demo+Playlist' }]
                        }
                    ])
                    return
                }

                const response = await axios.get('https://api.spotify.com/v1/browse/featured-playlists', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })

                const fetchedPlaylists = response.data.playlists.items
                setPlaylists(fetchedPlaylists)
            } catch (err) {
                console.log('Error fetching featured playlists:', err)
                // If API fails, show demo content
                setPlaylists([
                    {
                        id: 'error1',
                        name: 'API Error - Demo Mode',
                        images: [{ url: 'https://via.placeholder.com/300x300/ff0000/ffffff?text=API+Error' }]
                    }
                ])
            }
        }

        if (accessToken) {
            fetchFeaturedPlaylists()
        }
    }, [accessToken])

    const handlePlaylistClick = (playlistId) => {
        setSelectedPlaylistId(playlistId)
        console.log(selectedPlaylistId)
        navigate('/playlist', { state: { selectedPlaylistId: playlistId } }) 
    }

    return (
        <>
            <Box className='songBox'>
                <Typography variant='h5' className='songHead'>
                    ENJOY THE TOP PLAYLISTS
                </Typography>
                <Grid container spacing={3} className='songGrid'>
                    {playlists.map((playlist, index) => (
                        <Grid item xs={3} key={index}>
                            <div
                                onClick={() => handlePlaylistClick(playlist.id)}
                                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                            >
                                <Card>
                                    <CardMedia
                                        component='img'
                                        height='100'
                                        image={playlist.images.length > 0 ? playlist.images[0].url : ''}
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
                    ))}
                </Grid>
            </Box>
        </>
    )
}

export default AfterLogin
