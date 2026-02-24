# docs/03-cycle.md

## Syfte

Detta dokument definierar Cycle.

En Cycle är ett varv runt bordet där varje Player är DJ varsin gång.

Cycle strukturerar DJ-rotation och skapar en naturlig paus där spelet kan fortsätta eller avslutas.

# NORMATIVT: CycleState

Varje Cycle har exakt ett av följande tillstånd:

- `ACTIVE`
- `BOUNDARY_DECISION`
- `FINISHED`

## ACTIVE

Cycle pågår.

- Rounds skapas sekventiellt.
- För varje Round i denna Cycle utses exakt en DJ.
- En Player kan vara DJ högst en gång per Cycle.

Endast Players som fortfarande ingår i Game beaktas vid DJ-rotation.

Om en Player tas bort under en Cycle ingår den Playern inte längre i DJ-rotationen.
Borttagning av Player under en pågående Round regleras i `04-round`.

När alla kvarvarande Players har genomfört sin DJ-tur exakt en gång i denna Cycle,
och den senaste Rounden har avslutats, övergår Cycle till `BOUNDARY_DECISION`.

## BOUNDARY_DECISION

Cycle är avslutad och väntar på beslut.

- Inga nya Rounds skapas i denna Cycle.
- Creator väljer att:
  - starta en ny Cycle, eller
  - avsluta Game.

När Creator fattar beslut:

- Om Creator väljer att starta en ny Cycle:
  - Den aktuella Cyclen övergår till `FINISHED`.
  - En ny Cycle skapas i state `ACTIVE`.

- Om Creator väljer att avsluta Game:
  - Den aktuella Cyclen övergår till `FINISHED`.
  - Game övergår därefter till `FINISHED`.

## FINISHED

Cycle är avslutad.

- Inga nya Rounds skapas i denna Cycle.

# NORMATIVT: DJ-rotation

Creator är första DJ i spelet.

DJ-rotation definieras per Cycle:

- DJ utses enligt Players join-ordning.
- Varje Player är DJ en gång per Cycle.
- Endast Players som fortfarande ingår i Game beaktas.

Rotationen påverkas inte av:

- antal vunna Cards
- antal Jokrar

Om en Player tas bort före sin DJ-tur hoppar rotationen över den Playern.

# NORMATIVT: Relation till Round

- En Cycle består av 0..N Rounds.
- En Round tillhör exakt en Cycle.
- DJ för en Round utses enligt Cycle-rotationen.
- Endast en aktiv Round kan finnas per Cycle vid en given tidpunkt.

# NORMATIVT: DJ-tur och avslutad Round

En Cycle skapar Rounds sekventiellt.

En DJ-tur räknas som genomförd endast när Rounden når `REVEALED_FULL`.

- Om en Round når `REVEALED_FULL` anses den utsedda DJ ha genomfört sin tur. Nästa Round får nästa DJ enligt Cycle-rotationen.
- Om en Round övergår till `ABORTED` anses ingen kvarvarande Player ha genomfört någon DJ-tur i den Rounden.

Nästa Round ska då utses så här:

- Om den utsedda DJ fortfarande är kvarvarande: samma DJ igen.
- Om den utsedda DJ inte längre är kvarvarande (t.ex. borttagen): nästa DJ enligt Cycle-rotationen.

# NORMATIVT: Rättviseprincip

En Cycle är strukturerad så att varje kvarvarande Player
genomför exakt en DJ-tur per Cycle.

Eftersom endast Cycles i state `FINISHED` räknas i slutlig ranking,
har alla Players som ingår i ranking varit DJ lika många gånger.
