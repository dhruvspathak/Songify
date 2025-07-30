import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AlbumPage = () => {
  const accessToken = sessionStorage.getItem('access_token');
  const [album, setAlbum] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate('/');
    }
  }, [accessToken, navigate]);

  const handleAlbumClick = (albumId) => {
    setSelectedAlbumId(albumId);
    navigate(`/album/${albumId}`);
  };

  return (
    <div>
      <h1>Album Page</h1>
      {/* Render album details here */}
    </div>
  );
};

export default AlbumPage;
