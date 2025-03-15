import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent,
    IconButton,
    Collapse,
    Chip,
    Stack,
    LinearProgress,
    Tooltip
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    History as HistoryIcon,
    Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { ResolutionSession, ResolutionStep, ResolutionHistoryService } from '../../services/ResolutionHistoryService';

interface ResolutionHistoryProps {
    currentSessionId?: string;
}

export const ResolutionHistory: React.FC<ResolutionHistoryProps> = ({
    currentSessionId
}) => {
    const [sessions, setSessions] = useState<ResolutionSession[]>([]);
    const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
    const [patterns, setPatterns] = useState<any>(null);

    useEffect(() => {
        loadHistory();
    }, [currentSessionId]);

    const loadHistory = () => {
        const history = ResolutionHistoryService.getSessionHistory();
        setSessions(history);
        setPatterns(ResolutionHistoryService.analyzeResolutionPatterns());
    };

    const toggleStep = (stepId: string) => {
        setExpandedSteps(prev => {
            const next = new Set(prev);
            if (next.has(stepId)) {
                next.delete(stepId);
            } else {
                next.add(stepId);
            }
            return next;
        });
    };

    const formatDuration = (ms: number): string => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    const renderStep = (step: ResolutionStep, isLast: boolean) => (
        <TimelineItem key={step.id}>
            <TimelineOppositeContent color="textSecondary">
                {new Date(step.timestamp).toLocaleTimeString()}
            </TimelineOppositeContent>
            <TimelineSeparator>
                <TimelineDot color={step.confidence > 0.7 ? "success" : "warning"}>
                    {step.confidence > 0.7 ? <SuccessIcon /> : <ErrorIcon />}
                </TimelineDot>
                {!isLast && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
                <Box sx={{ cursor: 'pointer' }} onClick={() => toggleStep(step.id)}>
                    <Typography variant="subtitle2">
                        {step.strategy.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Resolved {step.resolvedConflicts.length} conflicts
                    </Typography>
                    <Collapse in={expandedSteps.has(step.id)}>
                        <Box mt={1}>
                            <Stack spacing={1}>
                                <Typography variant="body2">
                                    Modified {step.metadata.rulesModified} rules
                                    ({step.metadata.rulesAdded} added, {step.metadata.rulesRemoved} removed)
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={step.confidence * 100}
                                    sx={{ mb: 1 }}
                                />
                                <Stack direction="row" spacing={1}>
                                    <Chip
                                        size="small"
                                        label={`${Math.round(step.confidence * 100)}% confidence`}
                                        color={step.confidence > 0.7 ? "success" : "warning"}
                                    />
                                    <Chip
                                        size="small"
                                        label={formatDuration(step.metadata.duration)}
                                    />
                                </Stack>
                            </Stack>
                        </Box>
                    </Collapse>
                </Box>
            </TimelineContent>
        </TimelineItem>
    );

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        Resolution History
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                        <HistoryExportImport onHistoryChange={loadHistory} />
                        <Tooltip title="Analysis">
                            <IconButton size="small" onClick={() => loadHistory()}>
                                <AnalyticsIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {patterns && (
                    <Box mb={2}>
                        <Typography variant="subtitle2" gutterBottom>
                            Resolution Patterns
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Chip
                                size="small"
                                icon={<HistoryIcon />}
                                label={`Avg. Time: ${formatDuration(patterns.averageResolutionTime)}`}
                            />
                            <Chip
                                size="small"
                                icon={<SuccessIcon />}
                                label={`Best Strategy: ${patterns.mostSuccessfulStrategies[0]?.strategyId}`}
                            />
                        </Stack>
                    </Box>
                )}

                {sessions.map(session => (
                    <Box key={session.id} mb={2}>
                        <Typography variant="subtitle1" gutterBottom>
                            Session {new Date(session.startTime).toLocaleDateString()}
                        </Typography>
                        <Timeline>
                            {session.steps.map((step, index) => 
                                renderStep(step, index === session.steps.length - 1)
                            )}
                        </Timeline>
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
};
