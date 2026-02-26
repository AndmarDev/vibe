# docs/02-game.md

# Syfte

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
Eftersom spelet inte har startat finns inga Cycles eller Rounds att påverka.
Borttagning kan däremot innebära att Playerns startkort (startår) inte längre ingår i spelet.
Övriga Players påverkas inte.

## IN_PROGRESS

Game pågår.

- Cycles och Rounds skapas och spelas sekventiellt.
- Oracle-rotation är deterministisk och sker enligt regler i `03-cycle`.
- Creator är första Oracle i varje Cycle, därefter följer övriga Players i join-ordning.
- Creator kan ta bort Players.
- Sentillkomna Players kan ansluta endast när aktuell Cycle är i `BOUNDARY_DECISION`.
- Creator kan avsluta Game när som helst.

Om antalet kvarvarande Players understiger `minPlayers` kan Game inte längre fortsätta.
I detta fall gäller:

- Om en Round är aktiv ska den omedelbart övergå till `ABORTED`.
- Game ska därefter övergå till `FINISHED`.

Slutlig ranking fastställs enligt regler nedan.

## FINISHED

Game är avslutat.

- Inga nya Cycles eller Rounds skapas.
- Inga transitions är tillåtna.
- Game kan inte återgå till tidigare tillstånd.

# NORMATIVT: Startår

Varje Player ska innan `startGame` ange ett startår.
Detta blir Playerns startkort och början på Playerns tidslinje.

Startåret:

- måste vara ett helt årtal
- måste ligga inom intervallet 1980–2010 (inklusive)

Intervallet är fast och påverkas inte av låtpoolens ytterår.

Game får inte övergå från `LOBBY` till `IN_PROGRESS` om någon Player saknar giltigt startår.

Om en Player ansluter i `BOUNDARY_DECISION` måste Playern ange giltigt startår
innan nästa Cycle kan startas.

# NORMATIVT: Övergångar

### startGame
`LOBBY → IN_PROGRESS`

- Triggas av Creator.
- Kräver att Player-count uppfyller constraint.
- Kräver att alla Players har giltigt startår.

### finishGame
`LOBBY → FINISHED`, `IN_PROGRESS → FINISHED`

- Triggas av Creator.
- Kan triggas när som helst.

Om `finishGame` triggas när Game är i `IN_PROGRESS`
och det finns en aktiv Round som inte nått `REVEALED`,
ska den Rounden först övergå till `ABORTED`.

Efter att Rounden övergått till `ABORTED` övergår Game till `FINISHED`.

Ingen bedömning, tilldelning av Cards eller uppdatering
av Joker-saldo ska ske för den avbrutna Rounden.
Detta inkluderar även Prediction.

En avbruten Round kan aldrig generera Timeline Cards, Oracle Card, Jokrar eller ⭐.

# NORMATIVT: Borttagning av Players

Innan Game nått state `FINISHED` kan Creator ta bort en Player från Game.

En borttagen Player:

- deltar inte i pågående eller framtida Rounds
- kan inte få nya Cards eller Jokrar
- ingår inte i framtida Oracle-rotation
- ingår inte i slutlig ranking

Om den borttagna Playern är Oracle i en aktiv Round gäller `04-round`:
Rounden avbryts och övergår till `ABORTED`.

Creator kan inte tas bort från Game.

# NORMATIVT: Sen anslutning (late join)

Players kan ansluta i följande lägen:

- `LOBBY`
- `IN_PROGRESS` när aktuell Cycle är i `BOUNDARY_DECISION`

En Player som ansluter i `BOUNDARY_DECISION`:

- deltar inte i den Cycle som just avslutats
- ingår i Oracle-rotation först i nästa Cycle
- måste ange ett giltigt startår innan nästa Cycle startar

Late join valideras mot det `maxPlayers` som fastställdes vid `startGame`.

# NORMATIVT: Player-count constraint

Game definierar:

- `minPlayers = 3`
- `maxPlayers = 5` (gratisversion)
- `maxPlayers = 10` (premiumversion)

Game får startas (dvs gå från `LOBBY` till `IN_PROGRESS`) endast om:

- antal Players ≥ minPlayers
- antal Players ≤ gällande maxPlayers

`maxPlayers` fastställs vid `startGame` och ändras inte under ett pågående Game.

# NORMATIVT: Slutlig ranking

Endast Cycles som har nått state `FINISHED` räknas i slutlig ranking.

En Cycle övergår till `FINISHED` när:
- Creator i `BOUNDARY_DECISION` väljer att starta en ny Cycle, eller
- Creator i `BOUNDARY_DECISION` väljer att avsluta Game.

Om Game avslutas medan en Cycle är i `ACTIVE` räknas den Cyclen inte i slutlig ranking.

Vid övergång till `FINISHED` fastställs ranking utifrån
samtliga Cards som tilldelats i Cycles som är `FINISHED`.

Oracle Card räknas som ett vanligt Card i total Card count.

Ranking bestäms i följande ordning:

1. Total Card count (högst vinner).
2. Vid lika total Card count: antal ⭐ (högst vinner).
3. Vid fortsatt lika: delad vinst.

⭐ är en markering som endast kan finnas på ett Timeline Card.

⭐ räknas inte som ett separat Card.

⭐ kan aldrig finnas på ett Oracle Card.
