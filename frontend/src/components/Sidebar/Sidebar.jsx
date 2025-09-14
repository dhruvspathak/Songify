import { List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import ArtTrackIcon from '@mui/icons-material/ArtTrack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { MusicPlayer } from '../player';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import PropTypes from 'prop-types';

const Sidebar = ({ trackId }) => {
    return (
        <div className='sidebar'>
            <List className='sidebar__items'>
                <ListItem component={Link} to='/album' className='sidebar__item'>
                    <ListItemIcon className='sidebar__icon'>
                        <ArtTrackIcon />
                    </ListItemIcon>
                    <ListItemText primary='ALBUMS' className='sidebar__text' />
                </ListItem>
                <ListItem component={Link} to='/' className='sidebar__item'>
                    <ListItemIcon className='sidebar__icon'>
                        <TrendingUpIcon />
                    </ListItemIcon>
                    <ListItemText primary='TOP CHARTS' className='sidebar__text' />
                </ListItem>
            </List>
            <MusicPlayer trackId={trackId} />
        </div>
    );
};

Sidebar.propTypes = {
    trackId: PropTypes.string,
};

export default Sidebar;