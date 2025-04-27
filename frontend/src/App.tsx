import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline, Container } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { store } from './store/store';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './features/auth/Login';
import MediaList from './features/media/MediaList';
import Home from './features/home/Home';
import MediaDetail from './features/media/MediaDetail';
import RequestList from './features/requests/RequestList';
import NotificationList from './features/notifications/NotificationList';
import Settings from './features/settings/Settings';
import PersonalVault from './features/vault/PersonalVault';
import RSSFeedList from './features/rss/RSSFeedList';
import DownloadList from './features/downloads/DownloadList';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#ce93d8',
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navigation />
          <Container component="main">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/media" element={<ProtectedRoute><MediaList /></ProtectedRoute>} />
              <Route path="/media/:id" element={<ProtectedRoute><MediaDetail /></ProtectedRoute>} />
              <Route path="/requests" element={<ProtectedRoute><RequestList /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationList /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/downloads" element={<ProtectedRoute><DownloadList /></ProtectedRoute>} />
              <Route 
                path="/vault" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <PersonalVault />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/rss" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <RSSFeedList />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Container>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
