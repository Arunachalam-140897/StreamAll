import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, Paper, CircularProgress } from '@mui/material';
import ReactPlayer from 'react-player';
import { fetchMediaById } from './mediaSlice';
import api from '../../services/api';
import type { AppDispatch, RootState } from '../../store/store';

export default function MediaDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentItem: media, isLoading, error } = useSelector((state: RootState) => state.media);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    const loadMedia = async () => {
      if (id) {
        try {
          await dispatch(fetchMediaById(id)).unwrap();
          const streamRes = await api.get(`/media/${id}/stream`);
          setStreamUrl(streamRes.data.streamUrl);
        } catch (err) {
          setStreamError(err instanceof Error ? err.message : 'Failed to load stream');
        }
      }
    };

    loadMedia();
  }, [id, dispatch]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || streamError || !media) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error || streamError || 'Media not found'}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {media.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {media.category} • {media.type}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {media.genre.join(', ')}
        </Typography>
        {media.metadata && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Duration: {Math.floor(media.metadata.duration / 60)}m {Math.floor(media.metadata.duration % 60)}s
            </Typography>
            {media.metadata.width && media.metadata.height && (
              <Typography variant="body2" color="text.secondary">
                Resolution: {media.metadata.width}x{media.metadata.height}
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      <Paper elevation={2} sx={{ bgcolor: 'black', overflow: 'hidden' }}>
        <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
          <ReactPlayer
            url={streamUrl}
            controls
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
            config={{
              file: {
                forceHLS: media.type === 'video',
                attributes: {
                  crossOrigin: 'anonymous'
                }
              }
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
}