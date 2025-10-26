export interface ApiCard {
    name: string;
    level: number;
}

export interface ApiTeamMember {
    trophyChange: number;
    cards: ApiCard[];
}

export interface ApiOpponentMember {
    cards: ApiCard[];
}

export interface ApiBattleLog {
    team: ApiTeamMember[];
    opponent: ApiOpponentMember[];
}

export type MatchOutcome = 'Win' | 'Loss' | 'Draw';

export interface ParsedBattle {
    myCards: Record<string, number>;
    opponentCards: Record<string, number>;
    matchOutcome: MatchOutcome;
}