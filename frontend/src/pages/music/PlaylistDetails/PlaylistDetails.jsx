import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Grid } from '@mui/material';
import './PlaylistDetails.css';
import { useAuth, useSpotifyApi } from '../../../hooks';
import { LoadingSpinner, ErrorMessage, MediaCard } from '../../../components/ui';

const PlaylistDetails = () => {
    const location = useLocation();
    const { selectedPlaylistId } = location.state || {};

    const [playlistItems, setPlaylistItems] = useState([]);
    const [error, setError] = useState(null);

    const { accessToken } = useAuth();
    const { fetchPlaylistTracks, loading } = useSpotifyApi(accessToken);

    useEffect(() => {
        const loadPlaylistTracks = async () => {
            if (!accessToken || !selectedPlaylistId) return;
            
            setError(null);
            
            try {
                const tracks = await fetchPlaylistTracks(selectedPlaylistId);
                setPlaylistItems(tracks || []);
            } catch (err) {
                console.error('Error fetching playlist items:', err);
                setError('Failed to load playlist tracks. Please try again.');
            }
        };

        loadPlaylistTracks();
    }, [selectedPlaylistId, accessToken, fetchPlaylistTracks]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner message="Loading playlist tracks..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-content">
                <ErrorMessage 
                    message={error}
                    title="Failed to Load Playlist"
                    onRetry={() => {
                        setError(null);
                        setPlaylistItems([]);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="section-header">
                <h1 className="section-title">Playlist Tracks</h1>
            </div>
            <Grid container spacing={3} className="grid-cols-responsive">
                {playlistItems && playlistItems.length > 0 ? playlistItems.map((item, index) => {
                    const track = item.track;
                    return (
                        <Grid key={track?.id || index}>
                            <MediaCard
                                id={track?.id || `track-${index}`}
                                title={track?.name || 'Unknown Track'}
                                subtitle={track?.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
                                imageUrl={track?.album?.images?.[0]?.url}
                                imageAlt={`${track?.name || 'Track'} cover`}
                                type="track"
                            />
                        </Grid>
                    );
                }) : (
                    <Grid>
                        <div className="text-center p-4">
                            <Typography variant="body1">
                                No tracks available in this playlist.
                            </Typography>
                        </div>
                    </Grid>
                )}
            </Grid>
        </div>
    );
}

export default PlaylistDetails;
