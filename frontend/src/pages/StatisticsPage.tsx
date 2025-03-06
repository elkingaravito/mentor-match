import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Avatar,
  Rating,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import {
  useGetGlobalStatisticsQuery,
  useGetUserStatisticsQuery,
  useGetTopMentorsQuery,
  useGetPopularSkillsQuery,
  useGetSessionTrendsQuery,
} from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`statistics-tabpanel-${index}`}
      aria-labelledby={`statistics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatisticsPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  
  const { data: globalStats, isLoading: isLoadingGlobalStats } = useGetGlobalStatisticsQuery(undefined);
  const { data: userStats, isLoading: isLoadingUserStats } = useGetUserStatisticsQuery(user?.id || 0, {
    skip: !user,
  });
  const { data: topMentors, isLoading: isLoadingTopMentors } = useGetTopMentorsQuery(undefined);
  const { data: popularSkills, isLoading: isLoadingPopularSkills } = useGetPopularSkillsQuery(undefined);
  const { data: sessionTrends, isLoading: isLoadingSessionTrends } = useGetSessionTrendsQuery(undefined);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Preparar datos para gráficos
  const sessionStatusData = globalStats?.sessions ? [
    { name: 'Completadas', value: globalStats.sessions.completed },
    { name: 'Canceladas', value: globalStats.sessions.cancelled },
    { name: 'Pendientes', value: globalStats.sessions.total - globalStats.sessions.completed - globalStats.sessions.cancelled },
  ] : [];
  
  const userTypeData = globalStats?.users ? [
    { name: 'Mentores', value: globalStats.users.mentors },
    { name: 'Mentiles', value: globalStats.users.mentees },
  ] : [];
  
  const skillsData = popularSkills?.map(skill => ({
    name: skill.name,
    value: skill.interest_count,
  })) || [];
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Estadísticas
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="statistics tabs">
          <Tab label="Resumen" />
          <Tab label="Mis Estadísticas" />
          <Tab label="Top Mentores" />
          <Tab label="Habilidades Populares" />
          <Tab label="Tendencias" />
        </Tabs>
      </Box>
      
      {/* Resumen */}
      <TabPanel value={tabValue} index={0}>
        {isLoadingGlobalStats ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : globalStats ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Estadísticas Generales
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total de Usuarios
                      </Typography>
                      <Typography variant="h4">
                        {globalStats.users.total}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total de Sesiones
                      </Typography>
                      <Typography variant="h4">
                        {globalStats.sessions.total}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Horas de Mentoría
                      </Typography>
                      <Typography variant="h4">
                        {globalStats.mentoring_hours}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Calificación Promedio
                      </Typography>
                      <Typography variant="h4">
                        {globalStats.average_rating.toFixed(1)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Distribución de Usuarios
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {userTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Estado de Sesiones
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sessionStatusData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Sesiones" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Typography>No hay estadísticas disponibles</Typography>
        )}
      </TabPanel>
      
      {/* Mis Estadísticas */}
      <TabPanel value={tabValue} index={1}>
        {isLoadingUserStats ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : userStats ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Mis Sesiones
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completadas', value: userStats.sessions.completed },
                            { name: 'Canceladas', value: userStats.sessions.cancelled },
                            { name: 'Próximas', value: userStats.sessions.upcoming },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {userTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumen de Actividad
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total de Sesiones
                      </Typography>
                      <Typography variant="h4">
                        {userStats.sessions.total}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Sesiones Completadas
                      </Typography>
                      <Typography variant="h4">
                        {userStats.sessions.completed}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Horas de Mentoría
                      </Typography>
                      <Typography variant="h4">
                        {userStats.mentoring_hours}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Calificación Promedio
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ mr: 1 }}>
                          {userStats.average_rating.toFixed(1)}
                        </Typography>
                        <Rating value={userStats.average_rating} precision={0.5} readOnly />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Typography>No hay estadísticas disponibles</Typography>
        )}
      </TabPanel>
      
      {/* Top Mentores */}
      <TabPanel value={tabValue} index={2}>
        {isLoadingTopMentors ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : topMentors && topMentors.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mentor</TableCell>
                  <TableCell>Posición</TableCell>
                  <TableCell>Empresa</TableCell>
                  <TableCell align="right">Sesiones Completadas</TableCell>
                  <TableCell align="right">Calificación</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topMentors.map((mentor) => (
                  <TableRow key={mentor.id}>
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>{mentor.name.charAt(0)}</Avatar>
                        {mentor.name}
                      </Box>
                    </TableCell>
                    <TableCell>{mentor.position}</TableCell>
                    <TableCell>{mentor.company}</TableCell>
                    <TableCell align="right">{mentor.completed_sessions}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Typography sx={{ mr: 1 }}>{mentor.average_rating.toFixed(1)}</Typography>
                        <Rating value={mentor.average_rating} precision={0.5} readOnly size="small" />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No hay datos disponibles</Typography>
        )}
      </TabPanel>
      
      {/* Habilidades Populares */}
      <TabPanel value={tabValue} index={3}>
        {isLoadingPopularSkills ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : popularSkills && popularSkills.length > 0 ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Habilidades Más Demandadas
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={skillsData}
                        layout="vertical"
                        margin={{
                          top: 20,
                          right: 30,
                          left: 100,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Interesados" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Habilidad</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell align="right">Interesados</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {popularSkills.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell component="th" scope="row">
                          {skill.name}
                        </TableCell>
                        <TableCell>{skill.category}</TableCell>
                        <TableCell align="right">{skill.interest_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        ) : (
          <Typography>No hay datos disponibles</Typography>
        )}
      </TabPanel>
      
      {/* Tendencias */}
      <TabPanel value={tabValue} index={4}>
        {isLoadingSessionTrends ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : sessionTrends ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sesiones por Día
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sessionTrends.by_day}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Sesiones" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sesiones por Estado
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sessionTrends.by_status}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="status"
                          label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {sessionTrends.by_status.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Typography>No hay datos disponibles</Typography>
        )}
      </TabPanel>
    </Box>
  );
};

export default StatisticsPage;
