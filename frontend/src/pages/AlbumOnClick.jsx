import { useEffect, useState } from 'react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import { Box, Grid, Card, CardContent, Typography} from '@mui/material'
import './AlbumOnClick.css'

const AlbumOnClick = () => {
    const location = useLocation()
    const { selectedAlbumId } = location.state || {}

    const [albumTracks, setAlbumTracks] = useState([])

    useEffect(() => {
        const fetchAlbumTracks = async () => {
            try {
                const response = await axios.get(`https://api.spotify.com/v1/albums/${selectedAlbumId}/tracks`, {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                    }
                })
                setAlbumTracks(response.data.items)
            } catch (err) {
                console.log('Error fetching album tracks:', err)
            }
        }

        if (selectedAlbumId) {
            fetchAlbumTracks()
        }
    }, [selectedAlbumId])

    return (
        <Box className='AlbumBox'>
            <Typography variant='h5' className='AlbumHead'>
                Album Tracks 
            </Typography>
            {albumTracks.length > 0 ? (
                <Grid container spacing={3}>
                    {albumTracks.map((track, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card className='AlbumGrid'>
                                {/* <CardMedia
                                    component='img'
                                    height='100'
                                    image={track.album?.images?.[0]?.url || 'default-image-url'}
                                    alt='Track Cover'
                                /> */}
                                <CardContent>
                                    <Typography variant='h6' component='p' className='ellipsis'>
                                        {track.name}
                                    </Typography>
                                    <Typography variant='body2' color='textSecondary' component='p' className='ellipsis'>
                                        {track.artists.map(artist => artist.name).join(', ')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography variant='body1'>LOADING...</Typography>
            )}
        </Box>
    )
}

export default AlbumOnClick
