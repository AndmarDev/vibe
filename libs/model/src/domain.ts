// libs/model/src/domain.ts

export type GameId = number;
export type PlayerId = number;
export type RoundId = number;
export type CycleId = number;
export type PerformanceId = number;

export type GameState = 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';
export type RoundState = 'READY' | 'GUESSING' | 'LOCKED' | 'REVEALED' | 'ABORTED';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type Actor =
  | { kind: 'SYSTEM' }
  | { kind: 'PLAYER'; playerId: PlayerId };

export type Player = {
  playerId: PlayerId;
  isHost: boolean;
  joinIndex: number; // monotont ökande per Game, återanvänds aldrig
};

export type CycleState = 'ACTIVE' | 'BOUNDARY_DECISION'; // saknas: FINISHED (historik-/arkiveringsbehov)

export type ActiveCycle = {
  cycleId: CycleId;
  state: CycleState;
  rotation: PlayerId[];
  rotationIndex: number; // 0..rotation.length
};

export type ActiveRound = {
  roundId: RoundId;
  state: RoundState;
  oraclePlayerId: PlayerId;

  // Steg 1: bara prediction-gate (ingen guess/performance än)
  prediction: Difficulty | null;
};

export type ActivePerformance = {
  performanceId: PerformanceId;
  trackRef?: string; // opaque ref, ingen semantik i rules ännu
};

export type GameSnapshot = {
  gameId: GameId;
  gameSeq: number;
  state: GameState;

  players: Player[]; // endast kvarvarande Players

  activeCycle: ActiveCycle | null;
  activeRound: ActiveRound | null;
  activePerformance: ActivePerformance | null;
};
