// libs/rules/src/apply.ts

import type {
  Actor,
  ActiveCycle,
  ActiveRound,
  GameSnapshot,
  KnownError,
  Player,
  PlayerId,
  Result,
} from '@app/model';
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

  // Policy: FINISHED lämnar ingen hängande round i snapshot.
  return {
    ...s0,
    state: 'FINISHED',
    activeRound: null,
  };
}

function requireCycle(s: GameSnapshot): Result<ActiveCycle, KnownError> {
  const c = s.activeCycle;
  if (!c) return err(conflict('CYCLE_REQUIRED'));
  return ok(c);
}

function requireCycleActive(s: GameSnapshot): Result<ActiveCycle, KnownError> {
  const cr = requireCycle(s);
  if (!cr.ok) return cr;
  if (cr.value.state !== 'ACTIVE') return err(conflict('CYCLE_NOT_IN_ACTIVE'));
  return cr;
}

function requireCycleBoundary(s: GameSnapshot): Result<ActiveCycle, KnownError> {
  const cr = requireCycle(s);
  if (!cr.ok) return cr;
  if (cr.value.state !== 'BOUNDARY_DECISION') return err(conflict('CYCLE_NOT_IN_BOUNDARY_DECISION'));
  return cr;
}

function computeRotation(players: Player[]): Result<PlayerId[], KnownError> {
  const host = players.find((p) => p.isHost);
  if (!host) return err(conflict('HOST_REQUIRED'));

  const others = players
    .filter((p) => !p.isHost)
    .slice()
    .sort((a, b) => a.joinIndex - b.joinIndex);

  return ok([host.playerId, ...others.map((p) => p.playerId)]);
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
        activeCycle: null,
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

      // Add endast i LOBBY, för tillfället.
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

      const s0 = s0r.value;
      if (s0.state === 'FINISHED') return ok({ snapshot: s0, effects: [] }); // idempotent-ish

      // --- find + validate ---
      const idx = s0.players.findIndex((p) => p.playerId === c.playerId);
      if (idx === -1) return err(conflict('PLAYER_NOT_FOUND'));

      const toRemove = s0.players[idx];
      if (toRemove.isHost) return err(conflict('HOST_CANNOT_BE_REMOVED'));

      // --- remove from players ---
      const players1 = s0.players.filter((p) => p.playerId !== c.playerId);

      // --- hard termination if < minPlayers ---
      if (players1.length < 3) {
        const s1: GameSnapshot = finishGameIfNotFinished({ ...s0, players: players1 });
        return ok({ snapshot: bump(s1), effects: [] });
      }

      // --- cycle/round interaction ---
      let cycle1 = s0.activeCycle;
      let round1 = s0.activeRound;

      if (s0.state === 'IN_PROGRESS' && cycle1) {
        // 1) Oracle-remove under pågående round => abort + clear (ingen round-historik i snapshot)
        if (round1 && round1.state !== 'REVEALED' && round1.state !== 'ABORTED') {
          if (round1.oraclePlayerId === c.playerId) {
            round1 = null;
          }
        }

        // 2) Invariant: rotation får aldrig innehålla en player som inte finns kvar.
        const oldRotation = cycle1.rotation;
        const newRotation = oldRotation.filter((id) => id !== c.playerId);

        // Håll rotation uppdaterad oavsett cycle state.
        // Index-justering görs bara när cycle är ACTIVE (2C scope).
        let newIndex = cycle1.rotationIndex;

        if (cycle1.state === 'ACTIVE') {
          const oldIndex = cycle1.rotationIndex;
          const removedPos = oldRotation.indexOf(c.playerId);

          // invariant: om id inte fanns i rotation, ingen indexjustering
          if (removedPos !== -1 && removedPos < oldIndex) newIndex = oldIndex - 1;

          if (newIndex < 0) newIndex = 0;
          if (newIndex > newRotation.length) newIndex = newRotation.length;
        } else {
          // i BOUNDARY_DECISION: bara clamp så index inte pekar utanför
          if (newIndex > newRotation.length) newIndex = newRotation.length;
          if (newIndex < 0) newIndex = 0;
        }

        cycle1 = { ...cycle1, rotation: newRotation, rotationIndex: newIndex };

        // 3) Post-condition: boundary kan bara gälla om ingen activeRound finns kvar
        if (cycle1.state === 'ACTIVE' && round1 === null && cycle1.rotationIndex >= cycle1.rotation.length) {
          cycle1 = { ...cycle1, state: 'BOUNDARY_DECISION' };
        }
      }

      const s1: GameSnapshot = {
        ...s0,
        players: players1,
        activeCycle: cycle1,
        activeRound: round1,
      };

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

    case 'CYCLE_CREATE_SYSTEM': {
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const gp = requireGameInProgress(s0r.value);
      if (!gp.ok) return gp;
      const s0 = gp.value;

      if (s0.activeCycle) return err(conflict('CYCLE_ALREADY_EXISTS'));
      if (s0.players.length < 3) return err(conflict('MIN_PLAYERS_REQUIRED'));

      const rot = computeRotation(s0.players);
      if (!rot.ok) return rot;

      const cycle: ActiveCycle = {
        cycleId: c.cycleId,
        state: 'ACTIVE',
        rotation: rot.value,
        rotationIndex: 0,
      };

      return ok({ snapshot: bump({ ...s0, activeCycle: cycle }), effects: [] });
    }

    case 'CYCLE_DECIDE': {
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const gp = requireGameInProgress(s0r.value);
      if (!gp.ok) return gp;
      const s0 = gp.value;

      const hr = requireHostActor(actor, s0);
      if (!hr.ok) return hr;

      const cr = requireCycleBoundary(s0);
      if (!cr.ok) return cr;

      // Policy: boundary-beslut kräver att ingen aktiv round finns kvar.
      if (s0.activeRound !== null) return err(conflict('ROUND_ALREADY_EXISTS'));

      if (c.decision === 'FINISH_GAME') {
        const s1 = finishGameIfNotFinished(s0);
        return ok({ snapshot: bump(s1), effects: [] });
      }

      // START_NEXT: nolla activeRound och ersätt activeCycle med ny.
      if (s0.players.length < 3) return err(conflict('MIN_PLAYERS_REQUIRED'));

      const rot = computeRotation(s0.players);
      if (!rot.ok) return rot;

      const next: ActiveCycle = {
        cycleId: c.nextCycleId,
        state: 'ACTIVE',
        rotation: rot.value,
        rotationIndex: 0,
      };

      const s1: GameSnapshot = {
        ...s0,
        activeRound: null,
        activeCycle: next,
      };

      return ok({ snapshot: bump(s1), effects: [] });
    }

    case 'ROUND_CREATE_SYSTEM': {
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const gp = requireGameInProgress(s0r.value);
      if (!gp.ok) return gp;
      const s0 = gp.value;

      const cr = requireCycleActive(s0);
      if (!cr.ok) return cr;
      const cycle = cr.value;

      if (s0.activeRound) return err(conflict('ROUND_ALREADY_EXISTS'));

      if (cycle.rotationIndex >= cycle.rotation.length) return err(conflict('ROTATION_EXHAUSTED'));

      const oraclePlayerId = cycle.rotation[cycle.rotationIndex];

      const s1: GameSnapshot = {
        ...s0,
        activeRound: {
          roundId: c.roundId,
          state: 'READY',
          oraclePlayerId,
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

      // uppdatera cycle index/state samtidigt, one bump.
      const cr = requireCycle(s0);
      if (!cr.ok) return cr;
      const cycle0 = cr.value;

      const cycle1: ActiveCycle = {
        ...cycle0,
        rotationIndex: cycle0.rotationIndex + 1,
      };

      const finishedRotation = cycle1.rotationIndex >= cycle1.rotation.length;
      const cycle2: ActiveCycle = finishedRotation ? { ...cycle1, state: 'BOUNDARY_DECISION' } : cycle1;

      const s1: GameSnapshot = {
        ...s0,
        activeRound: null,
        activeCycle: cycle2,
      };

      return ok({ snapshot: bump(s1), effects: [] });
    }

    case 'ROUND_ABORT_SYSTEM': {
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const gp = requireGameInProgress(s0r.value);
      if (!gp.ok) return gp;
      const s0 = gp.value;

      // Idempotent: om ingen aktiv round finns (t.ex. redan clearad/abortad via annan väg),
      // gör inget och bumpa inte.
      if (s0.activeRound === null) return ok({ snapshot: s0, effects: [] });

      // Abort lämnar inte kvar någon round i snapshot.
      return ok({ snapshot: bump({ ...s0, activeRound: null }), effects: [] });
    }

    default: {
      const _exhaustive: never = c;
      return _exhaustive;
    }
  }
}
