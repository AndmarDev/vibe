# docs/02-game.md

## Syfte

Detta dokument definierar Game och dess övergripande tillstånd,
start, avslut samt slutlig ranking.

# NORMATIVT: GameState

Game har exakt ett av följande tillstånd:

- `LOBBY`
- `IN_PROGRESS`
- `FINISHED`

## LOBBY

Game är skapat av Creator.

- Players kan ansluta.
- Creator kan starta Game.
- Inga Cycles eller Rounds finns.

## IN_PROGRESS

Game pågår.

- Cycles och Rounds skapas och spelas sekventiellt.
- DJ-rotation sker enligt regler i `03-cycle`.

## FINISHED

Game är avslutat.

- Inga nya Cycles eller Rounds skapas.
- Inga övergångar eller regelstyrda händelser sker efter `FINISHED`.
- Game återgår aldrig från `FINISHED`.

# NORMATIVT: Övergångar

### startGame
`LOBBY → IN_PROGRESS`

- Triggas av Creator.
- Kräver att Player-count uppfyller constraint.

### finishGame
`IN_PROGRESS → FINISHED`

- Triggas när Cycle är i tillståndet `BOUNDARY_DECISION` enligt `03-cycle`, eller
- Triggas administrativt av Creator.

# NORMATIVT: Player-count constraint

Game definierar:

- `minPlayers`
- `maxPlayers`

Game startas endast om:

- antal Players ≥ minPlayers
- antal Players ≤ maxPlayers

Regler för hur `maxPlayers` bestäms definieras utanför Game-modellen.

# NORMATIVT: Slutlig ranking

Vid övergång till `FINISHED` fastställs slutlig ranking.

Ranking bestäms enligt följande ordning:

1. Total Card count (högst vinner).
2. Vid lika total Card count: antal DJ Cards (högst vinner).
3. Vid fortsatt lika: delad vinst.

Inga ytterligare tie-break-regler tillämpas.
