import React, { useState, useContext } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {AuthContext} from '@/contexts/AuthContext';

const LoginPage: React.FC = () => {
  const auth = useContext(AuthContext)!;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.login(email, password);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: 8 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ marginTop: 2 }}>
        <TextField
          label="Email"
          fullWidth
          required
          type="email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          fullWidth
          required
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" variant="contained" fullWidth sx={{ marginTop: 2 }}>
          Login
        </Button>
      </Box>

      <Typography variant="body2" sx={{ marginTop: 2 }}>
        Don’t have an account? <Link to="/register">Register</Link>
      </Typography>
    </Container>
  );
};

export default LoginPage;
