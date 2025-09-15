import PropTypes from 'prop-types';
import { AppBar, Sidebar } from '../';
import { Outlet } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import { useAuth } from '../../hooks';

// Context for sidebar state
const SidebarContext = createContext();

export const useSidebarState = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebarState must be used within Layout');
    }
    return context;
};

const Layout = ({ handleLogin }) => {
    const [trackId, setTrackId] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isAuthenticated } = useAuth();

    const sidebarContextValue = {
        isCollapsed,
        setIsCollapsed
    };

    const getMainContentClass = () => {
        if (!isAuthenticated) return 'main-content main-content--no-sidebar';
        if (isCollapsed) return 'main-content main-content--sidebar-collapsed';
        return 'main-content';
    };

    return (
        <SidebarContext.Provider value={sidebarContextValue}>
            <div>
                <AppBar 
                    handleLogin={handleLogin} 
                    setTrackId={setTrackId}
                    isAuthenticated={isAuthenticated}
                    sidebarCollapsed={isCollapsed}
                />
                {isAuthenticated && <Sidebar trackId={trackId} />}
                <div className={getMainContentClass()}>
                    <Outlet />
                </div>
            </div>
        </SidebarContext.Provider>
    );
};

Layout.propTypes = {
    handleLogin: PropTypes.func.isRequired,
};

export default Layout;
