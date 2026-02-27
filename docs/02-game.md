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
- Oracle-rotation är deterministisk enligt regler i `03-cycle`.
- Host är första Oracle i varje Cycle, därefter följer övriga Players i join-ordning.
- Host kan ta bort Players.
- Sentillkomna Players kan ansluta endast när aktuell Cycle är i `BOUNDARY_DECISION`.
- Host kan avsluta Game när som helst.

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
Detta blir Playerns Start Card och början på Playerns tidslinje.

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

- Triggas av Host.
- Kräver att Player-count uppfyller constraint.
- Kräver att alla Players har giltigt startår.

### finishGame
`LOBBY → FINISHED`, `IN_PROGRESS → FINISHED`

- Triggas av Host.
- Kan triggas när som helst.

Om `finishGame` triggas när Game är i `IN_PROGRESS` och det finns en aktiv
Round som inte nått `REVEALED`, ska den Rounden först övergå till `ABORTED`.

Efter att Rounden övergått till `ABORTED` övergår Game till `FINISHED`.

Ingen tilldelning av Song Cards, Oracle Cards eller uppdatering av
Joker-saldo ska ske för den avbrutna Rounden.

En avbruten Round kan aldrig generera:
- Song Cards
- Oracle Card
- Jokrar

# NORMATIVT: Borttagning av Players

Innan Game nått state `FINISHED` kan Host ta bort en Player från Game.

En borttagen Player:

- deltar inte i pågående eller framtida Rounds
- kan inte få nya Cards eller Jokrar
- ingår inte i framtida Oracle-rotation
- ingår inte i slutlig ranking

När en Player upphör att vara kvarvarande ingår varken Playern eller dess publika
artefakter (t.ex. tidslinje, Cards, Joker-saldo) i Snapshot, se `backend-response-model`.

Om den borttagna Playern är Oracle i en Round som inte nått
`REVEALED` övergår Rounden till `ABORTED` enligt `04-round`.

Host kan inte tas bort från Game.

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

- Host i `BOUNDARY_DECISION` väljer att starta en ny Cycle, eller
- Host i `BOUNDARY_DECISION` väljer att avsluta Game.

Om Game avslutas medan en Cycle är i `ACTIVE` räknas
den Cyclen inte i slutlig ranking.

Om Game övergår till `FINISHED` utan att någon Cycle har
nått `FINISHED` fastställs ingen ranking.

Vid övergång till `FINISHED` fastställs ranking utifrån
samtliga kort i tidslinjen för varje kvarvarande Player.

Ranking bestäms i följande ordning:

1. Antal kort i tidslinjen (högst vinner).
2. Vid lika: antal Oracle Cards (högst vinner).
3. Vid fortsatt lika: antal Stars (⭐, högst vinner).
4. Vid fortsatt lika: delad vinst.

Endast Start Cards och Song Cards placeras i tidslinjen.

Oracle Cards placeras inte i tidslinjen och räknas endast som utslagsgivare.
