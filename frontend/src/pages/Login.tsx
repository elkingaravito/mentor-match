import { Box, Button, TextField, Typography, Paper, Alert, Link, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/feedback/Toast';
import { loginSchema } from '../validations/auth';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        // Simulamos un delay para mostrar el loading state
        await new Promise(resolve => setTimeout(resolve, 1000));

        // En un entorno real, esto sería una llamada a la API
        const mockToken = 'mock-jwt-token';
        const mockUser = {
          id: 1,
          name: 'Test User',
          email: values.email,
          role: 'mentor'
        };

        login(mockToken, mockUser);
        showToast('Welcome back!', 'success');
      } catch (err) {
        const errorMessage = 'Failed to login. Please check your credentials.';
        setStatus(errorMessage);
        showToast(errorMessage, 'error');
        console.error('Login error:', err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Login to Mentor Match
        </Typography>
        
        {formik.status && (
          <Alert severity="error" sx={{ mb: 2 }}>{formik.status}</Alert>
        )}
        {formik.isSubmitting && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            margin="normal"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            margin="normal"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register">
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
