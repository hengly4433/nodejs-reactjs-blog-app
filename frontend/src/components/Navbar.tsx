// src/components/Navbar.tsx
import React, { useContext } from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
// 1. Import your logo file. Adjust the path as needed.
import logo from '@/assets/logo-blog.png';

const Navbar: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) return null; // AuthProvider ensures this never happens in practice

  const { user, logout } = auth;
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>

        {/* 2. Logo + title grouped in a Link */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,            // pushes buttons to the right
            textDecoration: 'none', 
            color: 'inherit',
          }}
        >
          {/* 3. Logo image with custom size */}
          <Box
            component="img"
            src={logo}
            alt="MyBlog Logo"
            sx={{
              height: 80,           // change to your desired height
              width: 100,            // change to your desired width
              mr: 2,                // spacing between logo and text
            }}
          />

          {/* 4. Title next to logo */}
          {/* <Typography variant="h6" noWrap>
            MyBlog
          </Typography> */}
        </Box>

        {/* 5. Navigation buttons */}
        {user ? (
          <Box>
            <Button color="inherit" component={Link} to="/posts/new">
              New Post
            </Button>
            <Button color="inherit" component={Link} to="/category/new">
              New Category
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
