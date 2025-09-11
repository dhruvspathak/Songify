import { useState, useEffect } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import axios from 'axios'
import { Grid, Card, CardContent, CardMedia } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import './AlbumPage.css'
import BeforeLogin from './BeforeLogin'
import { getAccessToken } from '../utils/auth'

const AlbumPage = () => {
    const [accessToken, setAccessToken] = useState(null)
    const [album, setAlbum] = useState([])
    const [selectedAlbumId, setSelectedAlbumId] = useState('')
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
        const fetchAlbums = async () => {
            if (!accessToken) return
            
            try {
                const response = await axios.get('https://api.spotify.com/v1/browse/new-releases', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
                setAlbum(response.data.albums.items)
            } catch (err) {
                console.log('Error fetching albums:', err)
            }
        }

        fetchAlbums()
    }, [accessToken])

    const handleAlbumClick = (albumId) => {
        setSelectedAlbumId(albumId)
        console.log(selectedAlbumId)
        navigate('/albumItems', { state: { selectedAlbumId: albumId } }) 
    }

    if (loading) {
        return (
            <Box className='albumBox'>
                <Typography variant='h4' className='head'>
                    Loading albums...
                </Typography>
            </Box>
        )
    }

    return (
        <>
            {accessToken ? (
                <Box className='albumBox'>
                    <Typography variant='h4' className='head'>
                        Newly Released Albums 
                    </Typography>
                    <Grid container spacing={3} className='albumGrid'>
                        {album && album.length > 0 ? album.map((album, index) => (
                            <Grid item xs={3} key={index}>
                                <div
                                    onClick={() => handleAlbumClick(album.id)}
                                    style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                                >
                                    <Card>
                                        <CardMedia
                                            component='img'
                                            height='100'
                                            image={album.images && album.images.length > 0 ? album.images[0].url : 'https://via.placeholder.com/300x300/1db954/ffffff?text=No+Image'}
                                            alt='Album Cover'
                                        />
                                        <CardContent>
                                            <Typography variant='body1' component='p' className='ellipsis'>
                                                {album.name}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </div>
                            </Grid>
                        )) : (
                            <Grid item xs={12}>
                                <Typography variant='body1' style={{textAlign: 'center', padding: '20px'}}>
                                    No albums available. Please check your connection or try again later.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            ) : <BeforeLogin />}
        </>
    )
}

export default AlbumPage
