import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  CircularProgress,
  Alert,
  Pagination,
  Grid,
} from '@mui/material';
import {
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { fetchDownloads, cancelDownload, checkDownloadStatus } from './downloadSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { formatBytes } from '../../utils/formatters';

export default function DownloadList() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error, currentPage, totalPages } = useSelector(
    (state: RootState) => state.downloads
  );

  useEffect(() => {
    dispatch(fetchDownloads({ page: currentPage, limit: 10 }));

    // Poll active downloads every 5 seconds
    const interval = setInterval(() => {
      items.forEach(item => {
        if (item.status === 'downloading' || item.status === 'pending') {
          dispatch(checkDownloadStatus(item.id));
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch, currentPage]);

  const handleCancelDownload = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this download?')) {
      await dispatch(cancelDownload(id));
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(fetchDownloads({ page, limit: 10 }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success.main';
      case 'downloading': return 'info.main';
      case 'pending': return 'warning.main';
      case 'failed':
      case 'cancelled': return 'error.main';
      default: return 'text.primary';
    }
  };

  if (isLoading && !items.length) {
    return (
      <Box display="flex" justifyContent="center" m={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box m={4}>
      <Typography variant="h4" gutterBottom>Downloads</Typography>

      <Grid container spacing={3}>
        {items.map((download) => (
          <Grid item xs={12} key={download.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {download.sourceUrl.split('/').pop()}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={getStatusColor(download.status)}
                      gutterBottom
                    >
                      Status: {download.status}
                    </Typography>
                    {download.error && (
                      <Typography color="error" variant="body2">
                        Error: {download.error}
                      </Typography>
                    )}
                  </Box>
                  {(download.status === 'downloading' || download.status === 'pending') && (
                    <IconButton
                      color="error"
                      onClick={() => handleCancelDownload(download.id)}
                    >
                      <CancelIcon />
                    </IconButton>
                  )}
                </Box>
                {(download.status === 'downloading') && (
                  <Box mt={2}>
                    <LinearProgress 
                      variant="determinate" 
                      value={download.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                      {download.progress.toFixed(1)}%
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}