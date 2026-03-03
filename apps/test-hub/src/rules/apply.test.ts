// apps/test-hub/src/rules/apply.test.ts

import { describe, expect, it } from 'vitest';
import { apply } from '@app/rules';
import type { Actor, GameSnapshot, Result, KnownError } from '@app/model';

const system: Actor = { kind: 'SYSTEM' };
const oracle10: Actor = { kind: 'PLAYER', playerId: 10 };
const player2: Actor = { kind: 'PLAYER', playerId: 2 };

function unwrap<T>(r: Result<T, KnownError>): T {
  if (!r.ok) throw new Error(`Expected ok, got err: ${JSON.stringify(r.error)}`);
  return r.value;
}

describe('step1: minimal game+round machine w/ actor + typed errors', () => {
  it('happy path: create -> start -> create round -> begin -> prediction -> lock -> reveal', () => {
    const created = unwrap(
      apply({ snapshot: null, actor: system, command: { type: 'GAME_CREATE', gameId: 1 } }),
    );

    const started = unwrap(
      apply({ snapshot: created.snapshot, actor: system, command: { type: 'GAME_START_SYSTEM' } }),
    );

    const withRound = unwrap(
      apply({
        snapshot: started.snapshot,
        actor: system,
        command: { type: 'ROUND_CREATE_SYSTEM', roundId: 100, oraclePlayerId: 10 },
      }),
    );

    const begun = unwrap(
      apply({ snapshot: withRound.snapshot, actor: oracle10, command: { type: 'ROUND_BEGIN' } }),
    );

    const predicted = unwrap(
      apply({
        snapshot: begun.snapshot,
        actor: oracle10,
        command: { type: 'ROUND_SET_PREDICTION', difficulty: 'MEDIUM' },
      }),
    );

    const locked = unwrap(
      apply({ snapshot: predicted.snapshot, actor: oracle10, command: { type: 'ROUND_LOCK' } }),
    );

    const revealed = unwrap(
      apply({ snapshot: locked.snapshot, actor: oracle10, command: { type: 'ROUND_REVEAL' } }),
    );

    expect(revealed.snapshot.state).toBe('IN_PROGRESS');
    expect(revealed.snapshot.activeRound?.state).toBe('REVEALED');
  });

  it('lock requires prediction (in GUESSING)', () => {
    const created = unwrap(
      apply({ snapshot: null, actor: system, command: { type: 'GAME_CREATE', gameId: 1 } }),
    );
    const started = unwrap(
      apply({ snapshot: created.snapshot, actor: system, command: { type: 'GAME_START_SYSTEM' } }),
    );
    const withRound = unwrap(
      apply({
        snapshot: started.snapshot,
        actor: system,
        command: { type: 'ROUND_CREATE_SYSTEM', roundId: 1, oraclePlayerId: 10 },
      }),
    );
    const begun = unwrap(
      apply({ snapshot: withRound.snapshot, actor: oracle10, command: { type: 'ROUND_BEGIN' } }),
    );

    const r = apply({ snapshot: begun.snapshot, actor: oracle10, command: { type: 'ROUND_LOCK' } });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(409);
      expect(r.error.code).toBe('CONFLICT');
      expect(r.error.reason).toBe('PREDICTION_REQUIRED');
    }
  });

  it('oracle-only: non-oracle player cannot set prediction', () => {
    const created = unwrap(
      apply({ snapshot: null, actor: system, command: { type: 'GAME_CREATE', gameId: 1 } }),
    );
    const started = unwrap(
      apply({ snapshot: created.snapshot, actor: system, command: { type: 'GAME_START_SYSTEM' } }),
    );
    const withRound = unwrap(
      apply({
        snapshot: started.snapshot,
        actor: system,
        command: { type: 'ROUND_CREATE_SYSTEM', roundId: 1, oraclePlayerId: 10 },
      }),
    );
    const begun = unwrap(
      apply({ snapshot: withRound.snapshot, actor: oracle10, command: { type: 'ROUND_BEGIN' } }),
    );

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
    const created = unwrap(
      apply({ snapshot: null, actor: system, command: { type: 'GAME_CREATE', gameId: 1 } }),
    );
    const started = unwrap(
      apply({ snapshot: created.snapshot, actor: system, command: { type: 'GAME_START_SYSTEM' } }),
    );
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
    const created = unwrap(
      apply({ snapshot: null, actor: system, command: { type: 'GAME_CREATE', gameId: 1 } }),
    );

    const r = apply({
      snapshot: created.snapshot,
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
