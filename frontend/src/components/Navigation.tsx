import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Movie,
  MusicNote,
  CloudDownload,
  Settings,
  Lock,
  RssFeed,
  Notifications,
  QuestionAnswer
} from '@mui/icons-material';
import { logout } from '../features/auth/authSlice';
import type { RootState } from '../store/store';

export default function Navigation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const drawerItems = [
    { text: 'Media Library', icon: <Movie />, path: '/media' },
    { text: 'Music', icon: <MusicNote />, path: '/media?type=audio' },
    { text: 'Downloads', icon: <CloudDownload />, path: '/downloads' },
    { text: 'Requests', icon: <QuestionAnswer />, path: '/requests' },
    ...(user?.role === 'admin' ? [
      { text: 'Personal Vault', icon: <Lock />, path: '/vault' },
      { text: 'RSS Feeds', icon: <RssFeed />, path: '/rss' },
    ] : []),
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            StreamAll
          </Typography>
          <Box>
            <IconButton color="inherit" onClick={handleNotificationsClick}>
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => toggleDrawer(false)}
        >
          <List>
            {drawerItems.map((item, index) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        onClick={handleNotificationsClose}
      >
        <MenuItem onClick={() => navigate('/notifications')}>
          View All Notifications
        </MenuItem>
      </Menu>
    </>
  );
}