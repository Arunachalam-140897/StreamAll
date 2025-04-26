import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Card, CardContent, CardMedia, Typography, Container, Box, CircularProgress } from '@mui/material';
import { fetchMedia } from './mediaSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { Media } from '../../types/media';

export default function MediaList() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error } = useSelector((state: RootState) => state.media as {
    items: Media[];
    isLoading: boolean;
    error: string | null;
  });

  useEffect(() => {
    dispatch(fetchMedia({}));
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {items.map((media: Media) => (
          <Grid 
            key={media.id}
            sx={{
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                sx={{
                  height: 140,
                  objectFit: 'cover',
                }}
                image={media.thumbnail || '/default-thumbnail.jpg'}
                alt={media.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {media.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {media.category} • {media.type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {media.genre.join(', ')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}