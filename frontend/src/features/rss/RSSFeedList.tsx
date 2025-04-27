import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { fetchFeeds, addFeed, deleteFeed, fetchFeedItems } from './rssSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { formatDistanceToNow } from 'date-fns';

export default function RSSFeedList() {
  const dispatch = useDispatch<AppDispatch>();
  const { feeds, currentFeedItems, isLoading, error } = useSelector(
    (state: RootState) => state.rss
  );
  const [openAdd, setOpenAdd] = useState(false);
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchFeeds());
  }, [dispatch]);

  useEffect(() => {
    if (selectedFeed) {
      dispatch(fetchFeedItems(selectedFeed));
    }
  }, [dispatch, selectedFeed]);

  const handleAddFeed = async () => {
    if (url && label) {
      await dispatch(addFeed({ url, label }));
      setUrl('');
      setLabel('');
      setOpenAdd(false);
    }
  };

  const handleDeleteFeed = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this feed?')) {
      await dispatch(deleteFeed(id));
      if (selectedFeed === id) {
        setSelectedFeed(null);
      }
    }
  };

  if (isLoading && !feeds.length) {
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
        <Typography variant="h4">RSS Feeds</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenAdd(true)}
        >
          Add Feed
        </Button>
      </Box>

      <Box display="flex" gap={3}>
        <Card sx={{ minWidth: 300, maxWidth: 400 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Feed Sources
            </Typography>
            <List>
              {feeds.map((feed) => (
                <ListItem
                  key={feed.id}
                  button
                  selected={selectedFeed === feed.id}
                  onClick={() => setSelectedFeed(feed.id)}
                >
                  <ListItemText
                    primary={feed.label}
                    secondary={`Last checked ${formatDistanceToNow(new Date(feed.lastChecked), { addSuffix: true })}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteFeed(feed.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {selectedFeed && (
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Latest Items
              </Typography>
              <List>
                {currentFeedItems.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <>
                          <Typography variant="body2" component="span" display="block">
                            {item.description}
                          </Typography>
                          <Typography variant="caption" component="span">
                            Published {formatDistanceToNow(new Date(item.pubDate), { addSuffix: true })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Box>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add RSS Feed</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Feed URL"
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Label"
            fullWidth
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button
            onClick={handleAddFeed}
            variant="contained"
            color="primary"
            disabled={!url || !label}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}