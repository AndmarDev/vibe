// libs/rules/src/apply.ts

import type {
  Actor,
  ActiveCycle,
  ActiveRound,
  GameSnapshot,
  KnownError,
  Player,
  PlayerId,
  RoundId,
  Result,
  PerformanceId,
  ActivePerformance,
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

// Lägg till en player i snapshot, antingen host eller vanlig player (icke-host)
function applyPlayerAdd(s0: GameSnapshot, playerId: PlayerId, isHostFlag: boolean): Result<GameSnapshot, KnownError> {
  if (s0.state === 'FINISHED') return err(conflict('GAME_ALREADY_FINISHED'));
  if (s0.state !== 'LOBBY') return err(conflict('GAME_NOT_IN_LOBBY'));

  if (s0.players.some((p) => p.playerId === playerId)) return err(conflict('PLAYER_ALREADY_EXISTS'));

  if (isHostFlag) {
    const existingHost = s0.players.find((p) => p.isHost);
    if (existingHost) return err(conflict('HOST_ALREADY_EXISTS'));
  }

  const joinIndex = nextJoinIndex(s0.players);
  const players1 = [...s0.players, { playerId, isHost: isHostFlag, joinIndex }];

  return ok({ ...s0, players: players1 });
}

function applyPlayerRemove(s0: GameSnapshot, removeId: number): Result<GameSnapshot, KnownError> {
  if (s0.state === 'FINISHED') return err(conflict('GAME_ALREADY_FINISHED'));

  const target = s0.players.find((p) => p.playerId === removeId);
  if (!target) return err(conflict('PLAYER_NOT_FOUND'));
  if (target.isHost) return err(conflict('HOST_CANNOT_BE_REMOVED'));

  // remove ur players (kvarvarande-lista)
  let players1 = s0.players.filter((p) => p.playerId !== removeId);

  // minPlayers termination (2A/2C): <3 => FINISHED och activeRound = null via finishGameIfNotFinished
  if (players1.length < 3) {
    return ok(finishGameIfNotFinished({ ...s0, players: players1 }));
  }

  // cycle/round interaction (vi har redan denna logik i din nuvarande PLAYER_REMOVE_SYSTEM)
  // Vi återanvänder samma logik genom att köra den via "lokala variabler" och skriva tillbaka.
  let round1 = s0.activeRound;
  let cycle1 = s0.activeCycle;
  let perf1 = s0.activePerformance;

  let shouldClearRoundAndPerf = false;

  if (s0.state === 'IN_PROGRESS' && cycle1) {
    // Oracle-remove under pågående round => abort + clear
    if (round1 && round1.state !== 'REVEALED' && round1.state !== 'ABORTED') {
      if (round1.oraclePlayerId === removeId) {
        // Flagga att vi behöver cleara round och performance
        shouldClearRoundAndPerf = true;
      }
    }

    // Invariant: rotation ⊆ players (oavsett cycle state)
    const oldRotation = cycle1.rotation;
    const newRotation = oldRotation.filter((id) => id !== removeId);

    let newIndex = cycle1.rotationIndex;

    if (cycle1.state === 'ACTIVE') {
      const oldIndex = cycle1.rotationIndex;
      const removedPos = oldRotation.indexOf(removeId);
      if (removedPos !== -1 && removedPos < oldIndex) newIndex = oldIndex - 1;

      if (newIndex < 0) newIndex = 0;
      if (newIndex > newRotation.length) newIndex = newRotation.length;
    } else {
      if (newIndex > newRotation.length) newIndex = newRotation.length;
      if (newIndex < 0) newIndex = 0;
    }

    cycle1 = { ...cycle1, rotation: newRotation, rotationIndex: newIndex };

    // Post-condition: boundary kan bara sättas om ingen activeRound finns kvar
    if (cycle1.state === 'ACTIVE' && round1 === null && cycle1.rotationIndex >= cycle1.rotation.length) {
      cycle1 = { ...cycle1, state: 'BOUNDARY_DECISION' };
    }
  }

  // Kolla flaggan om vi behöver cleara round och performance
  if (shouldClearRoundAndPerf) {
    round1 = null;
    perf1 = null;
  }

  return ok({ ...s0, players: players1, activeRound: round1, activePerformance: perf1, activeCycle: cycle1 });
}

// "Ren" domänlogik: inga state-guards (IN_PROGRESS/CYCLE_ACTIVE), ingen bump.
// Förväntar sig att caller redan har validerat att game är IN_PROGRESS och cycle är ACTIVE.
function createRoundInActiveCycle(s0: GameSnapshot, cycle: ActiveCycle, roundId: RoundId): Result<GameSnapshot, KnownError> {
  if (s0.activeRound !== null) return err(conflict('ROUND_ALREADY_EXISTS'));

  if (cycle.rotationIndex >= cycle.rotation.length) {
    return err(conflict('ROTATION_EXHAUSTED'));
  }

  const oraclePlayerId = cycle.rotation[cycle.rotationIndex];

  const s1: GameSnapshot = {
    ...s0,
    activeRound: {
      roundId,
      state: 'READY',
      oraclePlayerId,
      prediction: null,
    },
  };

  return ok(s1);
}

function applyRoundCreate(s0: GameSnapshot, roundId: RoundId): Result<GameSnapshot, KnownError> {
  const gp = requireGameInProgress(s0);
  if (!gp.ok) return gp;

  const s = gp.value;

  const cr = requireCycleActive(s);
  if (!cr.ok) return cr;

  const cycle = cr.value;

  return createRoundInActiveCycle(s, cycle, roundId);
}

function clearRoundAndPerformance(s0: GameSnapshot): GameSnapshot {
  // Invariant-hygien: om rounden försvinner ska performance också försvinna.
  if (s0.activeRound === null && s0.activePerformance === null) return s0; // idempotent, behåll referens
  return { ...s0, activeRound: null, activePerformance: null };
}

// Helper: ingen bump här. Caller ansvarar för exakt en bump.
function finishGameIfNotFinished(s0: GameSnapshot): GameSnapshot {
  if (s0.state === 'FINISHED') return s0;

  // Policy: FINISHED lämnar inget "hängande" i snapshot.
  const cleared = clearRoundAndPerformance(s0);

  return {
    ...cleared,
    state: 'FINISHED',
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
        activePerformance: null,
      };
      return ok({ snapshot: s, effects: [] });
    }

    case 'PLAYER_ADD_SYSTEM': { // internal only
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      // lägg till host eller vanlig player (icke-host)
      const r1 = applyPlayerAdd(s0r.value, c.playerId, c.isHost);
      if (!r1.ok) return r1;

      return ok({ snapshot: bump(r1.value), effects: [] });
    }

    case 'PLAYER_ADD': {
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;
      const s0 = s0r.value;

      const hr = requireHostActor(actor, s0);
      if (!hr.ok) return hr;

      // lägg till vanlig player (icke-host)
      const r1 = applyPlayerAdd(s0, c.playerId, false);
      if (!r1.ok) return r1;

      return ok({ snapshot: bump(r1.value), effects: [] });
    }

    case 'PLAYER_REMOVE_SYSTEM': { // internal only
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const r1 = applyPlayerRemove(s0r.value, c.playerId);
      if (!r1.ok) return r1;

      return ok({ snapshot: bump(r1.value), effects: [] });
    }

    case 'PLAYER_REMOVE': {
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;
      const s0 = s0r.value;

      const hr = requireHostActor(actor, s0);
      if (!hr.ok) return hr;

      const r1 = applyPlayerRemove(s0, c.playerId);
      if (!r1.ok) return r1;

      return ok({ snapshot: bump(r1.value), effects: [] });
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

    case 'GAME_FINISH_SYSTEM': { // internal only
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const s0 = s0r.value;
      const s1 = finishGameIfNotFinished(s0);

      // idempotent: om inget ändrades, bumpa inte
      if (s1 === s0) return ok({ snapshot: s0, effects: [] });

      return ok({ snapshot: bump(s1), effects: [] });
    }

    case 'GAME_FINISH': {
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;
      const s0 = s0r.value;

      const hr = requireHostActor(actor, s0);
      if (!hr.ok) return hr;

      const s1 = finishGameIfNotFinished(s0);

      if (s1 === s0) return ok({ snapshot: s0, effects: [] });
      return ok({ snapshot: bump(s1), effects: [] });
    }

    case 'CYCLE_CREATE_SYSTEM': { // internal only
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

      const cleared = clearRoundAndPerformance(s0);

      const s1: GameSnapshot = {
        ...cleared,
        activeCycle: next,
      };

      return ok({ snapshot: bump(s1), effects: [] });
    }

    case 'ROUND_CREATE_SYSTEM': { // internal only
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const r1 = applyRoundCreate(s0r.value, c.roundId);
      if (!r1.ok) return r1;

      return ok({ snapshot: bump(r1.value), effects: [] });
    }

    case 'ROUND_CREATE': {
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;
      const s0 = s0r.value;

      const hr = requireHostActor(actor, s0);
      if (!hr.ok) return hr;

      const r1 = applyRoundCreate(s0, c.roundId);
      if (!r1.ok) return r1;

      return ok({ snapshot: bump(r1.value), effects: [] });
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

      const cleared = clearRoundAndPerformance(s0);

      const s1: GameSnapshot = {
        ...cleared,
        activeCycle: cycle2,
      };

      return ok({ snapshot: bump(s1), effects: [] });
    }

    case 'ROUND_ABORT_SYSTEM': { // internal only
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const gp = requireGameInProgress(s0r.value);
      if (!gp.ok) return gp;
      const s0 = gp.value;

      const s1 = clearRoundAndPerformance(s0);

      // idempotent: om inget ändrades, bumpa inte
      if (s1 === s0) return ok({ snapshot: s0, effects: [] });

      return ok({ snapshot: bump(s1), effects: [] });
    }

    case 'ROUND_ABORT': {
      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const gp = requireGameInProgress(s0r.value);
      if (!gp.ok) return gp;
      const s0 = gp.value;

      const hr = requireHostActor(actor, s0);
      if (!hr.ok) return hr;

      const s1 = clearRoundAndPerformance(s0);

      // idempotent: om inget ändrades, bumpa inte
      if (s1 === s0) return ok({ snapshot: s0, effects: [] });

      return ok({ snapshot: bump(s1), effects: [] });
    }

    case 'PERFORMANCE_SET_SYSTEM': {
      if (!isSystem(actor)) return err(forbidden('SYSTEM_ONLY'));

      const s0r = requireSnapshot(snapshot);
      if (!s0r.ok) return s0r;

      const gp = requireGameInProgress(s0r.value);
      if (!gp.ok) return gp;
      const s0 = gp.value;

      const r0 = s0.activeRound;
      if (r0 === null) return err(conflict('ROUND_REQUIRED'));
      if (r0.state !== 'READY') return err(conflict('ROUND_NOT_IN_READY'));

      const perf: ActivePerformance = {
        performanceId: c.performanceId,
        trackRef: c.trackRef,
      };

      return ok({ snapshot: bump({ ...s0, activePerformance: perf }), effects: [] });
    }

    default: {
      const _exhaustive: never = c;
      return _exhaustive;
    }
  }
}
