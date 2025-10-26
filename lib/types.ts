// User performance metrics
export interface UserMetrics {
    githubUsername: string;
    commits: number;
    winRate: number;
    score: number; // Combined performance score
}

// Position in the group relative to others
export interface UserPosition {
    rank: number;         // Overall rank in the group
    percentile: number;   // Percentile ranking (0-100)
    trend: 'up' | 'down' | 'stable'; // Recent movement in rankings
}

// Individual user context within the group
export interface UserContext extends UserMetrics {
    position: UserPosition;
    historicalData: {
        commits: number[];     // Last n commit counts
        winRates: number[];    // Last n winrates
        timestamps: string[];  // Timestamps for historical data points
    };
}

// Complete group context for performance tracking
export interface GroupContext {
    groupId: string;
    users: Map<string, UserContext>;
    
    // Group-wide statistics
    stats: {
        avgCommits: number;
        avgWinRate: number;
        totalCommits: number;
        activeUsers: number;
    };
    
    // Performance thresholds
    thresholds: {
        dangerZone: number;    // Below this combined score triggers warnings
        highPerformer: number; // Above this combined score is considered high performing
    };
    
    // Time window for tracking
    timeframe: {
        start: string;         // ISO date string
        end: string;          // ISO date string
    };
}

// Helper type for relative performance comparisons
export interface RelativePerformance {
    user: string;
    comparedTo: string;
    commitDiff: number;
    winRateDiff: number;
    scoreDiff: number;
    relativeTrend: 'ahead' | 'behind' | 'tied';
}

// Function signatures for helper functions
export type PerformanceCalculator = (context: GroupContext, username: string) => UserPosition;
export type DangerZoneChecker = (context: GroupContext) => string[];  // Returns usernames in danger zone
export type TrendAnalyzer = (context: GroupContext, username: string) => UserContext['position']['trend'];