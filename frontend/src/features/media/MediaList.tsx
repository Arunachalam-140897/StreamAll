import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box as MuiBox,
  Card, CardContent, CardMedia, Typography, Container, 
  CircularProgress, TextField, Select, MenuItem, FormControl, 
  InputLabel, Toolbar, IconButton, CardActionArea, Pagination 
} from '@mui/material';
import Box from '@mui/system/Box';
import SearchIcon from '@mui/icons-material/Search';
import { fetchMedia } from './mediaSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { Media, MediaQueryParams } from '../../types/media';

export default function MediaList() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error, currentPage, totalPages } = useSelector((state: RootState) => state.media);
  const [filters, setFilters] = useState<MediaQueryParams>({
    search: '',
    category: '',
    type: '',
    page: 1,
    limit: 12
  });

  useEffect(() => {
    dispatch(fetchMedia(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (field: keyof MediaQueryParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1
    }));
  };

  const handleMediaClick = (mediaId: string) => {
    navigate(`/media/${mediaId}`);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  if (isLoading) {
    return (
      <MuiBox display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </MuiBox>
    );
  }

  if (error) {
    return (
      <MuiBox display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </MuiBox>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Toolbar sx={{ mb: 2 }}>
        <Box display="flex" gap={2} width="100%">
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              label="Category"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="movie">Movies</MenuItem>
              <MenuItem value="series">Series</MenuItem>
              <MenuItem value="animation">Animation</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="audio">Audio</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Toolbar>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 4,
          mb: 4
        }}
      >
        {items.map((media: Media) => (
          <Card key={media.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea onClick={() => handleMediaClick(media.id)}>
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
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
}