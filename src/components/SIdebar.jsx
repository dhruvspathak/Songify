import { List, ListItem, ListItemText, ListItemIcon } from '@mui/material'
import ArtTrackIcon from '@mui/icons-material/ArtTrack'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import MusicPlayerSlider from './Player'
import { Link } from 'react-router-dom'
import './Sidebar.css'
import PropTypes from 'prop-types'

const Sidebar = ({ trackId }) => {
    return (
        <div className='sidebar'>
            <List className='sidebarItems'>
                <ListItem component={Link} to='/album'>
                    <ListItemIcon className='icon'><ArtTrackIcon /></ListItemIcon>
                    <ListItemText primary='ALBUM' className='text' />
                </ListItem>
                <br></br>
                <ListItem component={Link} to='/'>
                    <ListItemIcon className='icon'><TrendingUpIcon /></ListItemIcon>
                    <ListItemText primary='TOP CHARTS' className='text' />
                </ListItem>
            </List>
            <br></br>
            <MusicPlayerSlider trackId={trackId} />
        </div>
    )
}

Sidebar.propTypes = {
    trackId: PropTypes.string.isRequired,
}

export default Sidebar
