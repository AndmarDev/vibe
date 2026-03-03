// libs/model/src/commands.ts

import type { Difficulty, GameId, PlayerId, RoundId } from './domain.js';

export type Command =
  | { type: 'GAME_CREATE'; gameId: GameId }
  | { type: 'GAME_START' } // host-only
  | { type: 'GAME_FINISH_SYSTEM' } // system-only

  | { type: 'PLAYER_ADD_SYSTEM'; playerId: PlayerId; isHost: boolean }
  | { type: 'PLAYER_REMOVE_SYSTEM'; playerId: PlayerId }

  | { type: 'ROUND_CREATE_SYSTEM'; roundId: RoundId; oraclePlayerId: PlayerId }
  | { type: 'ROUND_BEGIN' }
  | { type: 'ROUND_SET_PREDICTION'; difficulty: Difficulty }
  | { type: 'ROUND_LOCK' }
  | { type: 'ROUND_REVEAL' }
  | { type: 'ROUND_ABORT_SYSTEM' };
