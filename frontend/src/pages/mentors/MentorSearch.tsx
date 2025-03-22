import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSearchMentorsQuery } from '../../services/api';
import { Search as SearchIcon } from '@mui/icons-material';

const SKILLS = [
  'JavaScript',
  'Python',
  'React',
  'Node.js',
  'Java',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Cloud Computing',
  'Mobile Development'
];

const MentorSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = React.useState({
    query: '',
    skills: [] as string[],
    availability: 'any'
  });

  const { data: searchResults, isLoading } = useSearchMentorsQuery(searchParams);

  const handleSkillsChange = (event: SelectChangeEvent<string[]>) => {
    setSearchParams(prev => ({
      ...prev,
      skills: event.target.value as string[]
    }));
  };

  const handleSearch = () => {
    navigate('/mentors', { state: { searchParams } });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Find Your Perfect Mentor
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search by name or expertise"
                value={searchParams.query}
                onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Skills</InputLabel>
                <Select
                  multiple
                  value={searchParams.skills}
                  onChange={handleSkillsChange}
                  input={<OutlinedInput label="Skills" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {SKILLS.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  value={searchParams.availability}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, availability: e.target.value }))}
                >
                  <MenuItem value="any">Any Time</MenuItem>
                  <MenuItem value="this-week">This Week</MenuItem>
                  <MenuItem value="next-week">Next Week</MenuItem>
                  <MenuItem value="evenings">Evenings Only</MenuItem>
                  <MenuItem value="weekends">Weekends Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={isLoading}
              >
                Search Mentors
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MentorSearch;