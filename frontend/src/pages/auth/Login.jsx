import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';

// ================================|| JWT - LOGIN ||================================ //
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/login', {
        email,
        password,
      });

      if (response.data.user) {
        localStorage.setItem('token', response.data.token || '');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        navigate('/dashboard/default');
      }
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login failed:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Login</Typography>
            <Typography component={Link} to={'/register'} variant="body1" sx={{ textDecoration: 'none' }} color="primary">
              Don&apos;t have an account?
            </Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <form onSubmit={handleLogin}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" fullWidth disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Stack>
          </form>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}