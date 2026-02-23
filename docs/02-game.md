# docs/02-game.md

## Syfte

Detta dokument definierar Game.

Game är den övergripande ramen för Players, Cycles och Rounds.
Här definieras när ett spel kan startas, avslutas och hur slutlig ranking bestäms.

# NORMATIVT: GameState

Game har exakt ett av följande tillstånd:

- `LOBBY`
- `IN_PROGRESS`
- `FINISHED`

## LOBBY

Game är skapat men ännu inte startat.

- Players kan ansluta.
- Creator kan ta bort Players.
- Creator kan starta Game.
- Creator kan avsluta Game.
- Inga Cycles eller Rounds finns.

Om en Player tas bort i `LOBBY` innebär det att Playern inte längre ingår i spelet.
Eftersom spelet inte har startat finns inga Rounds, Cards eller Jokrar att påverka.

## IN_PROGRESS

Game pågår.

- Cycles och Rounds skapas och spelas sekventiellt.
- DJ-rotation sker enligt regler i `03-cycle`.
- Creator kan ta bort Players.
- Creator kan avsluta Game när som helst.

Om antalet kvarvarande Players understiger `minPlayers`:

- Game får inte starta en ny Cycle.
- Pågående Round påverkas inte.
- Creator kan avsluta Game.

Om endast Creator återstår är den naturliga åtgärden att avsluta Game.

## FINISHED

Game är avslutat.

- Inga nya Cycles eller Rounds skapas.
- Inga transitions är tillåtna.
- Game kan inte återgå till tidigare tillstånd.

# NORMATIVT: Övergångar

### startGame
`LOBBY → IN_PROGRESS`

- Triggas av Creator.
- Kräver att Player-count uppfyller constraint.

### finishGame
`LOBBY → FINISHED`, `IN_PROGRESS → FINISHED`

- Triggas av Creator.
- Kan triggas när som helst.

Om `finishGame` triggas när Game är i `IN_PROGRESS` och det finns en aktiv Round
som inte nått `REVEALED_FULL`, ska den Rounden först övergå till `ABORTED`.
Därefter övergår Game till `FINISHED`.

# NORMATIVT: Borttagning av Players

Innan Game nått state `FINISHED` kan Creator ta bort en Player från Game.

En borttagen Player:

- deltar inte i pågående eller framtida Rounds
- kan inte få nya Cards eller Jokrar
- ingår inte i framtida DJ-rotation
- ingår inte i slutlig ranking

Om den borttagna Playern är utsedd DJ i en aktiv Round hanteras situationen enligt regler i `04-round`.
Där fastställs om Rounden ska fortsätta till reveal eller övergå till `ABORTED`.

Creator kan inte tas bort från Game.

# NORMATIVT: Player-count constraint

Game definierar:

- `minPlayers`
- `maxPlayers`

Game får startas endast om:

- antal Players ≥ minPlayers
- antal Players ≤ maxPlayers

Regler för hur min och max Players bestäms definieras i `premium.md`.

# NORMATIVT: Slutlig ranking

Vid övergång till `FINISHED` fastställs slutlig ranking.

Ranking bestäms i följande ordning:

1. Total Card count (högst vinner).
2. Vid lika total Card count: antal DJ Cards (högst vinner).
3. Vid fortsatt lika: delad vinst.

Inga ytterligare tie-break-regler tillämpas.
