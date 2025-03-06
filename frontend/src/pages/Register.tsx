import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Avatar,
  Grid,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useRegisterMutation, useCreateMentorProfileMutation, useCreateMenteeProfileMutation } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const [createMentorProfile, { isLoading: isCreatingMentorProfile }] = useCreateMentorProfileMutation();
  const [createMenteeProfile, { isLoading: isCreatingMenteeProfile }] = useCreateMenteeProfileMutation();
  
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  
  const steps = ['Información básica', 'Perfil de usuario'];
  
  const basicInfoFormik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'mentee',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Requerido'),
      email: Yup.string().email('Email inválido').required('Requerido'),
      password: Yup.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .required('Requerido'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir')
        .required('Requerido'),
      role: Yup.string().oneOf(['mentor', 'mentee'], 'Rol inválido').required('Requerido'),
    }),
    onSubmit: async (values) => {
      try {
        const result = await registerMutation({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
        }).unwrap();
        
        setUserId(result.id);
        setActiveStep(1);
      } catch (err) {
        console.error('Error al registrar usuario:', err);
        setError('Error al registrar usuario. Por favor, inténtalo de nuevo.');
      }
    },
  });
  
  const mentorProfileFormik = useFormik({
    initialValues: {
      bio: '',
      experience_years: 0,
      company: '',
      position: '',
      linkedin_url: '',
    },
    validationSchema: Yup.object({
      bio: Yup.string().required('Requerido'),
      experience_years: Yup.number().min(0, 'No puede ser negativo').required('Requerido'),
      company: Yup.string().required('Requerido'),
      position: Yup.string().required('Requerido'),
    }),
    onSubmit: async (values) => {
      if (!userId) return;
      
      try {
        await createMentorProfile({
          userId,
          ...values,
        }).unwrap();
        
        // Iniciar sesión automáticamente
        const userData = {
          id: userId,
          name: basicInfoFormik.values.name,
          email: basicInfoFormik.values.email,
          role: 'mentor',
        };
        
        login('fake-token-for-demo', userData); // En una implementación real, obtendríamos un token
        navigate('/dashboard');
      } catch (err) {
        console.error('Error al crear perfil de mentor:', err);
        setError('Error al crear perfil de mentor. Por favor, inténtalo de nuevo.');
      }
    },
  });
  
  const menteeProfileFormik = useFormik({
    initialValues: {
      bio: '',
      goals: '',
      current_position: '',
      linkedin_url: '',
    },
    validationSchema: Yup.object({
      bio: Yup.string().required('Requerido'),
      goals: Yup.string().required('Requerido'),
      current_position: Yup.string().required('Requerido'),
    }),
    onSubmit: async (values) => {
      if (!userId) return;
      
      try {
        await createMenteeProfile({
          userId,
          ...values,
        }).unwrap();
        
        // Iniciar sesión automáticamente
        const userData = {
          id: userId,
          name: basicInfoFormik.values.name,
          email: basicInfoFormik.values.email,
          role: 'mentee',
        };
        
        login('fake-token-for-demo', userData); // En una implementación real, obtendríamos un token
        navigate('/dashboard');
      } catch (err) {
        console.error('Error al crear perfil de mentil:', err);
        setError('Error al crear perfil de mentil. Por favor, inténtalo de nuevo.');
      }
    },
  });
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const isLoading = isRegistering || isCreatingMentorProfile || isCreatingMenteeProfile;
  
  return (
    <Container component="main" maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <PersonAddIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Registro
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ width: '100%', mt: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {activeStep === 0 ? (
          <Box component="form" onSubmit={basicInfoFormik.handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Nombre completo"
                  name="name"
                  autoComplete="name"
                  value={basicInfoFormik.values.name}
                  onChange={basicInfoFormik.handleChange}
                  onBlur={basicInfoFormik.handleBlur}
                  error={basicInfoFormik.touched.name && Boolean(basicInfoFormik.errors.name)}
                  helperText={basicInfoFormik.touched.name && basicInfoFormik.errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Correo electrónico"
                  name="email"
                  autoComplete="email"
                  value={basicInfoFormik.values.email}
                  onChange={basicInfoFormik.handleChange}
                  onBlur={basicInfoFormik.handleBlur}
                  error={basicInfoFormik.touched.email && Boolean(basicInfoFormik.errors.email)}
                  helperText={basicInfoFormik.touched.email && basicInfoFormik.errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={basicInfoFormik.values.password}
                  onChange={basicInfoFormik.handleChange}
                  onBlur={basicInfoFormik.handleBlur}
                  error={basicInfoFormik.touched.password && Boolean(basicInfoFormik.errors.password)}
                  helperText={basicInfoFormik.touched.password && basicInfoFormik.errors.password}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar contraseña"
                  type="password"
                  id="confirmPassword"
                  value={basicInfoFormik.values.confirmPassword}
                  onChange={basicInfoFormik.handleChange}
                  onBlur={basicInfoFormik.handleBlur}
                  error={basicInfoFormik.touched.confirmPassword && Boolean(basicInfoFormik.errors.confirmPassword)}
                  helperText={basicInfoFormik.touched.confirmPassword && basicInfoFormik.errors.confirmPassword}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Tipo de usuario</FormLabel>
                  <RadioGroup
                    row
                    aria-label="role"
                    name="role"
                    value={basicInfoFormik.values.role}
                    onChange={basicInfoFormik.handleChange}
                  >
                    <FormControlLabel value="mentee" control={<Radio />} label="Mentil (busco mentoría)" />
                    <FormControlLabel value="mentor" control={<Radio />} label="Mentor (ofrezco mentoría)" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : 'Continuar'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  ¿Ya tienes una cuenta? Inicia sesión
                </Link>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box 
            component="form" 
            onSubmit={
              basicInfoFormik.values.role === 'mentor' 
                ? mentorProfileFormik.handleSubmit 
                : menteeProfileFormik.handleSubmit
            } 
            noValidate 
            sx={{ mt: 3, width: '100%' }}
          >
            {basicInfoFormik.values.role === 'mentor' ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    id="bio"
                    label="Biografía"
                    name="bio"
                    value={mentorProfileFormik.values.bio}
                    onChange={mentorProfileFormik.handleChange}
                    onBlur={mentorProfileFormik.handleBlur}
                    error={mentorProfileFormik.touched.bio && Boolean(mentorProfileFormik.errors.bio)}
                    helperText={mentorProfileFormik.touched.bio && mentorProfileFormik.errors.bio}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="experience_years"
                    label="Años de experiencia"
                    name="experience_years"
                    type="number"
                    value={mentorProfileFormik.values.experience_years}
                    onChange={mentorProfileFormik.handleChange}
                    onBlur={mentorProfileFormik.handleBlur}
                    error={mentorProfileFormik.touched.experience_years && Boolean(mentorProfileFormik.errors.experience_years)}
                    helperText={mentorProfileFormik.touched.experience_years && mentorProfileFormik.errors.experience_years}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="company"
                    label="Empresa"
                    name="company"
                    value={mentorProfileFormik.values.company}
                    onChange={mentorProfileFormik.handleChange}
                    onBlur={mentorProfileFormik.handleBlur}
                    error={mentorProfileFormik.touched.company && Boolean(mentorProfileFormik.errors.company)}
                    helperText={mentorProfileFormik.touched.company && mentorProfileFormik.errors.company}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="position"
                    label="Cargo"
                    name="position"
                    value={mentorProfileFormik.values.position}
                    onChange={mentorProfileFormik.handleChange}
                    onBlur={mentorProfileFormik.handleBlur}
                    error={mentorProfileFormik.touched.position && Boolean(mentorProfileFormik.errors.position)}
                    helperText={mentorProfileFormik.touched.position && mentorProfileFormik.errors.position}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="linkedin_url"
                    label="URL de LinkedIn"
                    name="linkedin_url"
                    value={mentorProfileFormik.values.linkedin_url}
                    onChange={mentorProfileFormik.handleChange}
                    onBlur={mentorProfileFormik.handleBlur}
                    error={mentorProfileFormik.touched.linkedin_url && Boolean(mentorProfileFormik.errors.linkedin_url)}
                    helperText={mentorProfileFormik.touched.linkedin_url && mentorProfileFormik.errors.linkedin_url}
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    id="bio"
                    label="Biografía"
                    name="bio"
                    value={menteeProfileFormik.values.bio}
                    onChange={menteeProfileFormik.handleChange}
                    onBlur={menteeProfileFormik.handleBlur}
                    error={menteeProfileFormik.touched.bio && Boolean(menteeProfileFormik.errors.bio)}
                    helperText={menteeProfileFormik.touched.bio && menteeProfileFormik.errors.bio}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    id="goals"
                    label="Objetivos de mentoría"
                    name="goals"
                    value={menteeProfileFormik.values.goals}
                    onChange={menteeProfileFormik.handleChange}
                    onBlur={menteeProfileFormik.handleBlur}
                    error={menteeProfileFormik.touched.goals && Boolean(menteeProfileFormik.errors.goals)}
                    helperText={menteeProfileFormik.touched.goals && menteeProfileFormik.errors.goals}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="current_position"
                    label="Posición actual"
                    name="current_position"
                    value={menteeProfileFormik.values.current_position}
                    onChange={menteeProfileFormik.handleChange}
                    onBlur={menteeProfileFormik.handleBlur}
                    error={menteeProfileFormik.touched.current_position && Boolean(menteeProfileFormik.errors.current_position)}
                    helperText={menteeProfileFormik.touched.current_position && menteeProfileFormik.errors.current_position}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="linkedin_url"
                    label="URL de LinkedIn"
                    name="linkedin_url"
                    value={menteeProfileFormik.values.linkedin_url}
                    onChange={menteeProfileFormik.handleChange}
                    onBlur={menteeProfileFormik.handleBlur}
                    error={menteeProfileFormik.touched.linkedin_url && Boolean(menteeProfileFormik.errors.linkedin_url)}
                    helperText={menteeProfileFormik.touched.linkedin_url && menteeProfileFormik.errors.linkedin_url}
                  />
                </Grid>
              </Grid>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack} disabled={isLoading}>
                Atrás
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Completar registro'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Register;
