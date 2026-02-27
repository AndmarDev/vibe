# docs/05-performance.md

# Syfte

Detta dokument definierar Performance.

Performance är den konkreta instansen av en Recording som används i en Round.

Round är spelhändelsen.
Performance är den aktuella låten som spelas och gissas på.

# NORMATIVT: Definition

En Performance är en instans av en Recording som används i en Round.

- En Performance tillhör exakt en Round.
- En Round kan över tid referera flera Performances.
- En Round har alltid högst en aktiv Performance.
- Performance har ingen egen state machine. Den styrs helt av RoundState.

# NORMATIVT: Aktiv Performance

- En Round har högst en aktiv Performance åt gången.
- I tillståndet `GUESSING` ska exakt en Performance vara aktiv.
- Alla Guess gäller alltid aktiv Performance.
- Oracle Prediction gäller alltid aktiv Performance.
- Bedömning och tilldelning baseras på den Performance som är aktiv
  i det ögonblick då Round går från `GUESSING` till `LOCKED`.

# NORMATIVT: Första Performance

När en Round övergår från `READY` till `GUESSING`:

- en Performance skapas
- den sätts som aktiv
- Oracle får tillgång till facit (year, title, artist)
- Host kan spela upp låten

# NORMATIVT: Byte av Performance

Aktiv Performance kan ersättas endast när Round är i `GUESSING`.

Byte triggas av Host.

Byte innebär att:

- en ny Performance skapas
- den sätts som aktiv
- tidigare Performance upphör att vara aktiv

RoundState ändras inte vid byte.

Byte av Performance påverkar inte Oracle-rotation och räknas inte som en avslutad Oracle-tur.

# NORMATIVT: Reset vid Performance-byte

När en Performance ersätts under `GUESSING` ska Roundens
gissningskontext återställas för den tidigare Performancen:

- Alla Guesses kopplade till den tidigare Performancen upphör att gälla.
- Alla registrerade Joker-användningar kopplade till den tidigare Performancen annulleras.
- Oracle Prediction för den tidigare Performancen ogiltigförklaras.

Annullerad Joker-användning påverkar inte Joker-saldot.

Den nya Performancen behandlas som en helt ny gissningssituation.

Oracle måste lämna en ny Prediction för den nya Performancen innan Round kan låsas.
