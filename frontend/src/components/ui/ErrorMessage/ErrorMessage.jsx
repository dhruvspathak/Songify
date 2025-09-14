/**
 * Reusable Error Message Component
 */

import PropTypes from 'prop-types';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  message, 
  title = 'Error', 
  type = 'error',
  className = '',
  onRetry = null,
  retryText = 'Try Again'
}) => {
  const typeClass = `error-message--${type}`;
  
  return (
    <div className={`error-message ${typeClass} ${className}`}>
      <div className="error-message__content">
        <h3 className="error-message__title">{title}</h3>
        <p className="error-message__text">{message}</p>
        {onRetry && (
          <button 
            className="error-message__retry-btn"
            onClick={onRetry}
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
  type: PropTypes.oneOf(['error', 'warning', 'info']),
  className: PropTypes.string,
  onRetry: PropTypes.func,
  retryText: PropTypes.string,
};

export default ErrorMessage;
