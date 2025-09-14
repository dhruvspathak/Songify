import './AfterLogin.css';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth, useSpotifyApi } from '../../../hooks';
import { LoadingSpinner, ErrorMessage, MediaCard } from '../../../components/ui';

const AfterLogin = () => {
    const [playlists, setPlaylists] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    const { accessToken } = useAuth();
    const { 
        fetchPlaylists, 
        fetchTopTracks, 
        fetchFeaturedPlaylists, 
        loading 
    } = useSpotifyApi(accessToken);

    useEffect(() => {
        const loadPlaylists = async () => {
            if (!accessToken) return;
            
            setError(null);
            
            try {
                // Try user playlists first
                let playlistData = await fetchPlaylists(20);
                
                // If no playlists, try top tracks as alternative
                if (!playlistData || playlistData.length === 0) {
                    const topTracks = await fetchTopTracks('short_term', 10);
                    if (topTracks && topTracks.length > 0) {
                        playlistData = topTracks.map(track => ({
                            id: `top-track-${track.id}`,
                            name: `🎵 ${track.name}`,
                            images: track.album.images,
                            description: `By ${track.artists.map(a => a.name).join(', ')}`,
                            type: 'track'
                        }));
                    }
                }
                
                // If still no data, try featured playlists
                if (!playlistData || playlistData.length === 0) {
                    playlistData = await fetchFeaturedPlaylists(20);
                }
                
                // Set playlists or fallback to demo content
                if (playlistData && playlistData.length > 0) {
                    setPlaylists(playlistData);
                } else {
                    setPlaylists([
                        {
                            id: 'demo1',
                            name: '🚧 Development Mode Active',
                            images: [{ url: 'https://via.placeholder.com/300x300/ff9800/ffffff?text=Dev+Mode' }],
                            description: 'Add yourself as test user in Spotify Developer Dashboard'
                        },
                        {
                            id: 'demo2',
                            name: '🔑 Premium Required',
                            images: [{ url: 'https://via.placeholder.com/300x300/4caf50/ffffff?text=Premium' }],
                            description: 'Some features require Spotify Premium account'
                        },
                        {
                            id: 'demo3',
                            name: '📱 Sample Playlist',
                            images: [{ url: 'https://via.placeholder.com/300x300/2196f3/ffffff?text=Sample' }],
                            description: 'This is how your playlists will appear'
                        }
                    ]);
                }
            } catch (err) {
                console.error('Error loading playlists:', err);
                setError('Failed to load playlists. Please try again.');
                setPlaylists([]);
            }
        };

        loadPlaylists();
    }, [accessToken, fetchPlaylists, fetchTopTracks, fetchFeaturedPlaylists]);

    const handlePlaylistClick = (playlistId) => {
        navigate('/playlist', { state: { selectedPlaylistId: playlistId } });
    };

    const retryLoad = () => {
        setError(null);
        // Trigger reload by changing a dependency
        setPlaylists([]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner message="Loading playlists..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-content">
                <ErrorMessage 
                    message={error}
                    title="Failed to Load Playlists"
                    onRetry={retryLoad}
                />
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="section-header">
                <h1 className="section-title">ENJOY THE TOP PLAYLISTS</h1>
            </div>
            <Grid container spacing={3} className="grid-cols-responsive">
                {playlists && playlists.length > 0 ? playlists.map((playlist, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={playlist.id || index}>
                        <MediaCard
                            id={playlist.id}
                            title={playlist.name}
                            subtitle={playlist.description}
                            imageUrl={playlist.images?.[0]?.url}
                            imageAlt={`${playlist.name} cover`}
                            onClick={handlePlaylistClick}
                            type="playlist"
                        />
                    </Grid>
                )) : (
                    <Grid item xs={12}>
                        <div className="text-center p-4">
                            <Typography variant="body1">
                                No playlists available. Please check your Spotify permissions or try refreshing the page.
                            </Typography>
                        </div>
                    </Grid>
                )}
            </Grid>
        </div>
    );
}

export default AfterLogin;

