// src/components/Navbar.tsx
import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const auth = useContext(AuthContext);
  console.log(auth);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();

  if (!auth) {
    // (in theory this should never happen, because you wrap in <AuthProvider> above)
    return null;
  }

  const { user, logout } = auth;

  const handleLogout = () => {
    logout();
    // (AuthProvider.logout already calls navigate('/login'), but if you
    // want to force a redirect, you could also do: navigate('/') )
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          MyBlog
        </Typography>

        {user ? (
          <Box>
            <Button color="inherit" component={Link} to="/posts/new">
              New Post
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
