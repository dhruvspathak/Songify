import { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './AlbumPage.css';
import { BeforeLogin } from '../../auth';
import { useAuth, useSpotifyApi } from '../../../hooks';
import { LoadingSpinner, ErrorMessage, MediaCard } from '../../../components/ui';

const AlbumPage = () => {
    const [albums, setAlbums] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const { accessToken } = useAuth();
    const { fetchNewReleases, loading } = useSpotifyApi(accessToken);

    useEffect(() => {
        const loadAlbums = async () => {
            if (!accessToken) return;
            
            setError(null);
            
            try {
                const albumData = await fetchNewReleases(20);
                setAlbums(albumData || []);
            } catch (err) {
                console.error('Error fetching albums:', err);
                setError('Failed to load albums. Please try again.');
            }
        };

        loadAlbums();
    }, [accessToken, fetchNewReleases]);

    const handleAlbumClick = (albumId) => {
        navigate('/albumItems', { state: { selectedAlbumId: albumId } });
    };

    const retryLoad = () => {
        setError(null);
        setAlbums([]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner message="Loading albums..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-content">
                <ErrorMessage 
                    message={error}
                    title="Failed to Load Albums"
                    onRetry={retryLoad}
                />
            </div>
        );
    }

    return (
        <>
            {accessToken ? (
                <div className="main-content">
                    <div className="section-header">
                        <h1 className="section-title">Newly Released Albums</h1>
                    </div>
                    <Grid container spacing={3} className="grid-cols-responsive">
                        {albums && albums.length > 0 ? albums.map((album, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={album.id || index}>
                                <MediaCard
                                    id={album.id}
                                    title={album.name}
                                    subtitle={album.artists?.map(artist => artist.name).join(', ')}
                                    imageUrl={album.images?.[0]?.url}
                                    imageAlt={`${album.name} cover`}
                                    onClick={handleAlbumClick}
                                    type="album"
                                />
                            </Grid>
                        )) : (
                            <Grid item xs={12}>
                                <div className="text-center p-4">
                                    <p>No albums available. Please check your connection or try again later.</p>
                                </div>
                            </Grid>
                        )}
                    </Grid>
                </div>
            ) : <BeforeLogin />}
        </>
    );
}

export default AlbumPage;

