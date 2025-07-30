import { useState } from 'react';
import PropTypes from 'prop-types';

const AppbarActual = ({ handleLogin, setTrackId }) => {
  const [songResults, setSongResults] = useState([]);
  const [albumResults, setAlbumResults] = useState([]);
  const [artistResults, setArtistResults] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const accessToken = sessionStorage.getItem('access_token');

  return (
    <div className='appbar'>
      {/* Appbar content */}
    </div>
  );
};

AppbarActual.propTypes = {
  handleLogin: PropTypes.func.isRequired,
  setTrackId: PropTypes.func.isRequired,
};

export default AppbarActual;
