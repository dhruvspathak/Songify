import PropTypes from 'prop-types';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { Typography, MenuItem, Menu, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import './AppBar.css';
import { useAuth, useSpotifyApi } from '../../hooks';
import { REQUEST_CONFIG } from '../../constants';

const AppBarComponent = ({ handleLogin, setTrackId, isAuthenticated, sidebarCollapsed }) => {
    const [songResults, setSongResults] = useState([]);
    const [albumResults, setAlbumResults] = useState([]);
    const [artistResults, setArtistResults] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    
    const { accessToken } = useAuth();
    const { search } = useSpotifyApi(accessToken);

    const Search = styled('div')(({ theme }) => ({
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: 'auto',
        },
    }))

    const SearchIconWrapper = styled('div')(({ theme }) => ({
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }))

    const StyledInputBase = styled(InputBase)(({ theme }) => ({
        color: 'inherit',
        width: '100%',
        '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create('width'),
            [theme.breakpoints.up('sm')]: {
                width: '36ch',
            },
        },
    }))

    const searchFunction = useCallback(async (searchQuery) => {
        if (!searchQuery) {
            clearResults();
            return;
        }

        try {
            const searchResults = await search(
                searchQuery, 
                ['track', 'album', 'artist'], 
                REQUEST_CONFIG.SEARCH_LIMIT
            );

            if (searchResults) {
                setSongResults(searchResults.tracks?.items || []);
                setAlbumResults(searchResults.albums?.items || []);
                setArtistResults(searchResults.artists?.items || []);
                setAnchorEl(document.getElementById('search-bar'));
            } else {
                clearResults();
            }
        } catch (err) {
            console.error('Error fetching search results:', err);
            clearResults();
        }
    }, [search]);

    const clearResults = () => {
        setSongResults([]);
        setAlbumResults([]);
        setArtistResults([]);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            searchFunction(event.target.value);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSearchClick = () => {
        if (!accessToken) {
            alert('Log in to search.');
        }
    };

    const handleSongClick = (trackId) => {
        setTrackId(trackId);
        handleClose();
    };

    const getAppBarClass = () => {
        let baseClass = 'appbar';
        if (!isAuthenticated) {
            baseClass += ' appbar--no-sidebar';
        } else if (sidebarCollapsed) {
            baseClass += ' appbar--sidebar-collapsed';
        }
        return baseClass;
    };

    return (
        <Box>
            <AppBar position='fixed' className={getAppBarClass()}>
                <Toolbar className='appbar__toolbar'>
                    <div className='appbar__spacer'></div>
                    <Box className='appbar__actions'>
                        <Tooltip title={!accessToken ? 'Log in to search' : ''}>
                            <Search>
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    id='search-bar'
                                    placeholder='find your groove...'
                                    inputProps={{ 'aria-label': 'search' }}
                                    onKeyDown={handleKeyDown}
                                    onClick={handleSearchClick}
                                    disabled={!accessToken}
                                />
                            </Search>
                        </Tooltip>
                        <Button className='appbar__login-btn' onClick={handleLogin}>
                            Login
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                className="appbar__search-menu"
                PaperProps={{
                    className: 'appbar__search-dropdown',
                    style: {
                        width: document.getElementById('search-bar') ? document.getElementById('search-bar').clientWidth : 'auto',
                        marginTop: '8px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        minWidth: '300px',
                    },
                }}
            >
                {songResults.length > 0 && (
                    <>
                        <MenuItem disabled>SONGS</MenuItem>
                        {songResults.map((result, index) => (
                            <MenuItem
                                key={index}
                                onClick={() => handleSongClick(result.id)}
                            >
                                {result.name}
                            </MenuItem>
                        ))}
                    </>
                )}
                {albumResults.length > 0 && (
                    <>
                        <MenuItem disabled>ALBUMS</MenuItem>
                        {albumResults.map((result, index) => (
                            <MenuItem key={index} component="a" href={result.external_urls.spotify} target='_blank' rel="noopener noreferrer" onClick={handleClose}>
                                {result.name}
                            </MenuItem>
                        ))}
                    </>
                )}
                {artistResults.length > 0 && (
                    <>
                        <MenuItem disabled>ARTISTS</MenuItem>
                        {artistResults.map((result, index) => (
                            <MenuItem key={index} component="a" href={result.external_urls.spotify} target='_blank' rel="noopener noreferrer" onClick={handleClose}>
                                {result.name}
                            </MenuItem>
                        ))}
                    </>
                )}
            </Menu>
        </Box>
    )
}

AppBarComponent.propTypes = {
    handleLogin: PropTypes.func.isRequired,
    setTrackId: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool,
    sidebarCollapsed: PropTypes.bool,
};

export default AppBarComponent;
