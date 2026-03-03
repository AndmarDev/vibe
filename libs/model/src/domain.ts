// libs/model/src/domain.ts

export type GameId = number;
export type PlayerId = number;
export type RoundId = number;

export type GameState = 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';
export type RoundState = 'READY' | 'GUESSING' | 'LOCKED' | 'REVEALED' | 'ABORTED';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type Actor =
  | { kind: 'SYSTEM' }
  | { kind: 'PLAYER'; playerId: PlayerId };

export type ActiveRound = {
  roundId: RoundId;
  state: RoundState;
  oraclePlayerId: PlayerId;

  // Steg 1: bara prediction-gate (ingen guess/performance än)
  prediction: Difficulty | null;
};

export type GameSnapshot = {
  gameId: GameId;
  gameSeq: number;
  state: GameState;
  activeRound: ActiveRound | null;
};
