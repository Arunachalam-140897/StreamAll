import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { store } from './store/store';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './features/auth/Login';
import MediaList from './features/media/MediaList';
import Home from './features/home/Home';
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
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <Home />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/media"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <MediaList />
                  </>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
