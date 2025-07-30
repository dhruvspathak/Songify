import { useState, useEffect } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import axios from 'axios'
import { Grid, Card, CardContent, CardMedia } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import './AlbumPage.css'
import BeforeLogin from './BeforeLogin'

const AlbumPage = () => {
    const accessToken = sessionStorage.getItem('access_token')
    const [album, setAlbum] = useState([])
    const [selectedAlbumId, setSelectedAlbumId] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchAlbums = async () => {
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

        if (accessToken) {
            fetchAlbums()
        }
    }, [accessToken])

    const handleAlbumClick = (albumId) => {
        setSelectedAlbumId(albumId)
        console.log(selectedAlbumId)
        navigate('/albumItems', { state: { selectedAlbumId: albumId } }) 
    }

    return (
        <>
            {accessToken ? 
                <Box className='albumBox'>
                    <Typography variant='h4' className='head'>
                        Newly Released Albums 
                    </Typography>
                    <Grid container spacing={3} className='albumGrid'>
                        {album.map((album, index) => (
                            <Grid item xs={3} key={index}>
                                <div
                                    onClick={() => handleAlbumClick(album.id)}
                                    style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                                >
                                    <Card>
                                        <CardMedia
                                            component='img'
                                            height='100'
                                            image={album.images.length > 0 ? album.images[0].url : ''}
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
                        ))}
                    </Grid>
                </Box>
                : <BeforeLogin />}
        </>
    )
}

export default AlbumPage
