# docs/05-performance.md

## Syfte

Detta dokument definierar Performance och hur Performance används i en Round.

# NORMATIVT: Definition

Performance separerar spelhändelsen (Round) från den konkreta uppspelningen (Recording).

En Performance är den Recording som är aktuell i en Round vid ett givet tillfälle.

# NORMATIVT: Struktur

- Performance är en instans av en Recording.
- En Round kan referera flera Performances över tid.
- En Round har högst en aktiv Performance.
- I tillståndet `GUESSING` ska exakt en Performance vara aktiv.
- Endast aktiv Performance ligger till grund för bedömning och tilldelning.

Performance har ingen egen state machine.

# NORMATIVT: Första Performance

När en Round startas i tillståndet `WAITING_FOR_DJ`:

- en Performance skapas
- den sätts som aktiv
- RoundState sätts till `GUESSING`

# NORMATIVT: Ersättning av Performance

En aktiv Performance kan ersättas endast när Round är i tillståndet `GUESSING`.

Ersättning innebär att:

- en ny Performance skapas
- den sätts som aktiv
- den tidigare Performancen upphör att vara aktiv

RoundState ändras inte vid ersättning.

# NORMATIVT: Konsekvenser av ersättning

När en Performance ersätts under `GUESSING`:

- Alla Guess kopplade till den ersatta Performancen upphör att gälla.
- Alla Jokers som spenderats på den ersatta Performancen återförs till respektive Player.

Den nya aktiva Performancen behandlas som en ny gissningssituation.
