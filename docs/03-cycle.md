# docs/03-cycle.md

# Syfte

Detta dokument definierar Cycle.

En Cycle är ett varv runt bordet där varje kvarvarande Player får vara Dealer en gång.

Cycle strukturerar Dealer-rotation och skapar en naturlig paus där spelet kan fortsätta eller avslutas.

# NORMATIVT: CycleState

Varje Cycle har exakt ett av följande tillstånd:

- `ACTIVE`
- `BOUNDARY_DECISION`
- `FINISHED`

## ACTIVE

Cycle pågår.

Vid början av varje Cycle placerar varje Player ett Start Card i sin timeline,
se `Start Card decennier` längre ned.

Rounds skapas sekventiellt.

För varje Round i denna Cycle utses exakt en Dealer.

Dealer-ordningen baseras på join-ordningen för Players i Game.

- Host är alltid första Dealer i varje Cycle.
- Därefter följer övriga Players i join-ordning.

Players kan ansluta under en aktiv Cycle.

En Player som ansluter:

- läggs sist i Dealer-ordningen
- kan börja lämna Guess i pågående Round enligt regler i `04-round`

När alla kvarvarande Players har genomfört exakt en Dealer-tur och den
senaste Rounden har nått `REVEALED` övergår Cycle till `BOUNDARY_DECISION`.

## BOUNDARY_DECISION

Cycle är avslutad och väntar på beslut.

- Inga nya Rounds kan skapas i denna Cycle.
- Players kan ansluta.

Host väljer att:

- starta en ny Cycle, eller
- avsluta Game.

När Host fattar beslut:

Om Host väljer att starta en ny Cycle:

- Den aktuella Cyclen övergår till `FINISHED`.
- En ny Cycle skapas i state `ACTIVE`.

Om Host väljer att avsluta Game:

- Den aktuella Cyclen övergår till `FINISHED`.
- Game övergår därefter till `FINISHED`.

## FINISHED

Cycle är avslutad.

- Inga nya Rounds skapas i denna Cycle.

# INFORMATIVT: Start Card decennier

Vid början av varje Cycle placerar varje Player ett Start Card i sin timeline.
Systemet presenterar då ett antal möjliga decennier som spelaren kan välja mellan.

Decennier introduceras i följande sekvens av Cycles:

Cycles 1–3 - Tre decennier: **1980-tal, 1990-tal, 2000-tal**

Cycles 4–5 - Två decennier: **1970-tal, 2010-tal**

Cycles 6–7 - Två decennier: **1960-tal, 2020-tal**

Cycle 8 - Ett decennium: **1950-tal**

Efter detta börjar sekvensen om från början.

När en Player har flera val i samma grupp begränsar systemet valen så
att varje decennium i gruppen används högst en gång per Player innan
gruppen är förbrukad.

# NORMATIVT: Dealer-rotation

Dealer-rotation definieras per Cycle.

Rotationen baseras på join-ordningen för Players i Game.

- Host är första Dealer i varje Cycle.
- Därefter följer övriga Players i join-ordning.
- Varje kvarvarande Player är Dealer högst en gång per Cycle.

Om en Player ansluter under en aktiv Cycle:

- Playern läggs sist i Dealer-ordningen
- Playern ingår i den aktuella Cycle och får en Dealer-tur när ordningen når Playern.

Om en Player tas bort före sin Dealer-tur hoppar rotationen över den Playern.

# NORMATIVT: Relation till Round

- En Cycle består av 0..N Rounds.
- En Round tillhör exakt en Cycle.
- Dealer för en Round utses enligt Cycle-rotationen.
- Endast 1 Round kan vara i state `READY`, `GUESSING`, `LOCKED`
  eller `REVEALED` per Cycle vid en given tidpunkt.

# NORMATIVT: Dealer-tur och avslutad Round

Rounds skapas sekventiellt i en Cycle.

En Dealer-tur räknas som genomförd endast när Rounden når `REVEALED`.

När en Round når `REVEALED` anses den utsedda Dealer ha genomfört sin tur.
Nästa Round får nästa Dealer enligt Cycle-rotationen.

Om en Round övergår till `ABORTED` anses ingen Player ha genomfört någon Dealer-tur i den Rounden.

Om Round blev `ABORTED` utses Dealer för nästa Round deterministiskt:

- Om den senast utsedda Dealer fortfarande är kvarvarande
  → samma Dealer igen.
- Annars
  → nästa kvarvarande Player enligt Cycle-rotationen.

Om Dealer tas bort när Round redan är i `REVEALED` påverkas inte
Dealer-turen. I detta fall ska spelet fortsätta automatiskt till nästa
Round eller till `BOUNDARY_DECISION` enligt de vanliga Cycle-reglerna.

# NORMATIVT: Dealer-rättvisa inom Cycle

En kvarvarande Player genomför 1 Dealer-tur per Cycle.

En Player som ansluter under en aktiv Cycle läggs sist i Dealer-ordningen
och kan därför få färre Dealer-turer totalt i Game än Players som anslöt tidigare.
