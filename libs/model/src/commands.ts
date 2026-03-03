// libs/model/src/commands.ts

import type { CycleId, Difficulty, GameId, PlayerId, RoundId } from './domain.js';

export type Command =
  | { type: 'GAME_CREATE'; gameId: GameId }
  | { type: 'GAME_START' } // host-only
  | { type: 'GAME_FINISH_SYSTEM' }
  | { type: 'GAME_FINISH' }

  | { type: 'PLAYER_ADD_SYSTEM'; playerId: PlayerId; isHost: boolean }
  | { type: 'PLAYER_ADD'; playerId: PlayerId; isHost: boolean }
  | { type: 'PLAYER_REMOVE_SYSTEM'; playerId: PlayerId }
  | { type: 'PLAYER_REMOVE'; playerId: PlayerId }

  | { type: 'CYCLE_CREATE_SYSTEM'; cycleId: CycleId }
  | { type: 'CYCLE_DECIDE'; decision: 'START_NEXT'; nextCycleId: CycleId }
  | { type: 'CYCLE_DECIDE'; decision: 'FINISH_GAME' }

  | { type: 'ROUND_CREATE_SYSTEM'; roundId: RoundId } // oracle hämtas från rotation
  | { type: 'ROUND_CREATE'; roundId: RoundId } // host-only
  | { type: 'ROUND_BEGIN' }
  | { type: 'ROUND_SET_PREDICTION'; difficulty: Difficulty }
  | { type: 'ROUND_LOCK' }
  | { type: 'ROUND_REVEAL' }
  | { type: 'ROUND_ABORT_SYSTEM' }
  | { type: 'ROUND_ABORT' };
