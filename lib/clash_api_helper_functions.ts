// Import only the types you need from your central file
import { 
  ApiBattleLog, 
  ParsedBattle, 
  ApiCard, 
  MatchOutcome 
} from '@/lib/clash_api_types';

function mapCardsToObject(cardArray: ApiCard[]): Record<string, number> {
  return cardArray.reduce((acc, card) => {
    acc[card.name] = card.level;
    return acc;
  }, {} as Record<string, number>);
}

// get just the first 5 logs
export function sliceRawLogs(rawJson: unknown): ApiBattleLog[] {
    if (!Array.isArray(rawJson)) return [];
    const typedLogs = rawJson as ApiBattleLog[];
    return typedLogs.slice(0, Math.min(5, typedLogs.length));
}

// turn the first 5 logs into shorter json (saves on tokens)
export function transformBattleLogs(battleLogs: ApiBattleLog[], clashId: string): ParsedBattle[] {
    return battleLogs.map(log => {
        let myData = log.team[0];
        const opponentData = log.opponent[0];

        // account for 2v2 matches:
        if (log.team[1]) {
            if (log.team[1].tag == clashId) {
                myData = log.team[1];
            }
        }

        return {
            myPlayerTag: myData.tag,
            myCards: mapCardsToObject(myData.cards),
            opponentPlayerTag: opponentData.tag,
            opponentCards: mapCardsToObject(opponentData.cards),
            matchOutcome: getMatchOutcome(myData.crowns, opponentData.crowns)
        };
    });
}

export function sliceAndTransform(rawJson: unknown, clashId: string): ParsedBattle[] {
    return transformBattleLogs(sliceRawLogs(rawJson), clashId);
}

// determine the winner of a match based on crown count
export function getMatchOutcome(myCrowns: number, opponentsCrowns: number): MatchOutcome {
    if (myCrowns > opponentsCrowns) return 'Win';
    else if (myCrowns < opponentsCrowns) return 'Loss';
    else return 'Draw';
}

