import { useEffect, useState } from 'react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import { Box, Grid, Card, CardContent, Typography, CardMedia } from '@mui/material'
import './PlaylistOnClick.css'

const PlaylistOnClick = () => {
    const location = useLocation()
    const { selectedPlaylistId } = location.state || {}

    const [playlistItems, setPlaylistItems] = useState([])

    useEffect(() => {
        const fetchPlaylistItems = async () => {
            try {
                const response = await axios.get(`https://api.spotify.com/v1/playlists/${selectedPlaylistId}/tracks`, {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                    }
                })
                setPlaylistItems(response.data.items)
            } catch (err) {
                console.log('Error fetching playlist items:', err)
            }
        }

        if (selectedPlaylistId) {
            fetchPlaylistItems()
        }
    }, [selectedPlaylistId])

    return (
        <Box className='playlistBox'>
            <Typography variant='h5' className='playlistHead'>
                Playlist Items 
            </Typography>
            <Grid container spacing={3}>
                {playlistItems.map((track, index) => (
                    <Grid item xs={3} key={index}>
                        <Card className='playlistGrid'>
                            <CardMedia
                                component='img'
                                height='100'
                                image={track.track.album.images.length > 0 ? track.track.album.images[0].url : ''}
                                alt='Track Cover'
                            />
                            <CardContent>
                                <Typography variant='h6' component='p'>
                                    {track.track.name}
                                </Typography>
                                <Typography variant='body2' color='textSecondary' component='p'>
                                    {track.track.artists.map(artist => artist.name).join(', ')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}

export default PlaylistOnClick
