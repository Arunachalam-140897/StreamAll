import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Pagination,
  Chip
} from '@mui/material';
import { fetchRequests, createRequest, updateRequestStatus } from './requestSlice';
import type { AppDispatch, RootState } from '../../store/store';

export default function RequestList() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error, currentPage, totalPages } = useSelector(
    (state: RootState) => state.requests
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(false);
  const [newRequest, setNewRequest] = useState('');
  const [responseDialog, setResponseDialog] = useState({ open: false, id: '', status: '' });
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    dispatch(fetchRequests({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handleCreateRequest = async () => {
    if (newRequest.trim()) {
      await dispatch(createRequest(newRequest));
      setNewRequest('');
      setOpen(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (responseDialog.id && responseDialog.status) {
      await dispatch(updateRequestStatus({
        id: responseDialog.id,
        status: responseDialog.status,
        adminResponse: adminResponse
      }));
      setResponseDialog({ open: false, id: '', status: '' });
      setAdminResponse('');
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(fetchRequests({ page, limit: 10 }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'fulfilled': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
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
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box m={4}>
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Typography variant="h4">Media Requests</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          New Request
        </Button>
      </Box>

      {items.map((request) => (
        <Card key={request.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{request.request}</Typography>
              <Chip 
                label={request.status} 
                color={getStatusColor(request.status)}
                variant="outlined" 
              />
            </Box>
            {request.adminResponse && (
              <Typography color="text.secondary" mt={1}>
                Admin Response: {request.adminResponse}
              </Typography>
            )}
            {user?.role === 'admin' && request.status === 'pending' && (
              <Box mt={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setResponseDialog({
                    open: true,
                    id: request.id,
                    status: 'approved'
                  })}
                  sx={{ mr: 1 }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setResponseDialog({
                    open: true,
                    id: request.id,
                    status: 'rejected'
                  })}
                >
                  Reject
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

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

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>New Media Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Request Details"
            fullWidth
            multiline
            rows={4}
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRequest} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={responseDialog.open} 
        onClose={() => setResponseDialog({ open: false, id: '', status: '' })}
      >
        <DialogTitle>
          {responseDialog.status === 'approved' ? 'Approve' : 'Reject'} Request
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Response Message"
            fullWidth
            multiline
            rows={4}
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setResponseDialog({ open: false, id: '', status: '' })}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained" 
            color={responseDialog.status === 'approved' ? 'primary' : 'error'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}