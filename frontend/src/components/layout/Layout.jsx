import PropTypes from 'prop-types';
import { AppBar, Sidebar } from '../';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';

const Layout = ({ handleLogin }) => {
    const [trackId, setTrackId] = useState('');

    return (
        <div>
            <AppBar handleLogin={handleLogin} setTrackId={setTrackId} />
            <Sidebar trackId={trackId} />
            <div className='main-content'>
                <Outlet />
            </div>
        </div>
    );
};

Layout.propTypes = {
    handleLogin: PropTypes.func.isRequired,
};

export default Layout;
