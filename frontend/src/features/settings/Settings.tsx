import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Grid
} from '@mui/material';
import { fetchPreferences, updatePreferences } from './preferencesSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { UserPreferences } from '../../types/preferences';

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const { preferences, isLoading, error } = useSelector(
    (state: RootState) => state.preferences
  );

  useEffect(() => {
    dispatch(fetchPreferences());
  }, [dispatch]);

  const handlePreferenceChange = (
    key: keyof UserPreferences | string,
    value: any,
    nestedKey?: string
  ) => {
    const updateData = nestedKey
      ? { [key]: { ...preferences?.[key as keyof UserPreferences], [nestedKey]: value } }
      : { [key]: value };

    dispatch(updatePreferences(updateData));
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
      <Typography variant="h4" gutterBottom>Settings</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Streaming</Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Quality</InputLabel>
                <Select
                  value={preferences?.streamingQuality || 'auto'}
                  label="Quality"
                  onChange={(e) => handlePreferenceChange('streamingQuality', e.target.value)}
                >
                  <MenuItem value="auto">Auto</MenuItem>
                  <MenuItem value="1080p">1080p</MenuItem>
                  <MenuItem value="720p">720p</MenuItem>
                  <MenuItem value="480p">480p</MenuItem>
                  <MenuItem value="360p">360p</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Notifications</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences?.notifications.enabled}
                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked, 'enabled')}
                  />
                }
                label="Enable Notifications"
              />
              <Box mt={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences?.notifications.pushEnabled}
                      onChange={(e) => handlePreferenceChange('notifications', e.target.checked, 'pushEnabled')}
                      disabled={!preferences?.notifications.enabled}
                    />
                  }
                  label="Push Notifications"
                />
              </Box>
              <Box mt={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences?.notifications.mediaUpdates}
                      onChange={(e) => handlePreferenceChange('notifications', e.target.checked, 'mediaUpdates')}
                      disabled={!preferences?.notifications.enabled}
                    />
                  }
                  label="Media Updates"
                />
              </Box>
              <Box mt={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences?.notifications.downloadComplete}
                      onChange={(e) => handlePreferenceChange('notifications', e.target.checked, 'downloadComplete')}
                      disabled={!preferences?.notifications.enabled}
                    />
                  }
                  label="Download Completion"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Interface</Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Theme</InputLabel>
                <Select
                  value={preferences?.ui.theme || 'system'}
                  label="Theme"
                  onChange={(e) => handlePreferenceChange('ui', e.target.value, 'theme')}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>View Mode</InputLabel>
                <Select
                  value={preferences?.ui.listView || 'grid'}
                  label="View Mode"
                  onChange={(e) => handlePreferenceChange('ui', e.target.value, 'listView')}
                >
                  <MenuItem value="grid">Grid</MenuItem>
                  <MenuItem value="list">List</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences?.ui.autoplay}
                    onChange={(e) => handlePreferenceChange('ui', e.target.checked, 'autoplay')}
                  />
                }
                label="Autoplay Videos"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Downloads</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences?.offlineMode}
                    onChange={(e) => handlePreferenceChange('offlineMode', e.target.checked)}
                  />
                }
                label="Offline Mode"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Max Download Size</InputLabel>
                <Select
                  value={preferences?.maxDownloadSize || 2147483648}
                  label="Max Download Size"
                  onChange={(e) => handlePreferenceChange('maxDownloadSize', e.target.value)}
                >
                  <MenuItem value={1073741824}>1 GB</MenuItem>
                  <MenuItem value={2147483648}>2 GB</MenuItem>
                  <MenuItem value={5368709120}>5 GB</MenuItem>
                  <MenuItem value={10737418240}>10 GB</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}