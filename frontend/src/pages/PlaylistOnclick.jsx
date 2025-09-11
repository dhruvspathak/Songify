import { useEffect, useState } from 'react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import { Box, Grid, Card, CardContent, Typography, CardMedia } from '@mui/material'
import './PlaylistOnClick.css'
import { getAccessToken } from '../utils/auth'

const PlaylistOnClick = () => {
    const location = useLocation()
    const { selectedPlaylistId } = location.state || {}

    const [playlistItems, setPlaylistItems] = useState([])
    const [accessToken, setAccessToken] = useState(null)
    const [loading, setLoading] = useState(true)

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
        const fetchPlaylistItems = async () => {
            if (!accessToken || !selectedPlaylistId) return
            
            try {
                const response = await axios.get(`https://api.spotify.com/v1/playlists/${selectedPlaylistId}/tracks`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
                setPlaylistItems(response.data.items)
            } catch (err) {
                console.log('Error fetching playlist items:', err)
            }
        }

        fetchPlaylistItems()
    }, [selectedPlaylistId, accessToken])

    return (
        <Box className='playlistBox'>
            <Typography variant='h5' className='playlistHead'>
                Playlist Items 
            </Typography>
            <Grid container spacing={3}>
                {playlistItems && playlistItems.length > 0 ? playlistItems.map((track, index) => (
                    <Grid item xs={3} key={index}>
                        <Card className='playlistGrid'>
                            <CardMedia
                                component='img'
                                height='100'
                                image={track.track.album.images && track.track.album.images.length > 0 ? track.track.album.images[0].url : 'https://via.placeholder.com/300x300/1db954/ffffff?text=No+Image'}
                                alt='Track Cover'
                            />
                            <CardContent>
                                <Typography variant='h6' component='p'>
                                    {track.track.name}
                                </Typography>
                                <Typography variant='body2' color='textSecondary' component='p'>
                                    {track.track.artists && track.track.artists.length > 0 ? track.track.artists.map(artist => artist.name).join(', ') : 'Unknown Artist'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )) : (
                    <Grid item xs={12}>
                        <Typography variant='body1' style={{textAlign: 'center', padding: '20px'}}>
                            No tracks available in this playlist.
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    )
}

export default PlaylistOnClick
