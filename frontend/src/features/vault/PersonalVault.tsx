import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CloudDownload as DownloadIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { fetchVaultItems, addVaultItem, deleteVaultItem } from './vaultSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { formatDistanceToNow } from 'date-fns';
import { formatBytes } from '../../utils/formatters';

export default function PersonalVault() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error, currentPage, totalPages } = useSelector(
    (state: RootState) => state.vault
  );
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [encrypt, setEncrypt] = useState(true);

  useEffect(() => {
    dispatch(fetchVaultItems({ page: currentPage, limit: 12 }));
  }, [dispatch, currentPage]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('isEncrypted', encrypt.toString());
      formData.append('type', selectedFile.type.startsWith('video') ? 'video' : 
                            selectedFile.type.startsWith('audio') ? 'audio' : 'photo');

      await dispatch(addVaultItem(formData));
      setOpenUpload(false);
      setSelectedFile(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await dispatch(deleteVaultItem(id));
    }
  };

  const handleDownload = (item: any) => {
    window.open(`/vault/${item.id}`, '_blank');
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(fetchVaultItems({ page, limit: 12 }));
  };

  if (isLoading) {
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Personal Vault</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenUpload(true)}
        >
          Upload File
        </Button>
      </Box>

      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Typography variant="h6" noWrap sx={{ flex: 1 }}>
                    {item.metadata.originalName}
                  </Typography>
                  {item.isEncrypted && (
                    <LockIcon color="primary" sx={{ ml: 1 }} />
                  )}
                </Box>
                <Typography color="text.secondary" gutterBottom>
                  Type: {item.type}
                </Typography>
                <Typography variant="body2">
                  Size: {formatBytes(item.metadata.size)}
                </Typography>
                <Typography variant="body2">
                  Added: {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleDownload(item)}>
                  <DownloadIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(item.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
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

      <Dialog open={openUpload} onClose={() => setOpenUpload(false)}>
        <DialogTitle>Upload to Vault</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <input
              type="file"
              onChange={handleFileSelect}
              style={{ marginBottom: '1rem' }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={encrypt}
                  onChange={(e) => setEncrypt(e.target.checked)}
                />
              }
              label="Encrypt File"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            color="primary"
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}