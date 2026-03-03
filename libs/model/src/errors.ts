// libs/model/src/errors.ts

export type KnownErrorCode = 'BAD_REQUEST' | 'FORBIDDEN' | 'CONFLICT';

export type KnownErrorReason =
  // snapshot / shape
  | 'SNAPSHOT_REQUIRED'
  | 'SNAPSHOT_NOT_ALLOWED'

  // auth / actor
  | 'SYSTEM_ONLY'
  | 'ORACLE_ONLY'
  | 'HOST_ONLY'

  // players / host
  | 'HOST_REQUIRED'
  | 'MIN_PLAYERS_REQUIRED'
  | 'PLAYER_ALREADY_EXISTS'
  | 'PLAYER_NOT_FOUND'
  | 'HOST_CANNOT_BE_REMOVED'
  | 'HOST_ALREADY_EXISTS'

  // cycle
  | 'CYCLE_REQUIRED'
  | 'CYCLE_ALREADY_EXISTS'
  | 'CYCLE_NOT_IN_ACTIVE'
  | 'CYCLE_NOT_IN_BOUNDARY_DECISION'
  | 'ROTATION_EXHAUSTED'

  // game state
  | 'GAME_NOT_IN_LOBBY'
  | 'GAME_NOT_IN_PROGRESS'
  | 'GAME_ALREADY_FINISHED'

  // round state
  | 'ROUND_REQUIRED'
  | 'ROUND_ALREADY_EXISTS'
  | 'ROUND_ALREADY_TERMINAL'
  | 'ROUND_NOT_IN_READY'
  | 'ROUND_NOT_IN_GUESSING'
  | 'ROUND_NOT_IN_LOCKED'

  // preconditions
  | 'PREDICTION_REQUIRED';

export type KnownError =
  | { status: 400; code: 'BAD_REQUEST'; reason: KnownErrorReason }
  | { status: 403; code: 'FORBIDDEN'; reason: KnownErrorReason }
  | { status: 409; code: 'CONFLICT'; reason: KnownErrorReason };

export function badRequest(reason: KnownErrorReason): KnownError {
  return { status: 400, code: 'BAD_REQUEST', reason };
}

export function forbidden(reason: KnownErrorReason): KnownError {
  return { status: 403, code: 'FORBIDDEN', reason };
}

export function conflict(reason: KnownErrorReason): KnownError {
  return { status: 409, code: 'CONFLICT', reason };
}
