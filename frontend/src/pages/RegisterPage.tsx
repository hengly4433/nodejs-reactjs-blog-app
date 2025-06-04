/* eslint-disable @typescript-eslint/no-explicit-any */
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

const RegisterPage: React.FC = () => {
  const auth = useContext(AuthContext)!;
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.register(username, email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: 8 }}>
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ marginTop: 2 }}>
        <TextField
          label="Username"
          fullWidth
          required
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
          Register
        </Button>
      </Box>

      <Typography variant="body2" sx={{ marginTop: 2 }}>
        Already have an account? <Link to="/login">Login</Link>
      </Typography>
    </Container>
  );
};

export default RegisterPage;
