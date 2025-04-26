import { Typography, Container, Paper, Grid } from '@mui/material';
import { Movie, Audiotrack, Settings } from '@mui/icons-material';

export default function Home() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Welcome to StreamAll
      </Typography>
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid 
          sx={{ display: 'flex', flex: 1 }}
        >
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center', width: '100%' }}>
            <Movie sx={{ fontSize: 40, mb: 2 }} color="primary" />
            <Typography variant="h6" gutterBottom>
              Video Streaming
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Stream your favorite movies and series in high quality
            </Typography>
          </Paper>
        </Grid>
        <Grid 
          sx={{ display: 'flex', flex: 1 }}
        >
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center', width: '100%' }}>
            <Audiotrack sx={{ fontSize: 40, mb: 2 }} color="primary" />
            <Typography variant="h6" gutterBottom>
              Audio Library
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Access your music collection from anywhere
            </Typography>
          </Paper>
        </Grid>
        <Grid 
          sx={{ display: 'flex', flex: 1 }}
        >
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center', width: '100%' }}>
            <Settings sx={{ fontSize: 40, mb: 2 }} color="primary" />
            <Typography variant="h6" gutterBottom>
              Personalization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customize your streaming experience
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}