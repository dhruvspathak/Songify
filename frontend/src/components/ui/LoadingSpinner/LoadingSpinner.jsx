/**
 * Reusable Loading Spinner Component
 */

import PropTypes from 'prop-types';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  className = '',
  showMessage = true 
}) => {
  const sizeClass = `loading-spinner--${size}`;
  
  return (
    <div className={`loading-spinner ${className}`}>
      <div className={`loading-spinner__circle ${sizeClass}`}></div>
      {showMessage && (
        <div className="loading-spinner__message">{message}</div>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  message: PropTypes.string,
  className: PropTypes.string,
  showMessage: PropTypes.bool,
};

export default LoadingSpinner;
