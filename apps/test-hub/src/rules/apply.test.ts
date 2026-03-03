// apps/test-hub/src/rules/apply.test.ts

import { describe, expect, it } from 'vitest';
import { apply } from '@app/rules';
import type { Actor, GameSnapshot, Result, KnownError } from '@app/model';

const system: Actor = { kind: 'SYSTEM' };
const host10: Actor = { kind: 'PLAYER', playerId: 10 };
const player2: Actor = { kind: 'PLAYER', playerId: 2 };

function unwrap<T>(r: Result<T, KnownError>): T {
  if (!r.ok) throw new Error(`Expected ok, got err: ${JSON.stringify(r.error)}`);
  return r.value;
}

function createGameWithPlayers(players: Array<{ playerId: number; isHost: boolean }>): GameSnapshot {
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

describe('players + host + minPlayers gating + remove-player termination', () => {
  it('happy path: add players -> host starts -> create round -> begin -> prediction -> lock -> reveal', () => {
    const lobby = createGameWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const started = unwrap(apply({ snapshot: lobby, actor: host10, command: { type: 'GAME_START' } }));

    const withRound = unwrap(
      apply({
        snapshot: started.snapshot,
        actor: system,
        command: { type: 'ROUND_CREATE_SYSTEM', roundId: 100, oraclePlayerId: 10 },
      }),
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

    expect(revealed.snapshot.state).toBe('IN_PROGRESS');
    expect(revealed.snapshot.activeRound?.state).toBe('REVEALED');
  });

  it('start is host-only', () => {
    const lobby = createGameWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const r = apply({ snapshot: lobby, actor: player2, command: { type: 'GAME_START' } });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(403);
      expect(r.error.code).toBe('FORBIDDEN');
      expect(r.error.reason).toBe('HOST_ONLY');
    }
  });

  it('start requires a host to exist', () => {
    const created = unwrap(
      apply({ snapshot: null, actor: system, command: { type: 'GAME_CREATE', gameId: 1 } }),
    );

    const add1 = unwrap(
      apply({
        snapshot: created.snapshot,
        actor: system,
        command: { type: 'PLAYER_ADD_SYSTEM', playerId: 10, isHost: false },
      }),
    );

    const add2 = unwrap(
      apply({
        snapshot: add1.snapshot,
        actor: system,
        command: { type: 'PLAYER_ADD_SYSTEM', playerId: 2, isHost: false },
      }),
    );

    const add3 = unwrap(
      apply({
        snapshot: add2.snapshot,
        actor: system,
        command: { type: 'PLAYER_ADD_SYSTEM', playerId: 3, isHost: false },
      }),
    );

    const player10: Actor = { kind: 'PLAYER', playerId: 10 };
    const r = apply({ snapshot: add3.snapshot, actor: player10, command: { type: 'GAME_START' } });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(409);
      expect(r.error.code).toBe('CONFLICT');
      expect(r.error.reason).toBe('HOST_REQUIRED');
    }
  });

  it('start requires at least 3 players', () => {
    const lobby = createGameWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
    ]);

    const r = apply({ snapshot: lobby, actor: host10, command: { type: 'GAME_START' } });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(409);
      expect(r.error.code).toBe('CONFLICT');
      expect(r.error.reason).toBe('MIN_PLAYERS_REQUIRED');
    }
  });

  it('cannot add a second host', () => {
    const lobby = createGameWithPlayers([{ playerId: 10, isHost: true }]);

    const r = apply({
      snapshot: lobby,
      actor: system,
      command: { type: 'PLAYER_ADD_SYSTEM', playerId: 99, isHost: true },
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(409);
      expect(r.error.code).toBe('CONFLICT');
      expect(r.error.reason).toBe('HOST_ALREADY_EXISTS');
    }
  });

  it('host cannot be removed', () => {
    const lobby = createGameWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const r = apply({ snapshot: lobby, actor: system, command: { type: 'PLAYER_REMOVE_SYSTEM', playerId: 10 } });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(409);
      expect(r.error.code).toBe('CONFLICT');
      expect(r.error.reason).toBe('HOST_CANNOT_BE_REMOVED');
    }
  });

  it('remove leading to <3 players finishes game and aborts active round if needed', () => {
    const lobby = createGameWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const started = unwrap(apply({ snapshot: lobby, actor: host10, command: { type: 'GAME_START' } }));

    const withRound = unwrap(
      apply({
        snapshot: started.snapshot,
        actor: system,
        command: { type: 'ROUND_CREATE_SYSTEM', roundId: 1, oraclePlayerId: 10 },
      }),
    );

    const begun = unwrap(apply({ snapshot: withRound.snapshot, actor: host10, command: { type: 'ROUND_BEGIN' } }));

    const removed = unwrap(
      apply({
        snapshot: begun.snapshot,
        actor: system,
        command: { type: 'PLAYER_REMOVE_SYSTEM', playerId: 2 },
      }),
    );

    expect(removed.snapshot.players.map((p) => p.playerId).sort((a, b) => a - b)).toEqual([3, 10]);
    expect(removed.snapshot.state).toBe('FINISHED');
    expect(removed.snapshot.activeRound?.state).toBe('ABORTED');
  });

  it('lock requires prediction (in GUESSING)', () => {
    const lobby = createGameWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const started = unwrap(apply({ snapshot: lobby, actor: host10, command: { type: 'GAME_START' } }));

    const withRound = unwrap(
      apply({
        snapshot: started.snapshot,
        actor: system,
        command: { type: 'ROUND_CREATE_SYSTEM', roundId: 1, oraclePlayerId: 10 },
      }),
    );

    const begun = unwrap(apply({ snapshot: withRound.snapshot, actor: host10, command: { type: 'ROUND_BEGIN' } }));

    const r = apply({ snapshot: begun.snapshot, actor: host10, command: { type: 'ROUND_LOCK' } });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(409);
      expect(r.error.code).toBe('CONFLICT');
      expect(r.error.reason).toBe('PREDICTION_REQUIRED');
    }
  });

  it('oracle-only: non-oracle player cannot set prediction', () => {
    const lobby = createGameWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const started = unwrap(apply({ snapshot: lobby, actor: host10, command: { type: 'GAME_START' } }));

    const withRound = unwrap(
      apply({
        snapshot: started.snapshot,
        actor: system,
        command: { type: 'ROUND_CREATE_SYSTEM', roundId: 1, oraclePlayerId: 10 },
      }),
    );

    const begun = unwrap(apply({ snapshot: withRound.snapshot, actor: host10, command: { type: 'ROUND_BEGIN' } }));

    const r = apply({
      snapshot: begun.snapshot,
      actor: player2,
      command: { type: 'ROUND_SET_PREDICTION', difficulty: 'EASY' },
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(403);
      expect(r.error.code).toBe('FORBIDDEN');
      expect(r.error.reason).toBe('ORACLE_ONLY');
    }
  });

  it('abort is system-only and idempotent on ABORTED', () => {
    const lobby = createGameWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const started = unwrap(apply({ snapshot: lobby, actor: host10, command: { type: 'GAME_START' } }));

    const withRound = unwrap(
      apply({
        snapshot: started.snapshot,
        actor: system,
        command: { type: 'ROUND_CREATE_SYSTEM', roundId: 1, oraclePlayerId: 10 },
      }),
    );

    const aborted1 = unwrap(
      apply({ snapshot: withRound.snapshot, actor: system, command: { type: 'ROUND_ABORT_SYSTEM' } }),
    );

    const aborted2 = unwrap(
      apply({ snapshot: aborted1.snapshot, actor: system, command: { type: 'ROUND_ABORT_SYSTEM' } }),
    );

    expect(aborted1.snapshot.activeRound?.state).toBe('ABORTED');
    expect(aborted2.snapshot).toEqual(aborted1.snapshot);
  });

  it('round commands require IN_PROGRESS (example: create round in LOBBY)', () => {
    const lobby = createGameWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const r = apply({
      snapshot: lobby,
      actor: system,
      command: { type: 'ROUND_CREATE_SYSTEM', roundId: 1, oraclePlayerId: 10 },
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(409);
      expect(r.error.code).toBe('CONFLICT');
      expect(r.error.reason).toBe('GAME_NOT_IN_PROGRESS');
    }
  });
});
