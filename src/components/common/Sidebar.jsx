import { List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import PropTypes from 'prop-types';

const Sidebar = ({ trackId }) => {
  return (
    <div className='sidebar'>
      <List className='sidebarItems'>
        <ListItem component='a' href='/album'>
          <ListItemIcon className='icon'>
            {/* Icon */}
          </ListItemIcon>
          <ListItemText primary='ALBUM' className='text' />
        </ListItem>
        <br />
        <ListItem component='a' href='/'>
          <ListItemIcon className='icon'>
            {/* Icon */}
          </ListItemIcon>
          <ListItemText primary='TOP CHARTS' className='text' />
        </ListItem>
      </List>
      <br />
      {/* MusicPlayerSlider component */}
    </div>
  );
};

Sidebar.propTypes = {
  trackId: PropTypes.string.isRequired,
};

export default Sidebar;
