import React from 'react';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Chip,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Warning as WarningIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { FixConflict } from '../../services/FixConflictService';

interface FixConflictWarningProps {
    conflicts: FixConflict[];
    onResolve?: (resolution: (rules: any[]) => any[]) => void;
}

export const FixConflictWarning: React.FC<FixConflictWarningProps> = ({
    conflicts,
    onResolve
}) => {
    const [expanded, setExpanded] = React.useState<string[]>([]);

    const handleToggle = (conflictId: string) => {
        setExpanded(prev =>
            prev.includes(conflictId)
                ? prev.filter(id => id !== conflictId)
                : [...prev, conflictId]
        );
    };

    const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
        switch (severity) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            case 'low':
                return 'info';
            default:
                return 'warning';
        }
    };

    return (
        <Box>
            {conflicts.map((conflict, index) => (
                <Alert
                    key={index}
                    severity={getSeverityColor(conflict.severity)}
                    icon={conflict.severity === 'high' ? <ErrorIcon /> : <WarningIcon />}
                    action={
                        <Box display="flex" alignItems="center">
                            {conflict.resolution && (
                                <Button
                                    size="small"
                                    color="inherit"
                                    onClick={() => onResolve?.(conflict.resolution!.apply)}
                                >
                                    Resolve
                                </Button>
                            )}
                            <IconButton
                                size="small"
                                onClick={() => handleToggle(`${index}`)}
                            >
                                <ExpandMoreIcon />
                            </IconButton>
                        </Box>
                    }
                    sx={{ mb: 1 }}
                >
                    <AlertTitle>
                        {conflict.type === 'direct' ? 'Direct Conflict' :
                         conflict.type === 'override' ? 'Rule Override' :
                         'Indirect Effect'}
                    </AlertTitle>
                    <Typography variant="body2">
                        {conflict.description}
                    </Typography>
                    <Collapse in={expanded.includes(`${index}`)}>
                        <Box mt={1}>
                            <Typography variant="subtitle2" gutterBottom>
                                Impact
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {conflict.impact}
                            </Typography>
                            {conflict.resolution && (
                                <>
                                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                                        Suggested Resolution
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {conflict.resolution.description}
                                    </Typography>
                                </>
                            )}
                            <Box mt={1}>
                                <Chip
                                    size="small"
                                    label={`Severity: ${conflict.severity}`}
                                    color={getSeverityColor(conflict.severity)}
                                />
                            </Box>
                        </Box>
                    </Collapse>
                </Alert>
            ))}
        </Box>
    );
};