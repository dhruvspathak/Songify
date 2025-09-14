import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import './AlbumDetails.css';
import { useAuth, useSpotifyApi } from '../../../hooks';
import { LoadingSpinner, ErrorMessage, MediaCard } from '../../../components/ui';

const AlbumDetails = () => {
    const location = useLocation();
    const { selectedAlbumId } = location.state || {};

    const [albumTracks, setAlbumTracks] = useState([]);
    const [error, setError] = useState(null);

    const { accessToken } = useAuth();
    const { fetchAlbumTracks, loading } = useSpotifyApi(accessToken);

    useEffect(() => {
        const loadAlbumTracks = async () => {
            if (!accessToken || !selectedAlbumId) return;
            
            setError(null);
            
            try {
                const tracks = await fetchAlbumTracks(selectedAlbumId);
                setAlbumTracks(tracks || []);
            } catch (err) {
                console.error('Error fetching album tracks:', err);
                setError('Failed to load album tracks. Please try again.');
            }
        };

        loadAlbumTracks();
    }, [selectedAlbumId, accessToken, fetchAlbumTracks]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner message="Loading album tracks..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-content">
                <ErrorMessage 
                    message={error}
                    title="Failed to Load Album"
                    onRetry={() => {
                        setError(null);
                        setAlbumTracks([]);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="section-header">
                <h1 className="section-title">Album Tracks</h1>
            </div>
            <Grid container spacing={3} className="grid-cols-responsive">
                {albumTracks && albumTracks.length > 0 ? albumTracks.map((track, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={track.id || index}>
                        <MediaCard
                            id={track.id || `track-${index}`}
                            title={track.name || 'Unknown Track'}
                            subtitle={track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
                            imageUrl={null} // Album tracks don't have individual images
                            imageAlt={`${track.name || 'Track'} cover`}
                            type="track"
                        />
                    </Grid>
                )) : (
                    <Grid item xs={12}>
                        <div className="text-center p-4">
                            <Typography variant="body1">
                                No tracks available in this album.
                            </Typography>
                        </div>
                    </Grid>
                )}
            </Grid>
        </div>
    );
}

export default AlbumDetails;
