/**
 * Custom hook for music player state management
 * Provides shared state between MusicPlayer component and sidebar icon
 */

import { useState, useEffect, createContext, useContext } from 'react';

// Create context for music player state
const MusicPlayerContext = createContext();

export const useMusicPlayerState = () => {
    const context = useContext(MusicPlayerContext);
    if (!context) {
        throw new Error('useMusicPlayerState must be used within a MusicPlayerProvider');
    }
    return context;
};

export const MusicPlayerProvider = ({ children }) => {
    const [isPaused, setPaused] = useState(true);
    const [isActive, setActive] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);

    const value = {
        isPaused,
        setPaused,
        isActive,
        setActive,
        currentTrack,
        setCurrentTrack,
        isPlaying: !isPaused && isActive && currentTrack
    };

    return (
        <MusicPlayerContext.Provider value={value}>
            {children}
        </MusicPlayerContext.Provider>
    );
};

// Simple hook for components that just need to know if music is playing
export const useMusicPlayingState = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasTrack, setHasTrack] = useState(false);

    // Listen for music state changes via custom events
    useEffect(() => {
        const handleMusicStateChange = (event) => {
            const { isPaused, isActive, hasTrack: trackExists } = event.detail;
            setIsPlaying(!isPaused && isActive);
            setHasTrack(trackExists);
        };

        window.addEventListener('musicStateChange', handleMusicStateChange);
        
        return () => {
            window.removeEventListener('musicStateChange', handleMusicStateChange);
        };
    }, []);

    return { isPlaying, hasTrack };
};
