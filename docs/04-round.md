# docs/04-round.md

# Syfte

Detta dokument definierar Round.

En Round är den spelhändelse där en Performance spelas,
Players placerar låten i sin tidslinje samt gissar Title och Artist,
Oracle gör Prediction, och resultat fastställs.

Round äger sin state machine och fastställer tilldelning av Cards och Jokrar.

# NORMATIVT: RoundState

Varje Round har exakt ett av följande tillstånd:

- `READY`
- `GUESSING`
- `LOCKED`
- `REVEALED`
- `ABORTED`

## READY

En Oracle är utsedd.

Round är skapad, väntar på att Oracle startar.

När Oracle startar Round:
- en Performance skapas
- den sätts som aktiv
- RoundState sätts till `GUESSING`

## GUESSING

Round pågår.

- Exakt en Performance är aktiv.
- Host ansvarar för uppspelning av låten.
- Host kan byta låt (byta Performance) enligt `05-performance`.
- Alla kvarvarande Players utom Oracle lämnar Guess.
- Oracle gör Prediction.
- Players får använda Jokrar enligt `07-joker`.
- Oracle använder inga Jokrar.

Prediction är knuten till aktiv Performance.
Prediction kan ändras så länge Round är i `GUESSING`.

Om Host byter låt under `GUESSING` (byter Performance) ska:
- tidigare Guess ogiltigförklaras,
- tidigare Prediction ogiltigförklaras,
- ny Performance blir aktiv.

Oracle triggar övergången från `GUESSING` till `LOCKED`.
Precondition för att gå till `LOCKED`:
- En Prediction finns för aktiv Performance.

## LOCKED

Round är låst.

- Inga nya Guess får skickas in.
- Prediction kan inte ändras.

Utfallet fastställs i `LOCKED`.
Ingen ytterligare input kan påverka utfallet så länge Round förblir i `LOCKED`.

Oracle triggar övergången från `LOCKED` till `REVEALED`.

Oracle kan i även låsa upp Round som då går från `LOCKED` till `GUESSING`.
I detta fall är utfallet inte fastställt.

## REVEALED

Reveal har genomförts.
När Round går till `REVEALED` publiceras det fastställda utfallet.
Resultatet som visas i `REVEALED` är det som fastställdes när Round låstes.

- Placement bedöms.
- Title Guess bedöms.
- Artist Guess bedöms.
- Prediction bedöms.
- Cards tilldelas.
- Jokrar tilldelas.
- Joker-saldon fastställs.

`REVEALED` är ett terminalt tillstånd.
Eventuell stegvis visning av resultat (t.ex. år → titel/artist → prediction)
är en presentationsfråga och utgör inte separata tillstånd i modellen.

Round kan inte återgå till tidigare tillstånd.

Om Oracle tas bort när Round är i `REVEALED` ska spelet fortsätta automatiskt
till nästa Round eller till `BOUNDARY_DECISION` enligt regler i `03-cycle`.

## ABORTED

Round är avbruten.

- Inga fler transitions sker.
- Ingen bedömning eller tilldelning sker.
- Joker-saldo påverkas inte.
- Round bidrar inte till ranking.
- Effekten på Oracle-rotation regleras i `03-cycle`.

# NORMATIVT: Tillståndsövergångar

- `READY` → `GUESSING`
- `GUESSING` → `LOCKED`
- `LOCKED` → `GUESSING`
- `LOCKED` → `REVEALED`
- `READY` → `ABORTED`
- `GUESSING` → `ABORTED`
- `LOCKED` → `ABORTED`

En Round kan också bli `ABORTED` om:

- Host avslutar Game (`02-game`)
- Host tar bort spelare och antalet kvarvarande Players understiger `minPlayers`

Inga andra övergångar är tillåtna.

# NORMATIVT: Oracle vs. Host

Oracle ansvarar för Roundens tillståndsövergångar, dvs styr RoundState.

Host ansvarar för ljuduppspelning och kan trigga byte av Performance (byta låt)
enligt regler i `05-performance`.
Host kan också göra att en Round blir `ABORTED` enligt regler ovan.

# NORMATIVT: Oracle

Oracle leder Roundens transitions.

Oracle:
- startar Round
- låser och låser upp Round
- gör reveal
- gör Prediction

Oracle:
- lämnar ingen Guess
- använder inga Jokrar

Om Oracle tas bort när Round är i `READY`, `GUESSING` eller
`LOCKED` ska Round omedelbart övergå till `ABORTED` och:
- ingen reveal får ske
- ingen tilldelning får ske

Om Oracle tas bort när Round är i `REVEALED` påverkas inte resultatet.

# NORMATIVT: Bedömning av Guess

Bedömning baseras på den Performance som var aktiv i det ögonblick
då Round gick från `GUESSING` till `LOCKED`.

Varje Guess består av:

- Placement (tidslinje)
- Title Guess
- Artist Guess

## Bedömning av Placement

Placement är korrekt om låtens year hamnar i korrekt ordning
mellan de två befintliga Cards som Placementen placeras emellan.

Det Card som ligger direkt före den valda positionen är vänsterkort.
Det Card som ligger direkt efter är högerkort.

Placement är korrekt om:
- year ≥ vänsterkortets year (om vänsterkort finns), och
- year ≤ högerkortets year (om högerkort finns).

I annat fall är Placement inkorrekt.

## Bedömning av Title och Artist

Title Guess är korrekt om korrekt Title valts.
Artist Guess är korrekt om korrekt Artist valts.

# NORMATIVT: Bedömning av Prediction

Prediction baseras enbart på antal korrekta Placements bland kvarvarande Players som får lämna Guess.

Oracle lämnar ingen Guess och ingår inte i beräkningen.

Svårighetsgrad bestäms enligt tabell i `06-guess-and-prediction`.

Om Oracles Prediction överensstämmer med den fastställda svårighetsgraden tilldelas ett Oracle Card.

# NORMATIVT: Tilldelning av Cards

Endast kvarvarande Players kan tilldelas Card.

Tilldelning sker vid `REVEALED`.

För varje kvarvarande Player (ej Oracle):
- Om Placement är korrekt → ett Song Card som placeras i Playerns tidslinje.
- Om samma Player även har korrekt Title Guess och korrekt Artist Guess
  ska Song Card markeras med en Star (⭐).

För Oracle:
- Om Prediction är korrekt → ett Oracle Card.

Song Card representerar den Song som tillhör den Performance som var aktiv vid LOCKED.
Song Cards placeras i tidslinjen och avgör vem som vinner spelet.

Oracle Cards placeras inte i tidslinjen och används endast som tie-break enligt `02-game`.

# NORMATIVT: Tilldelning av Jokrar

Joker tilldelas endast vid `REVEALED`.

En kvarvarande Player (ej Oracle) tilldelas 1 Joker om:
- både Title Guess och Artist Guess är korrekta.

Joker tilldelas oberoende av om Placement var korrekt.

En Player kan vinna högst 1 Joker per Round.

Oracle kan aldrig vinna Joker i sin egen Round.

Exakta regler för saldo och användning definieras i `07-joker`.

# NORMATIVT: Relation till Performance

- En Round kan referera flera Performances över tid.
- Högst en Performance är aktiv åt gången.
- Endast den Performance som var aktiv vid `LOCKED` kan generera Cards och Jokrar.
