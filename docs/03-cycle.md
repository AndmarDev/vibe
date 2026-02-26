# docs/03-cycle.md

# Syfte

Detta dokument definierar Cycle.

En Cycle är ett varv runt bordet där varje Player är Oracle varsin gång.

Cycle strukturerar Oracle-rotation och skapar en naturlig paus där spelet kan fortsätta eller avslutas.

# NORMATIVT: CycleState

Varje Cycle har exakt ett av följande tillstånd:

- `ACTIVE`
- `BOUNDARY_DECISION`
- `FINISHED`

## ACTIVE

Cycle pågår.

- Rounds skapas sekventiellt.
- För varje Round i denna Cycle utses exakt en Oracle.
- En Player kan vara Oracle högst en gång per Cycle.

Endast Players som fortfarande ingår i Game beaktas vid Oracle-rotation.

Om en Player tas bort under en Cycle ingår den Playern inte längre i Oracle-rotationen.
Borttagning av Player under en pågående Round regleras i `04-round`.

När alla kvarvarande Players har genomfört exakt en Oracle-tur i denna Cycle,
och den senaste Rounden har nått `REVEALED`, övergår Cycle till `BOUNDARY_DECISION`.

## BOUNDARY_DECISION

Cycle är avslutad och väntar på beslut.

- Inga nya Rounds kan längre skapas i denna Cycle.
- Nya Players kan ansluta i detta tillstånd. En Player som ansluter nu ingår först
  i nästa Cycle och måste ange ett giltigt startår innan nästa Cycle kan starta.
- Host väljer att:
  - starta en ny Cycle, eller
  - avsluta Game.

När Host fattar beslut:

- Om Host väljer att starta en ny Cycle:
  - Den aktuella Cyclen övergår till `FINISHED`.
  - En ny Cycle skapas i state `ACTIVE`.

- Om Host väljer att avsluta Game:
  - Den aktuella Cyclen övergår till `FINISHED`.
  - Game övergår därefter till `FINISHED`.

## FINISHED

Cycle är avslutad.

- Inga nya Rounds skapas i denna Cycle.

# NORMATIVT: Oracle-rotation

Oracle-rotation definieras per Cycle och är deterministisk.

Oracle-rotationen för en Cycle beräknas från de Players som ingår i Game
när Cyclen skapas i state `ACTIVE`.
Players som ansluter i `BOUNDARY_DECISION` påverkar inte den avslutade Cyclen,
utan ingår först i rotationen för nästa Cycle.

- Host är alltid första Oracle i varje Cycle.
- Därefter följer övriga Players i join-ordning.
- Varje Player är Oracle exakt en gång per Cycle.
- Endast Players som fortfarande ingår i Game beaktas.

Rotationen påverkas inte av:

- antal vunna Cards
- antal Jokrar
- tidigare resultat

Om en Player tas bort före sin Oracle-tur hoppar rotationen över den Playern.

# NORMATIVT: Relation till Round

- En Cycle består av 0..N Rounds.
- En Round tillhör exakt en Cycle.
- Oracle för en Round utses enligt Cycle-rotationen.
- Endast en Round kan vara i state `READY`, `GUESSING`,
  `LOCKED` eller `REVEALED` per Cycle vid en given tidpunkt.

# NORMATIVT: Oracle-tur och avslutad Round

Rounds skapas sekventiellt i en Cycle.

En Oracle-tur räknas som genomförd endast när Rounden når `REVEALED`.

Om en Round når `REVEALED` anses den utsedda Oracle ha genomfört sin tur.
Nästa Round får nästa Oracle enligt Cycle-rotationen.

Om en Round övergår till `ABORTED` anses ingen Player ha genomfört någon Oracle-tur i den Rounden.
Detta gäller oavsett orsak till `ABORTED`, inklusive att Oracle har tagits bort under Rounden.
Om Round blev `ABORTED` utses Oracle för nästa Round deterministiskt:

- Om den senast utsedda Oracle fortfarande är kvarvarande → samma Oracle igen.
- Annars → nästa kvarvarande Player enligt Cycle-rotationen.

# NORMATIVT: Rättviseprincip

En Cycle är strukturerad så att varje kvarvarande Player
genomför exakt en Oracle-tur per Cycle.

Eftersom endast Cycles i state `FINISHED` räknas i slutlig ranking,
har alla Players som ingår i ranking varit Oracle lika många gånger.
