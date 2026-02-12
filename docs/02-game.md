# docs/02-game.md

## Syfte

Detta dokument definierar Game och dess tillstånd.

## NORMATIVT: GameState

Game har exakt ett av följande tillstånd:

- `LOBBY`
- `IN_PROGRESS`
- `FINISHED`

## LOBBY

Game är skapat.

- Players kan ansluta.
- Creator startar Game.
- Inga Cycles eller Rounds finns.

## IN_PROGRESS

Game pågår.

- Cycles och Rounds skapas och spelas.
- DJ-rotation sker enligt Cycle-regler.

## FINISHED

Game är avslutat.

- Inga nya Cycles eller Rounds skapas.
- Inga spelhandlingar är tillåtna.

Game återgår aldrig från `FINISHED`.

## NORMATIVT: Övergångar

### startGame
`LOBBY → IN_PROGRESS`

- Triggas av Creator.
- Kräver att player-count uppfyller constraint.

### finishGame
`IN_PROGRESS → FINISHED`

- Triggas vid cycle boundary, eller
- Triggas administrativt av Creator.

## NORMATIVT: Player-count constraint

Game definierar:

- `minPlayers`
- `maxPlayers`

Game startas endast om:

- antal Players ≥ minPlayers
- antal Players ≤ maxPlayers

Regler för hur `maxPlayers` bestäms definieras utanför Game-modellen.
