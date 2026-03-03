// apps/test-hub/src/rules/apply.test.ts

import { describe, expect, it } from 'vitest';
import { apply } from '@app/rules';
import type { Actor, GameSnapshot, Result, KnownError, Difficulty } from '@app/model';

const system: Actor = { kind: 'SYSTEM' };
const host10: Actor = { kind: 'PLAYER', playerId: 10 };
const player2: Actor = { kind: 'PLAYER', playerId: 2 };

function unwrap<T>(r: Result<T, KnownError>): T {
  if (!r.ok) throw new Error(`Expected ok, got err: ${JSON.stringify(r.error)}`);
  return r.value;
}

function createLobbyWithPlayers(players: Array<{ playerId: number; isHost: boolean }>): GameSnapshot {
  const created = unwrap(apply({ snapshot: null, actor: system, command: { type: 'GAME_CREATE', gameId: 1 } }));
  let s = created.snapshot;

  for (const p of players) {
    const added = unwrap(
      apply({
        snapshot: s,
        actor: system,
        command: { type: 'PLAYER_ADD_SYSTEM', playerId: p.playerId, isHost: p.isHost },
      }),
    );
    s = added.snapshot;
  }

  return s;
}

function startAndCreateCycle(lobby: GameSnapshot, cycleId: number): GameSnapshot {
  const started = unwrap(apply({ snapshot: lobby, actor: host10, command: { type: 'GAME_START' } }));
  const withCycle = unwrap(
    apply({
      snapshot: started.snapshot,
      actor: system,
      command: { type: 'CYCLE_CREATE_SYSTEM', cycleId },
    }),
  );
  return withCycle.snapshot;
}

function playRound(
  snapshot: GameSnapshot,
  roundId: number,
  oracle: Actor,
  difficulty: Difficulty,
): GameSnapshot {
  let s = snapshot;

  s = unwrap(apply({ snapshot: s, actor: system, command: { type: 'ROUND_CREATE_SYSTEM', roundId } })).snapshot;
  s = unwrap(apply({ snapshot: s, actor: oracle, command: { type: 'ROUND_BEGIN' } })).snapshot;
  s = unwrap(
    apply({ snapshot: s, actor: oracle, command: { type: 'ROUND_SET_PREDICTION', difficulty } }),
  ).snapshot;
  s = unwrap(apply({ snapshot: s, actor: oracle, command: { type: 'ROUND_LOCK' } })).snapshot;
  s = unwrap(apply({ snapshot: s, actor: oracle, command: { type: 'ROUND_REVEAL' } })).snapshot;

  return s;
}

describe('cycle + rotation + boundary (no remove-player interactions)', () => {
  it('rotation is deterministic: host first, then joinIndex order', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 7, isHost: false },
      { playerId: 2, isHost: false },
    ]);

    const s = startAndCreateCycle(lobby, 100);
    expect(s.activeCycle?.rotation).toEqual([10, 7, 2]);
    expect(s.activeCycle?.rotationIndex).toBe(0);
    expect(s.activeCycle?.state).toBe('ACTIVE');
  });

  it('round create uses rotation (no oracle input) and picks current oracle by rotationIndex', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const s0 = startAndCreateCycle(lobby, 1);

    const withRound = unwrap(
      apply({ snapshot: s0, actor: system, command: { type: 'ROUND_CREATE_SYSTEM', roundId: 500 } }),
    );

    expect(withRound.snapshot.activeRound?.oraclePlayerId).toBe(10);
    expect(withRound.snapshot.activeRound?.state).toBe('READY');
  });

  it('happy path: cycle -> create round -> begin -> prediction -> lock -> reveal updates rotationIndex', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const s0 = startAndCreateCycle(lobby, 1);

    const withRound = unwrap(
      apply({ snapshot: s0, actor: system, command: { type: 'ROUND_CREATE_SYSTEM', roundId: 100 } }),
    );

    const begun = unwrap(apply({ snapshot: withRound.snapshot, actor: host10, command: { type: 'ROUND_BEGIN' } }));

    const predicted = unwrap(
      apply({
        snapshot: begun.snapshot,
        actor: host10,
        command: { type: 'ROUND_SET_PREDICTION', difficulty: 'MEDIUM' },
      }),
    );

    const locked = unwrap(apply({ snapshot: predicted.snapshot, actor: host10, command: { type: 'ROUND_LOCK' } }));

    const revealed = unwrap(apply({ snapshot: locked.snapshot, actor: host10, command: { type: 'ROUND_REVEAL' } }));

    expect(revealed.snapshot.activeRound).toBe(null);
    expect(revealed.snapshot.activeCycle?.rotationIndex).toBe(1);
    expect(revealed.snapshot.activeCycle?.state).toBe('ACTIVE');
  });

  it('after last oracle reveals, cycle enters BOUNDARY_DECISION', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    let s = startAndCreateCycle(lobby, 1);
    const p3: Actor = { kind: 'PLAYER', playerId: 3 };

    s = playRound(s, 1, host10, 'EASY');
    s = playRound(s, 2, player2, 'EASY');
    s = playRound(s, 3, p3, 'EASY');

    expect(s.activeCycle?.rotationIndex).toBe(3);
    expect(s.activeCycle?.state).toBe('BOUNDARY_DECISION');
    expect(s.activeRound).toBe(null);
  });

  it('cycle decide is host-only (in boundary)', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    let s = startAndCreateCycle(lobby, 1);
    const p3: Actor = { kind: 'PLAYER', playerId: 3 };

    s = playRound(s, 1, host10, 'EASY');
    s = playRound(s, 2, player2, 'EASY');
    s = playRound(s, 3, p3, 'EASY');

    expect(s.activeCycle?.state).toBe('BOUNDARY_DECISION');
    expect(s.activeRound).toBe(null);

    const r = apply({
      snapshot: s,
      actor: player2,
      command: { type: 'CYCLE_DECIDE', decision: 'FINISH_GAME' },
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(403);
      expect(r.error.code).toBe('FORBIDDEN');
      expect(r.error.reason).toBe('HOST_ONLY');
    }
  });

  it('cycle decide FINISH_GAME finishes the game (when in boundary with revealed round)', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    // Snabb väg: spela igenom 3 oracle-turer för att nå boundary.
    let s = startAndCreateCycle(lobby, 1);

    const p3: Actor = { kind: 'PLAYER', playerId: 3 };

    s = playRound(s, 1, host10, 'EASY');
    s = playRound(s, 2, player2, 'EASY');
    s = playRound(s, 3, p3, 'EASY');

    expect(s.activeCycle?.state).toBe('BOUNDARY_DECISION');
    expect(s.activeRound).toBe(null);

    const finished = unwrap(
      apply({
        snapshot: s,
        actor: host10,
        command: { type: 'CYCLE_DECIDE', decision: 'FINISH_GAME' },
      }),
    );

    expect(finished.snapshot.state).toBe('FINISHED');
  });

  it('cycle decide START_NEXT replaces cycle and clears activeRound', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    // nå boundary på samma sätt som ovan
    let s = startAndCreateCycle(lobby, 1);
    const p3: Actor = { kind: 'PLAYER', playerId: 3 };

    s = playRound(s, 1, host10, 'EASY');
    s = playRound(s, 2, player2, 'EASY');
    s = playRound(s, 3, p3, 'EASY');

    expect(s.activeCycle?.state).toBe('BOUNDARY_DECISION');
    expect(s.activeRound).toBe(null);

    const next = unwrap(
      apply({
        snapshot: s,
        actor: host10,
        command: { type: 'CYCLE_DECIDE', decision: 'START_NEXT', nextCycleId: 2 },
      }),
    );

    expect(next.snapshot.activeRound).toBe(null);
    expect(next.snapshot.activeCycle?.cycleId).toBe(2);
    expect(next.snapshot.activeCycle?.state).toBe('ACTIVE');
    expect(next.snapshot.activeCycle?.rotationIndex).toBe(0);
    expect(next.snapshot.activeCycle?.rotation).toEqual([10, 2, 3]);
  });

  it('rotation exhausted: cannot create a round after rotationIndex reaches rotation length', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    let s = startAndCreateCycle(lobby, 1);
    const p3: Actor = { kind: 'PLAYER', playerId: 3 };

    // spela tre rounds för att få rotationIndex=3 och cycle boundary
    s = playRound(s, 1, host10, 'EASY');
    s = playRound(s, 2, player2, 'EASY');
    s = playRound(s, 3, p3, 'EASY');

    expect(s.activeCycle?.rotationIndex).toBe(3);
    expect(s.activeCycle?.state).toBe('BOUNDARY_DECISION');

    const r = apply({ snapshot: s, actor: system, command: { type: 'ROUND_CREATE_SYSTEM', roundId: 4 } });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(409);
      expect(r.error.code).toBe('CONFLICT');
      expect(r.error.reason).toBe('CYCLE_NOT_IN_ACTIVE');
    }
  });
});
