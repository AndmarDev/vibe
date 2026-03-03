// libs/rules/src/apply.ts

import type { Actor, ActiveRound, GameSnapshot, KnownError, Player, Result } from '@app/model';
import type { Command } from '@app/model';
import { ok, err, badRequest, conflict, forbidden } from '@app/model';

export type ApplyInput = {
  snapshot: GameSnapshot | null;
  actor: Actor;
  command: Command;
};

export type ApplyValue = {
  snapshot: GameSnapshot;
  effects: never[]; // växer senare
};

function bump(s: GameSnapshot): GameSnapshot {
  return { ...s, gameSeq: s.gameSeq + 1 };
}

function isSystem(actor: Actor): boolean {
  return actor.kind === 'SYSTEM';
}

function requireSnapshot(snapshot: GameSnapshot | null): Result<GameSnapshot, KnownError> {
  if (snapshot === null) return err(badRequest('SNAPSHOT_REQUIRED'));
  return ok(snapshot);
}

function requireGameNotFinished(s: GameSnapshot): Result<GameSnapshot, KnownError> {
  if (s.state === 'FINISHED') return err(conflict('GAME_ALREADY_FINISHED'));
  return ok(s);
}

// Round-kommandon får bara köras när spelet är IN_PROGRESS
function requireGameInProgress(s: GameSnapshot): Result<GameSnapshot, KnownError> {
  if (s.state === 'FINISHED') return err(conflict('GAME_ALREADY_FINISHED'));
  if (s.state !== 'IN_PROGRESS') return err(conflict('GAME_NOT_IN_PROGRESS'));
  return ok(s);
}

function requireOracle(actor: Actor, s: GameSnapshot): Result<ActiveRound, KnownError> {
  const r = s.activeRound;
  if (!r) return err(conflict('ROUND_REQUIRED'));
  if (actor.kind !== 'PLAYER') return err(forbidden('ORACLE_ONLY'));
  if (actor.playerId !== r.oraclePlayerId) return err(forbidden('ORACLE_ONLY'));
  return ok(r);
}

function findHost(players: Player[]): Player | null {
  for (const p of players) {
    if (p.isHost) return p;
  }
  return null;
}

function requireHostActor(actor: Actor, s: GameSnapshot): Result<Player, KnownError> {
  const host = findHost(s.players);
  if (!host) return err(conflict('HOST_REQUIRED'));
  if (actor.kind !== 'PLAYER') return err(forbidden('HOST_ONLY'));
  if (actor.playerId !== host.playerId) return err(forbidden('HOST_ONLY'));
  return ok(host);
}

function nextJoinIndex(players: Player[]): number {
  let max = -1;
  for (const p of players) {
    if (p.joinIndex > max) max = p.joinIndex;
  }
  return max + 1;
}

// Helper: ingen bump här. Caller ansvarar för exakt en bump.
function finishGameIfNotFinished(s0: GameSnapshot): GameSnapshot {
  if (s0.state === 'FINISHED') return s0;

  const r = s0.activeRound;
  const shouldAbort = !!r && r.state !== 'REVEALED' && r.state !== 'ABORTED';

  return {
    ...s0,
    state: 'FINISHED',
    activeRound: shouldAbort ? { ...r!, state: 'ABORTED' } : s0.activeRound,
  };
}

export function apply(input: ApplyInput): Result<ApplyValue, KnownError> {
  const { snapshot, actor, command: c } = input;

  switch (c.type) {
    case 'GAME_CREATE': {
      if (snapshot !== null) return err(badRequest('SNAPSHOT_NOT_ALLOWED'));

      const s: GameSnapshot = {
        gameId: c.gameId,
        gameSeq: 0,
        state: 'LOBBY',
        players: [],
        activeRound: null,
      };
      return ok({ snapshot: s, effects: [] });
    }

    case 'PLAYER_ADD_SYSTEM': {
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const nf = requireGameNotFinished(s0r.value);
      if (!nf.ok) return nf;
      const s0 = nf.value;

      // Håll snittet tunt -> vi tillåter add endast i LOBBY.
      if (s0.state !== 'LOBBY') return err(conflict('GAME_NOT_IN_LOBBY'));

      for (const p of s0.players) {
        if (p.playerId === c.playerId) return err(conflict('PLAYER_ALREADY_EXISTS'));
      }

      if (c.isHost) {
        const host = findHost(s0.players);
        if (host) return err(conflict('HOST_ALREADY_EXISTS'));
      }

      const p: Player = {
        playerId: c.playerId,
        isHost: c.isHost,
        joinIndex: nextJoinIndex(s0.players),
      };

      return ok({
        snapshot: bump({ ...s0, players: [...s0.players, p] }),
        effects: [],
      });
    }

    case 'PLAYER_REMOVE_SYSTEM': {
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const nf = requireGameNotFinished(s0r.value);
      if (!nf.ok) return nf;
      const s0 = nf.value;

      let found: Player | null = null;
      for (const p of s0.players) {
        if (p.playerId === c.playerId) {
          found = p;
          break;
        }
      }
      if (!found) return err(conflict('PLAYER_NOT_FOUND'));
      if (found.isHost) return err(conflict('HOST_CANNOT_BE_REMOVED'));

      const players1 = s0.players.filter((p) => p.playerId !== c.playerId);
      let s1: GameSnapshot = { ...s0, players: players1 };

      // minPlayers-gating: om kvarvarande < 3 -> finish (abort round vid behov)
      if (players1.length < 3) {
        s1 = finishGameIfNotFinished(s1);
      }

      return ok({ snapshot: bump(s1), effects: [] });
    }

    case 'GAME_START': {
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const s0 = s0r.value;
      if (s0.state === 'FINISHED') return err(conflict('GAME_ALREADY_FINISHED'));
      if (s0.state !== 'LOBBY') return err(conflict('GAME_NOT_IN_LOBBY'));

      const hr = requireHostActor(actor, s0);
      if (!hr.ok) return hr;

      if (s0.players.length < 3) return err(conflict('MIN_PLAYERS_REQUIRED'));

      return ok({ snapshot: bump({ ...s0, state: 'IN_PROGRESS' }), effects: [] });
    }

    case 'GAME_FINISH_SYSTEM': {
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const s0 = s0r.value;
      if (s0.state === 'FINISHED') return ok({ snapshot: s0, effects: [] }); // idempotent

      const s1 = finishGameIfNotFinished(s0);
      return ok({ snapshot: bump(s1), effects: [] });
    }

    case 'ROUND_CREATE_SYSTEM': {
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const gp = requireGameInProgress(s0r.value);
      if (!gp.ok) return gp;
      const s0 = gp.value;

      if (s0.activeRound) return err(conflict('ROUND_ALREADY_EXISTS'));

      const s1: GameSnapshot = {
        ...s0,
        activeRound: {
          roundId: c.roundId,
          state: 'READY',
          oraclePlayerId: c.oraclePlayerId,
          prediction: null,
        },
      };

      return ok({ snapshot: bump(s1), effects: [] });
    }

    case 'ROUND_BEGIN': {
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const gp = requireGameInProgress(s0r.value);
      if (!gp.ok) return gp;
      const s0 = gp.value;

      const rr = requireOracle(actor, s0);
      if (!rr.ok) return rr;
      const r = rr.value;

      if (r.state !== 'READY') return err(conflict('ROUND_NOT_IN_READY'));

      // BEGIN gör endast READY -> GUESSING. Inga resets här.
      return ok({
        snapshot: bump({ ...s0, activeRound: { ...r, state: 'GUESSING' } }),
        effects: [],
      });
    }

    case 'ROUND_SET_PREDICTION': {
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const gp = requireGameInProgress(s0r.value);
      if (!gp.ok) return gp;
      const s0 = gp.value;

      const rr = requireOracle(actor, s0);
      if (!rr.ok) return rr;
      const r = rr.value;

      if (r.state !== 'GUESSING') return err(conflict('ROUND_NOT_IN_GUESSING'));

      return ok({
        snapshot: bump({ ...s0, activeRound: { ...r, prediction: c.difficulty } }),
        effects: [],
      });
    }

    case 'ROUND_LOCK': {
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const gp = requireGameInProgress(s0r.value);
      if (!gp.ok) return gp;
      const s0 = gp.value;

      const rr = requireOracle(actor, s0);
      if (!rr.ok) return rr;
      const r = rr.value;

      if (r.state !== 'GUESSING') return err(conflict('ROUND_NOT_IN_GUESSING'));
      if (r.prediction === null) return err(conflict('PREDICTION_REQUIRED'));

      return ok({
        snapshot: bump({ ...s0, activeRound: { ...r, state: 'LOCKED' } }),
        effects: [],
      });
    }

    case 'ROUND_REVEAL': {
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const gp = requireGameInProgress(s0r.value);
      if (!gp.ok) return gp;
      const s0 = gp.value;

      const rr = requireOracle(actor, s0);
      if (!rr.ok) return rr;
      const r = rr.value;

      if (r.state !== 'LOCKED') return err(conflict('ROUND_NOT_IN_LOCKED'));

      return ok({
        snapshot: bump({ ...s0, activeRound: { ...r, state: 'REVEALED' } }),
        effects: [],
      });
    }

    case 'ROUND_ABORT_SYSTEM': {
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const gp = requireGameInProgress(s0r.value);
      if (!gp.ok) return gp;
      const s0 = gp.value;

      const r = s0.activeRound;
      if (!r) return err(conflict('ROUND_REQUIRED'));
      if (r.state === 'REVEALED') return err(conflict('ROUND_ALREADY_TERMINAL'));
      if (r.state === 'ABORTED') return ok({ snapshot: s0, effects: [] }); // idempotent

      return ok({
        snapshot: bump({ ...s0, activeRound: { ...r, state: 'ABORTED' } }),
        effects: [],
      });
    }

    default: {
      const _exhaustive: never = c;
      return _exhaustive;
    }
  }
}
