# docs/03-cycle.md

## Syfte

Detta dokument definierar Cycle, som är varvet runt bordet i ett Game.

Cycle strukturerar turordningen för DJ-rollen
och skapar en tydlig gräns mellan varv.

## NORMATIVT: CycleState

Varje Cycle har exakt ett av följande tillstånd:

- `ACTIVE`
- `BOUNDARY_DECISION`
- `FINISHED`

## ACTIVE

Cycle pågår.

- Rounds skapas sekventiellt.
- För varje Round i denna Cycle utses exakt en DJ.
- En Player är DJ högst en gång per Cycle.

När alla kvarvarande Players har varit DJ, och sista Round
i Cycle är avslutad, övergår Cycle till `BOUNDARY_DECISION`.

## BOUNDARY_DECISION

Cycle är avslutad och väntar på beslut.

- Inga nya Rounds skapas i denna Cycle.
- Creator väljer att:
  - starta en ny Cycle, eller
  - avsluta Game.

När beslut fattas övergår denna Cycle till `FINISHED`.

## FINISHED

Cycle är avslutad.

- Inga nya Rounds skapas i denna Cycle.

## NORMATIVT: DJ-rotation

DJ-rotation definieras per Cycle:

- DJ för en Round i Cycle utses enligt Players join-ordning.
- En Player som redan varit DJ i Cycle kan inte bli DJ igen i samma Cycle.
- Endast Players som fortfarande ingår i Game beaktas.

## NORMATIVT: Relation till Round

- En Cycle består av 0..N Rounds.
- En Round tillhör exakt en Cycle.
- DJ för en Round utses enligt Cycle-rotationen.
