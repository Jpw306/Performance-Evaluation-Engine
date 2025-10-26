

import { GroupContext, DangerZoneChecker, PerformanceCalculator, RelativePerformance } from './types';

export const calculateUserPosition: PerformanceCalculator = (context: GroupContext, username: string) => {
    const user = context.users.get(username);
    if (!user) throw new Error('User not found in group context');
    
    // Calculate rank based on score
    const sortedUsers = Array.from(context.users.values())
        .sort((a, b) => b.score - a.score);
    
    const rank = sortedUsers.findIndex(u => u.githubUsername === username) + 1;
    const percentile = (1 - (rank - 1) / sortedUsers.length) * 100;
    
    return {
        rank,
        percentile,
        trend: user.position.trend // Preserve existing trend
    };
};

export const dangerZone: DangerZoneChecker = (context: GroupContext) => {
    return Array.from(context.users.entries())
        .filter(([_, user]) => user.score < context.thresholds.dangerZone)
        .map(([username]) => username);
};

export function compareUsers(context: GroupContext, user1: string, user2: string): RelativePerformance {
    const userA = context.users.get(user1);
    const userB = context.users.get(user2);
    
    if (!userA || !userB) throw new Error('One or both users not found in context');
    
    return {
        user: user1,
        comparedTo: user2,
        commitDiff: userA.commits - userB.commits,
        winRateDiff: userA.winRate - userB.winRate,
        scoreDiff: userA.score - userB.score,
        relativeTrend: userA.score > userB.score ? 'ahead' : 
                      userA.score < userB.score ? 'behind' : 'tied'
    };
}