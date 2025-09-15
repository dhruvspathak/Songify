import { List, ListItem, ListItemText, ListItemIcon, IconButton, Tooltip, Typography } from '@mui/material';
import ArtTrackIcon from '@mui/icons-material/ArtTrack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AlbumIcon from '@mui/icons-material/Album';
import { MusicPlayer } from '../player';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useMusicPlayingState } from '../../hooks';
import { useSidebarState } from '../layout';
import songifyLogo from '../../assets/songify-logo.jpg';

const Sidebar = ({ trackId }) => {
    // Use local state as fallback if context is not available
    const [localIsCollapsed, setLocalIsCollapsed] = useState(false);
    
    let isCollapsed, setIsCollapsed;
    
    try {
        const sidebarState = useSidebarState();
        isCollapsed = sidebarState.isCollapsed;
        setIsCollapsed = sidebarState.setIsCollapsed;
    } catch (error) {
        // Fallback to local state if context is not available
        isCollapsed = localIsCollapsed;
        setIsCollapsed = setLocalIsCollapsed;
    }

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
            <div className="sidebar__header">
                <div className="sidebar__branding">
                    <Tooltip title={isCollapsed ? 'Songify Home' : ''} placement="right">
                        <Link to='/' className='sidebar__logo-link'>
                            <img 
                                src={songifyLogo} 
                                alt="Songify Logo" 
                                className='sidebar__logo'
                            />
                            {!isCollapsed && (
                                <Typography variant='h6' className='sidebar__brand-text'>
                                    SONGIFY
                                </Typography>
                            )}
                        </Link>
                    </Tooltip>
                </div>
                <IconButton 
                    onClick={toggleSidebar}
                    className="sidebar__toggle-btn"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </div>
            
            <List className='sidebar__items'>
                <Tooltip title={isCollapsed ? 'ALBUMS' : ''} placement="right">
                    <ListItem component={Link} to='/album' className='sidebar__item'>
                        <ListItemIcon className='sidebar__icon'>
                            <ArtTrackIcon />
                        </ListItemIcon>
                        {!isCollapsed && <ListItemText primary='ALBUMS' className='sidebar__text' />}
                    </ListItem>
                </Tooltip>
                
                <Tooltip title={isCollapsed ? 'TOP CHARTS' : ''} placement="right">
                    <ListItem component={Link} to='/' className='sidebar__item'>
                        <ListItemIcon className='sidebar__icon'>
                            <TrendingUpIcon />
                        </ListItemIcon>
                        {!isCollapsed && <ListItemText primary='TOP CHARTS' className='sidebar__text' />}
                    </ListItem>
                </Tooltip>
            </List>
            
            <div className="sidebar__player-section">
                {isCollapsed ? (
                    <MusicPlayerIcon trackId={trackId} />
                ) : (
                    <MusicPlayer trackId={trackId} />
                )}
            </div>
        </div>
    );
};

// Simplified music player icon component for collapsed state
const MusicPlayerIcon = ({ trackId }) => {
    const { isPlaying, hasTrack } = useMusicPlayingState();
    
    // Determine the disk state and styling
    const getDiskClass = () => {
        let baseClass = "sidebar__music-disk";
        if (isPlaying) {
            baseClass += " sidebar__music-disk--playing";
        } else if (hasTrack) {
            baseClass += " sidebar__music-disk--paused";
        }
        return baseClass;
    };

    const getTooltipText = () => {
        if (isPlaying) return "Music Playing";
        if (hasTrack) return "Music Paused";
        return "Music Player";
    };

    return (
        <div className="sidebar__music-icon">
            <Tooltip title={getTooltipText()} placement="right">
                <IconButton className={getDiskClass()}>
                    <AlbumIcon />
                </IconButton>
            </Tooltip>
        </div>
    );
};

Sidebar.propTypes = {
    trackId: PropTypes.string,
};

MusicPlayerIcon.propTypes = {
    trackId: PropTypes.string,
};

export default Sidebar;