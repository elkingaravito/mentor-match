export type TimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface MetricValue {
    current: number;
    previous: number;
    trend: number;
    direction: TrendDirection;
}

export interface TimeSeriesPoint {
    timestamp: string;
    value: number;
}

export interface MentorshipMetrics {
    activeUsers: MetricValue;
    activeMentors: MetricValue;
    activeMentees: MetricValue;
    averageSessionsPerMentor: MetricValue;
    mentorRetentionRate: MetricValue;
    menteeRetentionRate: MetricValue;
    averageMatchQuality: MetricValue;
    timeSeriesData: {
        mentorGrowth: TimeSeriesPoint[];
        sessionTrends: TimeSeriesPoint[];
        matchingSuccess: TimeSeriesPoint[];
    };
}

export interface SessionMetrics {
    totalSessions: MetricValue;
    completedSessions: MetricValue;
    canceledSessions: MetricValue;
    averageSessionDuration: MetricValue;
    averageRating: MetricValue;
    sessionCompletionRate: MetricValue;
    timeSeriesData: {
        sessionsOverTime: TimeSeriesPoint[];
        ratingsDistribution: TimeSeriesPoint[];
        cancellationTrends: TimeSeriesPoint[];
    };
}

export interface EngagementMetrics {
    averageSessionsPerUser: MetricValue;
    userActivityRate: MetricValue;
    platformUtilization: MetricValue;
    userSatisfactionScore: MetricValue;
    timeSeriesData: {
        dailyActiveUsers: TimeSeriesPoint[];
        userEngagement: TimeSeriesPoint[];
        satisfactionTrends: TimeSeriesPoint[];
    };
}

export interface RevenueMetrics {
    totalRevenue: MetricValue;
    averageRevenuePerUser: MetricValue;
    subscriptionGrowth: MetricValue;
    churnRate: MetricValue;
    timeSeriesData: {
        revenueGrowth: TimeSeriesPoint[];
        subscriptionTrends: TimeSeriesPoint[];
        churnAnalysis: TimeSeriesPoint[];
    };
}

export interface MetricsFilter {
    startDate: string;
    endDate: string;
    granularity: TimeGranularity;
    mentorId?: number;
    menteeId?: number;
    categories?: string[];
    tags?: string[];
}

export interface MetricsResponse {
    mentorship: MentorshipMetrics;
    sessions: SessionMetrics;
    engagement: EngagementMetrics;
    revenue: RevenueMetrics;
    timeRange: {
        start: string;
        end: string;
        granularity: TimeGranularity;
    };
}