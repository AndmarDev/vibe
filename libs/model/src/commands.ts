// libs/model/src/commands.ts

import type { CycleId, GameId, PlayerId, RoundId, PerformanceId } from './domain.js';

export type Command =
  | { type: 'GAME_CREATE'; gameId: GameId }
  | { type: 'GAME_START' } // host-only
  | { type: 'GAME_FINISH_SYSTEM' } // internal only
  | { type: 'GAME_FINISH' }

  | { type: 'PLAYER_ADD_SYSTEM'; playerId: PlayerId; isHost: boolean } // internal only
  | { type: 'PLAYER_ADD'; playerId: PlayerId }
  | { type: 'PLAYER_REMOVE_SYSTEM'; playerId: PlayerId } // internal only
  | { type: 'PLAYER_REMOVE'; playerId: PlayerId }

  | { type: 'CYCLE_CREATE_SYSTEM'; cycleId: CycleId } // internal only
  | { type: 'CYCLE_DECIDE'; decision: 'START_NEXT'; nextCycleId: CycleId }
  | { type: 'CYCLE_DECIDE'; decision: 'FINISH_GAME' }

  | { type: 'ROUND_CREATE_SYSTEM'; roundId: RoundId } // internal only
  | { type: 'ROUND_CREATE'; roundId: RoundId } // host-only
  | { type: 'ROUND_BEGIN' }
  | { type: 'ROUND_LOCK' }
  | { type: 'ROUND_REVEAL' }
  | { type: 'ROUND_ABORT_SYSTEM' } // internal only
  | { type: 'ROUND_ABORT' }

  | { type: 'PERFORMANCE_SET_SYSTEM'; performanceId: PerformanceId; trackRef?: string }; // internal only
