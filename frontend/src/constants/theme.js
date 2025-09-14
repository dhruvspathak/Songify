/**
 * Theme Constants and CSS Variables
 */

// Color palette
export const COLORS = {
  // Primary colors
  PRIMARY: '#1db954', // Spotify green
  PRIMARY_HOVER: '#1ed760',
  PRIMARY_DARK: '#1aa34a',
  
  // Background colors
  BACKGROUND_PRIMARY: '#000000',
  BACKGROUND_SECONDARY: '#1c1c1c',
  BACKGROUND_TERTIARY: '#2a2a2a',
  
  // Text colors
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: '#b3b3b3',
  TEXT_MUTED: '#808080',
  
  // Status colors
  SUCCESS: '#4caf50',
  ERROR: '#f44336',
  WARNING: '#ff9800',
  INFO: '#2196f3',
  
  // Neutral colors
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY_LIGHT: '#f5f5f5',
  GRAY_MEDIUM: '#9e9e9e',
  GRAY_DARK: '#424242',
};

// Spacing
export const SPACING = {
  XS: '0.25rem',   // 4px
  SM: '0.5rem',    // 8px
  MD: '1rem',      // 16px
  LG: '1.5rem',    // 24px
  XL: '2rem',      // 32px
  XXL: '3rem',     // 48px
  XXXL: '4rem',    // 64px
};

// Layout dimensions
export const LAYOUT = {
  SIDEBAR_WIDTH: '265px',
  APPBAR_HEIGHT: '64px',
  MAIN_CONTENT_MARGIN_LEFT: '14.5rem',
  CONTAINER_MAX_WIDTH: '1200px',
};

// Border radius
export const BORDER_RADIUS = {
  SM: '4px',
  MD: '8px',
  LG: '12px',
  XL: '16px',
  ROUND: '50%',
};

// Shadows
export const SHADOWS = {
  SM: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  MD: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  LG: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  XL: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
};

// Transitions
export const TRANSITIONS = {
  FAST: '0.15s ease',
  NORMAL: '0.3s ease',
  SLOW: '0.5s ease',
};

// Breakpoints (for responsive design)
export const BREAKPOINTS = {
  XS: '0px',
  SM: '600px',
  MD: '960px',
  LG: '1280px',
  XL: '1920px',
};

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
};
