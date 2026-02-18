# docs/03-cycle.md

## Syfte

Detta dokument definierar Cycle, som är varvet runt bordet i ett Game.

Cycle strukturerar DJ-rotation och skapar en tydlig gräns mellan varv.

# NORMATIVT: CycleState

Varje Cycle har exakt ett av följande tillstånd:

- `ACTIVE`
- `BOUNDARY_DECISION`
- `FINISHED`

## ACTIVE

Cycle pågår.

- Rounds skapas sekventiellt.
- För varje Round i denna Cycle utses exakt en Scheduled DJ.
- En Player är Scheduled DJ högst en gång per Cycle.

När alla kvarvarande Players har varit Scheduled DJ, och sista Round
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

# NORMATIVT: DJ-rotation

Creator är första Scheduled DJ i spelet.

Cycle-rotationen utser Scheduled DJ för varje Round:

- Scheduled DJ utses enligt Players join-ordning.
- En Player kan vara Scheduled DJ högst en gång per Cycle.
- Endast Players som fortfarande ingår i Game beaktas.

Rotationen påverkas inte av:

- DJ Takeover
- antal vunna Cards
- antal Jokers

DJ Takeover ändrar endast vem som är Acting DJ i aktuell Round.

# NORMATIVT: Relation till Round

- En Cycle består av 0..N Rounds.
- En Round tillhör exakt en Cycle.
- Scheduled DJ för en Round utses enligt Cycle-rotationen.
- Endast en aktiv Round kan finnas per Cycle vid en given tidpunkt.
