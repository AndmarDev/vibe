# docs/02-game.md

# Syfte

Detta dokument definierar Game.

Game är den övergripande ramen för Players, Cycles och Rounds.
Här definieras när ett spel kan startas, avslutas och hur slutlig ranking bestäms.

# INFORMATIVT: En aktiv Game per Host

En Host kan endast ha ett aktivt Game åt gången.

Om ett Game inte avslutas kan Host inte skapa ett nytt.
Detta påverkar inte spelreglerna, utan är en systembegränsning.

# NORMATIVT: GameState

Game har exakt ett av följande tillstånd:

- `LOBBY`
- `IN_PROGRESS`
- `FINISHED`

## LOBBY

Game är skapat men ännu inte startat.

- Players kan ansluta.
- Host kan ta bort Players.
- Host kan starta Game.
- Host kan avsluta Game.
- Inga Cycles eller Rounds finns.

Om en Player tas bort i `LOBBY` innebär det att Playern inte längre ingår i spelet.
Eftersom spelet inte har startat finns inga Cycles eller Rounds att påverka.

## IN_PROGRESS

Game pågår.

- Cycles och Rounds skapas och spelas sekventiellt.
- Dealer-rotation är deterministisk enligt regler i `03-cycle`.
- Host är första Dealer i varje Cycle, därefter följer övriga Players i join-ordning.
- Host kan ta bort Players.
- Sentillkomna Players kan ansluta.
- En Player som ansluter placeras sist i Dealer-ordningen.
- Host kan avsluta Game när som helst.

Om antalet kvarvarande Players understiger `minPlayers` kan spelet tillfälligt inte fortsätta.
I detta fall gäller:
- Om en Round är aktiv övergår den till `ABORTED`.
- Ingen ny Round skapas så länge antalet kvarvarande Players är mindre än `minPlayers`.
- Game förblir i state `IN_PROGRESS`. Host kan välja att:
  - invänta att fler Players ansluter, eller
  - avsluta spelet via `finishGame`.

Slutlig ranking fastställs enligt regler nedan.

## FINISHED

Game är avslutat.

- Inga nya Cycles eller Rounds skapas.
- Inga transitions är tillåtna.
- Game kan inte återgå till tidigare tillstånd.

# NORMATIVT: Övergångar

### startGame

`LOBBY → IN_PROGRESS`

- Triggas av Host.
- Kräver att Player-count uppfyller constraint.

### finishGame

`LOBBY → FINISHED`, `IN_PROGRESS → FINISHED`

- Triggas av Host.
- Kan triggas när som helst.

Om `finishGame` triggas när Game är i `IN_PROGRESS` och det finns en aktiv
Round som inte nått `REVEALED`, ska den Rounden först övergå till `ABORTED`.

Efter att Rounden övergått till `ABORTED` övergår Game till `FINISHED`.

Ingen tilldelning av Cards eller uppdatering av Joker-saldo ska ske för avbruten Round.
Det vill säga, en avbruten Round kan aldrig generera:

- Vibe Card
- Hit Card
- Joker

# NORMATIVT: Borttagning av Players

Innan Game nått state `FINISHED` kan Host ta bort en Player från Game.

En borttagen Player:

- deltar inte i pågående eller framtida Rounds
- kan inte få nya Cards eller Jokrar
- ingår inte i framtida Dealer-rotation
- ingår inte i slutlig ranking

När en Player upphör att vara kvarvarande ingår varken Playern eller dess publika
artefakter (t.ex. tidslinje, Cards, Joker-saldo) i Snapshot, se `backend-response-model`.

Om den borttagna Playern är Dealer i en Round som inte nått
`REVEALED` övergår Rounden till `ABORTED` enligt `04-round`.

Host kan inte tas bort från Game.

# NORMATIVT: Sen anslutning (late join)

Players kan ansluta i följande lägen:

- `LOBBY`
- `IN_PROGRESS`

Late join valideras mot det `maxPlayers` som fastställdes vid `startGame`.

En Player som ansluter under `IN_PROGRESS`:

- placeras sist i Dealer-ordningen
- får omedelbart placera ett Start Card
- kan börja lämna Guess i den aktuella Rounden om RoundState är `GUESSING`

Om en Player inte hinner lämna Guess innan Round övergår till `LOCKED`
bedöms de saknade delarna av Guess som inkorrekta.

En Player som ansluter deltar i Dealer-rotationen i den aktuella Cycle
och får sin Dealer-tur när ordningen når den Playern.

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

- Host i `BOUNDARY_DECISION` väljer att starta en ny Cycle, eller
- Host i `BOUNDARY_DECISION` väljer att avsluta Game.

Om Game avslutas medan en Cycle är i `ACTIVE` räknas den Cyclen inte i slutlig ranking.

Om Game övergår till `FINISHED` utan att någon Cycle har nått `FINISHED` fastställs ingen ranking.

Vid övergång till `FINISHED` fastställs ranking för varje kvarvarande Player.

Ranking bestäms i följande ordning:

1. Antal Vibe Cards (högst vinner).
2. Vid lika: antal Hit Cards (högst vinner).
3. Vid fortsatt lika: delad vinst.

Tie-break jämför endast Players som har lika många Vibe Cards.
