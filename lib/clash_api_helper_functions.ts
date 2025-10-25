// Import only the types you need from your central file
import { 
  ApiBattleLog, 
  ParsedBattle, 
  ApiCard, 
  MatchOutcome 
} from '@/lib/clash_api_types';

function getMatchOutcome(trophyChange: number): MatchOutcome {
  if (trophyChange > 0) return "Win";
  if (trophyChange < 0) return "Loss";
  return "Draw";
}

function mapCardsToObject(cardArray: ApiCard[]): Record<string, number> {
  return cardArray.reduce((acc, card) => {
    acc[card.name] = card.level;
    return acc;
  }, {} as Record<string, number>);
}

export function parseBattleLogs(apiResponse: ApiBattleLog[]): ParsedBattle[] {
  return apiResponse.slice(0, 20).map(log => {
    return {
      myCards: mapCardsToObject(log.team[0].cards),
      opponentCards: mapCardsToObject(log.opponent[0].cards),
      matchOutcome: getMatchOutcome(log.team[0].trophyChange)
    };
  });
}