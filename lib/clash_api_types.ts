export interface ApiCard {
    name: string;
    level: number;
}

export interface ApiTeamMember {
    tag: string;
    crowns: number;
    cards: ApiCard[];
}

export interface ApiOpponentMember {
    tag: string;
    crowns: number;
    cards: ApiCard[];
}

export interface ApiBattleLog {
    team: ApiTeamMember[];
    opponent: ApiOpponentMember[];
}

export type MatchOutcome = "Win" | "Loss" | "Draw";

export interface ParsedBattle {
    myPlayerTag: string;
    myCards: Record<string, number>;
    opponentPlayerTag: string;
    opponentCards: Record<string, number>;
    matchOutcome: MatchOutcome;
}