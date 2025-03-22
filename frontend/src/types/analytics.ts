export type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
export type MetricType = 'count' | 'average' | 'percentage' | 'duration';

export interface DateRange {
    startDate: string;
    endDate: string;
}

export interface MetricValue {
    current: number;
    previous: number;
    trend: number;
}

export interface Metric {
    id: string;
    name: string;
    value: MetricValue;
    type: MetricType;
    description?: string;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
    }[];
}

export interface AnalyticsFilter {
    timeRange: TimeRange;
    dateRange?: DateRange;
    mentorId?: number;
    menteeId?: number;
    status?: string[];
    tags?: string[];
}

export interface MentorshipMetrics {
    totalMentors: MetricValue;
    activeMentors: MetricValue;
    averageSessionsPerMentor: MetricValue;
    mentorRetentionRate: MetricValue;
}

export interface SessionMetrics {
    totalSessions: MetricValue;
    completionRate: MetricValue;
    averageDuration: MetricValue;
    satisfactionScore: MetricValue;
}

export interface MatchingMetrics {
    totalMatches: MetricValue;
    successfulMatches: MetricValue;
    averageMatchScore: MetricValue;
    matchRetentionRate: MetricValue;
}

export interface AnalyticsData {
    mentorship: MentorshipMetrics;
    sessions: SessionMetrics;
    matching: MatchingMetrics;
    trends: ChartData;
}