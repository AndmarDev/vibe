// libs/rules/src/apply.ts

import type { Actor, ActiveRound, GameSnapshot, KnownError, Result } from '@app/model';
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

export function apply(input: ApplyInput): Result<ApplyValue, KnownError> {
  const { snapshot, actor, command: c } = input;

  switch (c.type) {
    case 'GAME_CREATE': {
      if (snapshot !== null) return err(badRequest('SNAPSHOT_NOT_ALLOWED'));

      const s: GameSnapshot = {
        gameId: c.gameId,
        gameSeq: 0,
        state: 'LOBBY',
        activeRound: null,
      };
      return ok({ snapshot: s, effects: [] });
    }

    case 'GAME_START_SYSTEM': {
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const s0 = s0r.value;
      if (s0.state === 'FINISHED') return err(conflict('GAME_ALREADY_FINISHED'));
      if (s0.state !== 'LOBBY') return err(conflict('GAME_NOT_IN_LOBBY'));

      return ok({ snapshot: bump({ ...s0, state: 'IN_PROGRESS' }), effects: [] });
    }

    case 'GAME_FINISH_SYSTEM': {
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const s0 = s0r.value;
      if (s0.state === 'FINISHED') return ok({ snapshot: s0, effects: [] }); // idempotent

      // Steg 1: finish abortar pågående round om den inte är REVEALED eller redan ABORTED
      const r = s0.activeRound;
      const shouldAbort = !!r && r.state !== 'REVEALED' && r.state !== 'ABORTED';

      const s1: GameSnapshot = {
        ...s0,
        state: 'FINISHED',
        activeRound: shouldAbort ? { ...r!, state: 'ABORTED' } : s0.activeRound,
      };

      // En bump per command
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

      const s1: GameSnapshot = bump({
        ...s0,
        activeRound: {
          roundId: c.roundId,
          state: 'READY',
          oraclePlayerId: c.oraclePlayerId,
          prediction: null,
        },
      });

      return ok({ snapshot: s1, effects: [] });
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
