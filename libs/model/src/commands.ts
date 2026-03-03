// libs/model/src/commands.ts

import type { Difficulty, GameId, PlayerId, RoundId } from './domain.js';

export type Command =
  | { type: 'GAME_CREATE'; gameId: GameId }
  | { type: 'GAME_START_SYSTEM' }
  | { type: 'GAME_FINISH_SYSTEM' }
  | { type: 'ROUND_CREATE_SYSTEM'; roundId: RoundId; oraclePlayerId: PlayerId }
  | { type: 'ROUND_BEGIN' }
  | { type: 'ROUND_SET_PREDICTION'; difficulty: Difficulty }
  | { type: 'ROUND_LOCK' }
  | { type: 'ROUND_REVEAL' }
  | { type: 'ROUND_ABORT_SYSTEM' };
