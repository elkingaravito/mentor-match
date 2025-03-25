import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { AuthResponse } from '../types/api';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material';
import { useToast } from '../components/feedback/Toast';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const validationSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name should be at least 2 characters'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password should be at least 8 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup
    .string()
    .oneOf(['mentor', 'mentee'], 'Please select a valid role')
    .required('Please select a role'),
});

const Register = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'mentee',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      try {
        setError('');
        
        // Validate passwords match
        if (values.password !== values.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // TODO: Replace with actual API call when backend is ready
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful registration response
        const response: AuthResponse = {
          success: true,
          message: 'Registration successful',
          data: {
            token: 'mock-jwt-token',
            user: {
              id: `user-${Date.now()}`,
              name: values.name,
              email: values.email,
              role: values.role,
            }
          }
        };
        
        login(response);
        showToast('Registration successful!', 'success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to register. Please try again.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
        console.error('Registration error:', err);
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
        bgcolor: 'background.default',
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
          Create Account
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Name"
            margin="normal"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            type="email"
            margin="normal"
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
            type="password"
            margin="normal"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            margin="normal"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />

          <FormControl 
            component="fieldset" 
            margin="normal"
            error={formik.touched.role && Boolean(formik.errors.role)}
          >
            <FormLabel component="legend">I want to be a:</FormLabel>
            <RadioGroup
              name="role"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              row
            >
              <FormControlLabel
                value="mentee"
                control={<Radio />}
                label="Mentee"
              />
              <FormControlLabel
                value="mentor"
                control={<Radio />}
                label="Mentor"
              />
            </RadioGroup>
          </FormControl>

          <Box position="relative">
              <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={formik.isSubmitting}
              >
              {formik.isSubmitting ? 'Creating account...' : 'Register'}
              </Button>
              {formik.isSubmitting && (
              <CircularProgress
                  size={24}
                  sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '8px',
                  marginLeft: '-12px',
                  }}
              />
              )}
          </Box>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login">
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
