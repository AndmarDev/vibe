# docs/05-performance.md

## Syfte

Detta dokument definierar Performance.

Performance är den konkreta låt som används i en Round.
Round är spelhändelsen. Performance är den aktuella uppspelningen.

# NORMATIVT: Definition

En Performance är en instans av en Recording som används i en Round.

En Round kan över tid referera flera Performances,
men har alltid högst en aktiv Performance.

Performance har ingen egen state machine.
Den styrs helt av Round.

# NORMATIVT: Aktiv Performance

- En Round har högst en aktiv Performance åt gången.
- I tillståndet `GUESSING` ska exakt en Performance vara aktiv.
- Alla Guess gäller alltid aktiv Performance.
- Bedömning och tilldelning baseras på den Performance som är aktiv vid övergång till `REVEALED_TIMELINE`.

# NORMATIVT: Första Performance

När en Round startas i tillståndet `WAITING_FOR_DJ`:

- en Performance skapas
- den sätts som aktiv
- Round övergår till `GUESSING`

# NORMATIVT: Byte av Performance

Aktiv Performance kan ersättas när Round är i `GUESSING`.

Byte innebär att:

- en ny Performance skapas
- den sätts som aktiv
- tidigare Performance upphör att vara aktiv

RoundState ändras inte vid byte.

Byte av Performance när Round är i `GUESSING` påverkar
inte DJ-rotation och räknas inte som en avslutad DJ-tur.

# NORMATIVT: Konsekvenser av byte

När en Performance ersätts under `GUESSING`:

- Alla Guess kopplade till den tidigare Performancen upphör att gälla.
- Alla registrerade Joker-användningar för den tidigare Performancen annulleras.
- Annullerad användning påverkar inte Joker-saldot.

Den nya Performancen behandlas som en ny gissningssituation.

# NORMATIVT: Avgränsning

Performance reglerar inte:

- DJ-rotation
- tillståndsövergångar
- tilldelning av Cards
- tilldelning av Jokrar
- huruvida en `ABORTED` Round räknas som genomförd DJ-tur

Dessa regler ägs av andra dokument.
