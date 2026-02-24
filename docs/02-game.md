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
Eftersom spelet inte har startat finns inga Cycles eller Rounds att påverka.
Borttagning kan däremot innebära att Playerns startkort (startår) inte längre ingår i spelet.
Övriga Players påverkas inte.

## IN_PROGRESS

Game pågår.

- Cycles och Rounds skapas och spelas sekventiellt.
- DJ-rotation sker enligt regler i `03-cycle`.
- Creator kan ta bort Players.
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

Startåret:

- måste vara ett helt årtal
- måste ligga inom intervallet 1980–2010 (inklusive)

Intervallet är fast och påverkas inte av låtpoolens ytterår.

Game får inte övergå från `LOBBY` till `IN_PROGRESS` om någon Player saknar giltigt startår.

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

Om `finishGame` triggas när Game är i `IN_PROGRESS` och det finns en aktiv Round
som inte nått `REVEALED_FULL`, ska den Rounden först övergå till `ABORTED`.
Efter att Rounden övergått till `ABORTED` övergår Game till `FINISHED`.
Ingen bedömning, tilldelning av Cards eller uppdatering av Joker-saldo
ska ske för den avbrutna Rounden.

Slutlig ranking baseras på de Cards (och ⭐-markeringar) som redan har tilldelats i avslutade Rounds.
En Round som avbryts i samband med `finishGame` bidrar aldrig med Cards, Jokrar eller ⭐.

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

Endast Cycles som har nått state `FINISHED` räknas i slutlig ranking.

En Cycle övergår till `FINISHED` när:
- Creator i `BOUNDARY_DECISION` väljer att starta en ny Cycle, eller
- Creator i `BOUNDARY_DECISION` väljer att avsluta Game.

Om Game avslutas medan en Cycle är i `ACTIVE` räknas
den Cyclen inte i slutlig ranking.

Vid övergång till `FINISHED` fastställs ranking utifrån
samtliga Cards som tilldelats i Cycles som är `FINISHED`.

Ranking bestäms i följande ordning:

1. Total Card count (högst vinner).
2. Vid lika total Card count: antal ⭐ (högst vinner).
3. Vid fortsatt lika: delad vinst.

⭐ är en markering på ett Card.
⭐ räknas inte som ett separat Card.
