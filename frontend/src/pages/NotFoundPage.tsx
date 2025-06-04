import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Container sx={{ marginTop: 8, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        404 – Page Not Found
      </Typography>
      <Button variant="contained" component={Link} to="/">
        Go Home
      </Button>
    </Container>
  );
};

export default NotFoundPage;
