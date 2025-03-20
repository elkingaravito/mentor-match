import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    Box,
    Typography,
    Skeleton,
    Alert,
    IconButton,
    LinearProgress,
    Tooltip,
    Tab,
    Tabs,
    useTheme
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useGetPopularSkillsQuery } from '../../services/api';

interface SkillBarProps {
    name: string;
    count: number;
    maxCount: number;
    category: string;
}

const SkillBar: React.FC<SkillBarProps> = ({ name, count, maxCount, category }) => {
    const theme = useTheme();
    const percentage = (count / maxCount) * 100;

    const getCategoryColor = (category: string) => {
        const colors = {
            'Technical': theme.palette.primary.main,
            'Soft Skills': theme.palette.secondary.main,
            'Domain': theme.palette.success.main,
            'Leadership': theme.palette.warning.main,
            'default': theme.palette.info.main
        };
        return colors[category as keyof typeof colors] || colors.default;
    };

    return (
        <Box sx={{ my: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Tooltip title={`${count} mentees interested`}>
                    <Typography variant="body2">{name}</Typography>
                </Tooltip>
                <Typography variant="body2" color="text.secondary">
                    {count}
                </Typography>
            </Box>
            <Tooltip title={category}>
                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                        height: 8,
                        borderRadius: 1,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: getCategoryColor(category),
                            borderRadius: 1,
                        },
                    }}
                />
            </Tooltip>
        </Box>
    );
};

const SkillSkeleton: React.FC = () => (
    <Box sx={{ my: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="20%" />
        </Box>
        <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1 }} />
    </Box>
);

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`skills-tabpanel-${index}`}
        aria-labelledby={`skills-tab-${index}`}
    >
        {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
);

export const PopularSkillsCard: React.FC = () => {
    const [tabValue, setTabValue] = React.useState(0);
    const {
        data: response,
        isLoading,
        isError,
        error,
        refetch
    } = useGetPopularSkillsQuery();

    const skills = response?.data;

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (isError) {
        return (
            <Card>
                <CardContent>
                    <Alert
                        severity="error"
                        action={
                            <IconButton
                                color="inherit"
                                size="small"
                                onClick={() => refetch()}
                            >
                                <RefreshIcon />
                            </IconButton>
                        }
                    >
                        {error instanceof Error ? error.message : 'Failed to load popular skills'}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const getMaxCount = (skills: typeof response.data) => {
        return Math.max(...skills.map(skill => skill.interest_count));
    };

    const filterSkillsByCategory = (skills: typeof response.data, category: string) => {
        return skills.filter(skill => skill.category === category);
    };

    return (
        <Card>
            <CardHeader
                title="Popular Skills"
                subheader="Most requested mentoring topics"
            />
            <CardContent>
                {isLoading ? (
                    Array(5).fill(0).map((_, index) => (
                        <SkillSkeleton key={index} />
                    ))
                ) : skills ? (
                    <>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ borderBottom: 1, borderColor: 'divider' }}
                        >
                            <Tab label="Technical" />
                            <Tab label="Soft Skills" />
                            <Tab label="Domain" />
                            <Tab label="Leadership" />
                        </Tabs>

                        {['Technical', 'Soft Skills', 'Domain', 'Leadership'].map((category, index) => (
                            <TabPanel key={category} value={tabValue} index={index}>
                                {filterSkillsByCategory(skills, category).map((skill) => (
                                    <SkillBar
                                        key={skill.id}
                                        name={skill.name}
                                        count={skill.interest_count}
                                        maxCount={getMaxCount(skills)}
                                        category={category}
                                    />
                                ))}
                            </TabPanel>
                        ))}
                    </>
                ) : null}
            </CardContent>
        </Card>
    );
};