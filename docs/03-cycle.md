# docs/03-cycle.md

## Syfte

Detta dokument definierar Cycle.

En Cycle är ett varv runt bordet där varje Player är DJ varsin gång.

Cycle strukturerar DJ-rotation och skapar en naturlig paus där spelet kan fortsätta eller avslutas.

# NORMATIVT: CycleState

Varje Cycle har exakt ett av följande tillstånd:

- `ACTIVE`
- `BOUNDARY_DECISION`
- `FINISHED`

## ACTIVE

Cycle pågår.

- Rounds skapas sekventiellt.
- För varje Round i denna Cycle utses exakt en DJ.
- En Player kan vara DJ högst en gång per Cycle.

Endast Players som fortfarande ingår i Game beaktas vid DJ-rotation.

Om en Player tas bort under en Cycle ingår den Playern inte längre i DJ-rotationen.
Borttagning under en pågående Round regleras i `04-round`.

När alla kvarvarande Players har varit DJ exakt en gång, och sista
Round i Cycle är avslutad, övergår Cycle till `BOUNDARY_DECISION`.

## BOUNDARY_DECISION

Cycle är avslutad och väntar på beslut.

- Inga nya Rounds skapas i denna Cycle.
- Creator väljer att:
  - starta en ny Cycle, eller
  - avsluta Game.

Om antalet kvarvarande Players är färre än `minPlayers` kan ingen ny Cycle startas.

När beslut fattas övergår denna Cycle till `FINISHED`.

## FINISHED

Cycle är avslutad.

- Inga nya Rounds skapas i denna Cycle.

# NORMATIVT: DJ-rotation

Creator är första DJ i spelet.

DJ-rotation definieras per Cycle:

- DJ utses enligt Players join-ordning.
- Varje Player är DJ en gång per Cycle.
- Endast Players som fortfarande ingår i Game beaktas.

Rotationen påverkas inte av:

- antal vunna Cards
- antal Jokrar

Om en Player tas bort före sin DJ-tur hoppar rotationen över den Playern.

# NORMATIVT: Relation till Round

- En Cycle består av 0..N Rounds.
- En Round tillhör exakt en Cycle.
- DJ för en Round utses enligt Cycle-rotationen.
- Endast en aktiv Round kan finnas per Cycle vid en given tidpunkt.
