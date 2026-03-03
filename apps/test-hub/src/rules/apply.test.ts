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

function playerIdsSorted(snapshot: GameSnapshot): number[] {
  return snapshot.players.map((p) => p.playerId).sort((a, b) => a - b);
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

describe('remove-player interactions with cycle/round', () => {
  it('remove non-host before their oracle turn: rotation drops id and index stays (next oracle shifts)', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
      { playerId: 4, isHost: false },
    ]);

    let s = startAndCreateCycle(lobby, 1);
    const p3: Actor = { kind: 'PLAYER', playerId: 3 };
    const p4: Actor = { kind: 'PLAYER', playerId: 4 };

    // host spelar sin tur => rotationIndex = 1 (nästa skulle varit 2)
    s = playRound(s, 1, host10, 'EASY');
    expect(s.activeCycle?.rotation).toEqual([10, 2, 3, 4]);
    expect(s.activeCycle?.rotationIndex).toBe(1);

    // ta bort player2 (nästa oracle)
    const removed = unwrap(
      apply({ snapshot: s, actor: system, command: { type: 'PLAYER_REMOVE_SYSTEM', playerId: 2 } }),
    ).snapshot;

    expect(playerIdsSorted(removed)).toEqual([3, 4, 10]);
    expect(removed.activeCycle?.rotation).toEqual([10, 3, 4]);
    expect(removed.activeCycle?.rotationIndex).toBe(1); // pekar nu på 3
    expect(removed.activeRound).toBe(null);
    expect(removed.activeCycle?.state).toBe('ACTIVE');

    // sanity: nästa round ska få oracle=3
    const withRound = unwrap(
      apply({ snapshot: removed, actor: system, command: { type: 'ROUND_CREATE_SYSTEM', roundId: 2 } }),
    );
    expect(withRound.snapshot.activeRound?.oraclePlayerId).toBe(p3.playerId);
  });

  it('remove non-host after their oracle turn: rotation drops id and index shifts back by 1', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
      { playerId: 4, isHost: false },
    ]);

    let s = startAndCreateCycle(lobby, 1);
    const p2: Actor = { kind: 'PLAYER', playerId: 2 };

    // host tur + player2 tur => rotationIndex = 2 (nästa är 3)
    s = playRound(s, 1, host10, 'EASY');
    s = playRound(s, 2, p2, 'EASY');
    expect(s.activeCycle?.rotationIndex).toBe(2);

    const removed = unwrap(
      apply({ snapshot: s, actor: system, command: { type: 'PLAYER_REMOVE_SYSTEM', playerId: 2 } }),
    ).snapshot;

    expect(removed.activeCycle?.rotation).toEqual([10, 3, 4]);
    expect(removed.activeCycle?.rotationIndex).toBe(1); // 2 låg före oldIndex=2 => -1
  });

  it('remove current oracle during GUESSING aborts round atomärt, keeps rotationIndex, and removes oracle from rotation', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
      { playerId: 4, isHost: false },
    ]);

    let s = startAndCreateCycle(lobby, 1);
    const p2: Actor = { kind: 'PLAYER', playerId: 2 };

    // host tur => rotationIndex = 1 (nästa oracle = 2)
    s = playRound(s, 1, host10, 'EASY');

    // skapa round 2 (oracle=2) och börja (GUESSING)
    s = unwrap(apply({ snapshot: s, actor: system, command: { type: 'ROUND_CREATE_SYSTEM', roundId: 2 } })).snapshot;
    s = unwrap(apply({ snapshot: s, actor: p2, command: { type: 'ROUND_BEGIN' } })).snapshot;
    expect(s.activeRound?.oraclePlayerId).toBe(2);
    expect(s.activeRound?.state).toBe('GUESSING');
    expect(s.activeCycle?.rotationIndex).toBe(1);

    // ta bort oracle=2 under GUESSING => round abort+clear, rotationIndex oförändrat
    const removed = unwrap(
      apply({ snapshot: s, actor: system, command: { type: 'PLAYER_REMOVE_SYSTEM', playerId: 2 } }),
    ).snapshot;

    expect(removed.activeRound).toBe(null);
    expect(removed.activeCycle?.rotation).toEqual([10, 3, 4]);
    expect(removed.activeCycle?.rotationIndex).toBe(1); // turen räknas inte

    // nästa round ska få oracle=3
    const withRound = unwrap(
      apply({ snapshot: removed, actor: system, command: { type: 'ROUND_CREATE_SYSTEM', roundId: 3 } }),
    );
    expect(withRound.snapshot.activeRound?.oraclePlayerId).toBe(3);
  });

  it('remove causing <3 players finishes game and aborts active round if needed', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    let s = startAndCreateCycle(lobby, 1);

    // starta en round så att finish måste aborta den
    s = unwrap(apply({ snapshot: s, actor: system, command: { type: 'ROUND_CREATE_SYSTEM', roundId: 1 } })).snapshot;
    s = unwrap(apply({ snapshot: s, actor: host10, command: { type: 'ROUND_BEGIN' } })).snapshot;

    const removed = unwrap(
      apply({ snapshot: s, actor: system, command: { type: 'PLAYER_REMOVE_SYSTEM', playerId: 2 } }),
    ).snapshot;

    expect(playerIdsSorted(removed)).toEqual([3, 10]);
    expect(removed.state).toBe('FINISHED');
    expect(removed.activeRound).toBe(null);
  });

  it('remove makes rotation exhausted early -> cycle enters BOUNDARY_DECISION (when no active round)', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
      { playerId: 4, isHost: false },
    ]);

    let s = startAndCreateCycle(lobby, 1);
    const p2: Actor = { kind: 'PLAYER', playerId: 2 };
    const p3: Actor = { kind: 'PLAYER', playerId: 3 };

    // host + 2 + 3 => rotationIndex = 3 (nästa skulle vara 4)
    s = playRound(s, 1, host10, 'EASY');
    s = playRound(s, 2, p2, 'EASY');
    s = playRound(s, 3, p3, 'EASY');

    expect(s.activeRound).toBe(null);
    expect(s.activeCycle?.state).toBe('ACTIVE');
    expect(s.activeCycle?.rotation).toEqual([10, 2, 3, 4]);
    expect(s.activeCycle?.rotationIndex).toBe(3);

    // ta bort sista framtida oracle (4) => rotation blir [10,2,3], index=3 => exhausted => boundary
    const removed = unwrap(
      apply({ snapshot: s, actor: system, command: { type: 'PLAYER_REMOVE_SYSTEM', playerId: 4 } })
    ).snapshot;

    expect(removed.activeCycle?.rotation).toEqual([10, 2, 3]);
    expect(removed.activeCycle?.rotationIndex).toBe(3);
    expect(removed.activeCycle?.state).toBe('BOUNDARY_DECISION');
    expect(removed.activeRound).toBe(null);
  });

  it('remove does not set BOUNDARY_DECISION while a round is active (post-condition)', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
      { playerId: 4, isHost: false },
    ]);

    let s = startAndCreateCycle(lobby, 1);
    const p2: Actor = { kind: 'PLAYER', playerId: 2 };
    const p3: Actor = { kind: 'PLAYER', playerId: 3 };
    const p4: Actor = { kind: 'PLAYER', playerId: 4 };

    // host + 2 + 3 => rotationIndex = 3 (nästa oracle = 4)
    s = playRound(s, 1, host10, 'EASY');
    s = playRound(s, 2, p2, 'EASY');
    s = playRound(s, 3, p3, 'EASY');

    expect(s.activeCycle?.rotation).toEqual([10, 2, 3, 4]);
    expect(s.activeCycle?.rotationIndex).toBe(3);
    expect(s.activeCycle?.state).toBe('ACTIVE');
    expect(s.activeRound).toBe(null);

    // skapa round 4 och börja => activeRound != null
    s = unwrap(apply({ snapshot: s, actor: system, command: { type: 'ROUND_CREATE_SYSTEM', roundId: 4 } })).snapshot;
    s = unwrap(apply({ snapshot: s, actor: p4, command: { type: 'ROUND_BEGIN' } })).snapshot;
    expect(s.activeRound?.state).toBe('GUESSING');

    // ta bort en icke-oracle (3) så att rotationen skulle bli "exhausted" (len minskar till 3, index=3)
    const removed = unwrap(
      apply({ snapshot: s, actor: system, command: { type: 'PLAYER_REMOVE_SYSTEM', playerId: 3 } }),
    ).snapshot;

    // round fortsätter, så boundary får inte sättas nu
    expect(removed.activeRound).not.toBe(null);
    expect(removed.activeCycle?.state).toBe('ACTIVE');
    expect(removed.activeCycle?.rotationIndex).toBe(2);
    // rotation uppdaterad (3 bort)
    expect(removed.activeCycle?.rotation).toEqual([10, 2, 4]);
    // nästa Oracle är fortfarande 4
    expect(removed.activeRound?.oraclePlayerId).toBe(4);
  });
});

describe('host triggers vs system triggers', () => {
  it('PLAYER_ADD is host-only', () => {
    const lobby = createLobbyWithPlayers([{ playerId: 10, isHost: true }]);

    const r = apply({
      snapshot: lobby,
      actor: player2,
      command: { type: 'PLAYER_ADD', playerId: 2 },
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(403);
      expect(r.error.code).toBe('FORBIDDEN');
      expect(r.error.reason).toBe('HOST_ONLY');
    }
  });

  it('PLAYER_REMOVE is host-only', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const r = apply({
      snapshot: lobby,
      actor: player2,
      command: { type: 'PLAYER_REMOVE', playerId: 3 },
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(403);
      expect(r.error.code).toBe('FORBIDDEN');
      expect(r.error.reason).toBe('HOST_ONLY');
    }
  });

  it('ROUND_CREATE is host-only', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const s = startAndCreateCycle(lobby, 1);
    expect(s.state).toBe('IN_PROGRESS');
    expect(s.activeCycle?.state).toBe('ACTIVE');
    expect(s.activeRound).toBe(null);

    const r = apply({
      snapshot: s,
      actor: player2,
      command: { type: 'ROUND_CREATE', roundId: 123 },
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(403);
      expect(r.error.code).toBe('FORBIDDEN');
      expect(r.error.reason).toBe('HOST_ONLY');
    }
  });

  it('ROUND_CREATE host vs system is transport-only (same snapshot except gameSeq)', () => {
    const lobbyA = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);
    const sA = startAndCreateCycle(lobbyA, 1);

    const hostCreated = unwrap(
      apply({ snapshot: sA, actor: host10, command: { type: 'ROUND_CREATE', roundId: 999 } }),
    ).snapshot;

    const lobbyB = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);
    const sB = startAndCreateCycle(lobbyB, 1);

    const systemCreated = unwrap(
      apply({ snapshot: sB, actor: system, command: { type: 'ROUND_CREATE_SYSTEM', roundId: 999 } }),
    ).snapshot;

    const { gameSeq: _a, ...a } = hostCreated;
    const { gameSeq: _b, ...b } = systemCreated;
    expect(a).toEqual(b);
  });

  it('GAME_FINISH is host-only', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const r = apply({
      snapshot: lobby,
      actor: player2,
      command: { type: 'GAME_FINISH' },
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(403);
      expect(r.error.code).toBe('FORBIDDEN');
      expect(r.error.reason).toBe('HOST_ONLY');
    }
  });

  it('host vs system commands are transport-only (same snapshot except gameSeq)', () => {
    const lobby0 = createLobbyWithPlayers([{ playerId: 10, isHost: true }]);

    const hostAdded = unwrap(
      apply({
        snapshot: lobby0,
        actor: host10,
        command: { type: 'PLAYER_ADD', playerId: 2 },
      }),
    ).snapshot;

    const lobby1 = createLobbyWithPlayers([{ playerId: 10, isHost: true }]);
    const systemAdded = unwrap(
      apply({
        snapshot: lobby1,
        actor: system,
        command: { type: 'PLAYER_ADD_SYSTEM', playerId: 2, isHost: false },
      }),
    ).snapshot;

    const { gameSeq: _a, ...a } = hostAdded;
    const { gameSeq: _b, ...b } = systemAdded;
    expect(a).toEqual(b);
  });
});


describe('host triggers round abort', () => {
  it('ROUND_ABORT is host-only', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    // Gör snapshot legitimt: IN_PROGRESS + cycle + aktiv round
    let s = startAndCreateCycle(lobby, 1);
    s = unwrap(apply({ snapshot: s, actor: system, command: { type: 'ROUND_CREATE_SYSTEM', roundId: 1 } })).snapshot;

    const r = apply({ snapshot: s, actor: player2, command: { type: 'ROUND_ABORT' } });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(403);
      expect(r.error.code).toBe('FORBIDDEN');
      expect(r.error.reason).toBe('HOST_ONLY');
    }
  });

  it('ROUND_ABORT clears activeRound and is idempotent (no bump when already null)', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    // in progress + cycle + create a round
    let s = startAndCreateCycle(lobby, 1);
    s = unwrap(apply({ snapshot: s, actor: system, command: { type: 'ROUND_CREATE_SYSTEM', roundId: 1 } })).snapshot;
    expect(s.activeRound).not.toBe(null);

    const aborted = unwrap(apply({ snapshot: s, actor: host10, command: { type: 'ROUND_ABORT' } })).snapshot;
    expect(aborted.gameSeq).toBe(s.gameSeq + 1);
    expect(aborted.activeRound).toBe(null);

    const seqBefore = aborted.gameSeq;
    const abortedAgain = unwrap(apply({ snapshot: aborted, actor: host10, command: { type: 'ROUND_ABORT' } })).snapshot;
    expect(abortedAgain.gameSeq).toBe(seqBefore); // ingen bump på idempotent no-op
  });

  it('ROUND_ABORT requires IN_PROGRESS', () => {
    const lobby = createLobbyWithPlayers([
      { playerId: 10, isHost: true },
      { playerId: 2, isHost: false },
      { playerId: 3, isHost: false },
    ]);

    const r = apply({ snapshot: lobby, actor: host10, command: { type: 'ROUND_ABORT' } });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(409);
      expect(r.error.code).toBe('CONFLICT');
      expect(r.error.reason).toBe('GAME_NOT_IN_PROGRESS');
    }
  });
});
