import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Paper,
  Pagination
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { fetchNotifications, markAsRead, markAllAsRead } from './notificationsSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationList() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error, currentPage, totalPages, unreadCount } = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(fetchNotifications({ page, limit: 10 }));
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Notifications</Typography>
        {unreadCount > 0 && (
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      <Paper elevation={2}>
        <List>
          {items.map((notification) => (
            <ListItem
              key={notification.id}
              secondaryAction={
                !notification.read && (
                  <IconButton 
                    edge="end" 
                    aria-label="mark as read"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <CheckIcon />
                  </IconButton>
                )
              }
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              <ListItemText
                primary={notification.title}
                secondary={
                  <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" component="span">
                      {notification.message}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      component="span"
                      sx={{ mt: 1 }}
                    >
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
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