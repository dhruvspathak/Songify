/**
 * Reusable Media Card Component for albums, playlists, tracks, etc.
 */

import PropTypes from 'prop-types';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import './MediaCard.css';

const MediaCard = ({
  id,
  title,
  subtitle,
  imageUrl,
  imageAlt = 'Media cover',
  onClick,
  className = '',
  imageHeight = 100,
  type = 'default'
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const fallbackImage = `https://via.placeholder.com/300x300/1db954/ffffff?text=${type === 'track' ? 'Track' : type === 'album' ? 'Album' : 'Playlist'}`;

  return (
    <div 
      className={`media-card ${className}`}
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Card className="media-card__card">
        <CardMedia
          component="img"
          height={imageHeight}
          image={imageUrl || fallbackImage}
          alt={imageAlt}
          className="media-card__image"
        />
        <CardContent className="media-card__content">
          <Typography 
            variant="body1" 
            component="h3" 
            className="media-card__title"
            title={title}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body2" 
              color="textSecondary" 
              component="p"
              className="media-card__subtitle"
              title={subtitle}
            >
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

MediaCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  imageUrl: PropTypes.string,
  imageAlt: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  imageHeight: PropTypes.number,
  type: PropTypes.oneOf(['album', 'playlist', 'track', 'artist', 'default']),
};

export default MediaCard;
