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
                const response = await axios.get('https://api.spotify.com/v1/browse/featured-playlists', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })

                const fetchedPlaylists = response.data.playlists.items
                setPlaylists(fetchedPlaylists)
            } catch (err) {
                console.log('Error fetching featured playlists:', err)
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
