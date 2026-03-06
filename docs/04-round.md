# docs/04-round.md

# Syfte

Detta dokument definierar Round.

En Round är den spelhändelse där en Performance spelas, Players placerar
låten i sin tidslinje samt gissar Title och Artist, och resultat fastställs.

Round äger sin state machine och fastställer tilldelning av Cards och Jokrar.

# NORMATIVT: RoundState

Varje Round har exakt ett av följande tillstånd:

- `READY`
- `GUESSING`
- `LOCKED`
- `REVEALED`
- `ABORTED`

## READY

En Dealer är utsedd.

Round är skapad och väntar på att Dealer startar.

När Dealer startar Round:

- två möjliga Performances presenteras för Dealer
- Dealer väljer en av dem
- den valda Performancen sätts som aktiv
- RoundState sätts till `GUESSING`

## GUESSING

Round pågår.

- Exakt en Performance är aktiv.
- Host ansvarar för uppspelning av låten.
- Dealer ser facit (year, title, artist) och ansvarar för ceremonin (lock, reveal).
- Alla kvarvarande Players utom Dealer lämnar Guess.
- Players får använda Jokrar enligt `07-joker`.
- Dealer lämnar ingen Guess.

Dealer triggar övergången från `GUESSING` till `LOCKED`.

Players kan ansluta under `GUESSING`.
En Player som ansluter:
- kan börja lämna Guess direkt
- om Guess inte lämnas innan Round övergår till `LOCKED` bedöms Guess som inkorrekt.

## LOCKED

Round är låst.

- Inga nya Guess får skickas in.
- Guess kan inte ändras.

Utfallet fastställs i `LOCKED`.

Ingen ytterligare input kan påverka utfallet så länge Round förblir i `LOCKED`.

Dealer triggar övergången från `LOCKED` till `REVEALED`.

Dealer kan även låsa upp Round vilket då återgår från `LOCKED` till `GUESSING`.
I detta fall är utfallet inte fastställt.

## REVEALED

När Round går till `REVEALED` publiceras det fastställda utfallet.

Resultatet som visas i `REVEALED` är det som fastställdes när Round låstes.

- Placement bedöms
- Title Guess bedöms
- Artist Guess bedöms
- Cards tilldelas
- Jokrar tilldelas
- Joker-saldon fastställs

`REVEALED` är ett terminalt tillstånd.
Round kan inte återgå till tidigare tillstånd.

Om Dealer tas bort när Round är i `REVEALED` ska spelet fortsätta automatiskt
till nästa Round eller till `BOUNDARY_DECISION` enligt regler i `03-cycle`.

### Informativt: Reveal i tre steg

Reveal presenteras i tre steg:

1. Title visas
2. Artist visas
3. Year visas

Den stegvisa visningen är en presentationsfråga och utgör inte separata tillstånd i modellen.

## ABORTED

`ABORTED` används när en Round avbryts av en extern händelse innan den kan slutföras normalt.

- Inga fler transitions sker.
- Ingen bedömning eller tilldelning sker.
- Joker-saldo påverkas inte.
- Round bidrar inte till ranking.

Effekten på Dealer-rotation regleras i `03-cycle`.

Övergången till `ABORTED` är en konsekvens av att:

- Host avslutar Game
- Host tar bort Player och antalet kvarvarande Players understiger `minPlayers`
- Host tar bort Player som är Dealer i Rounden
- Host ersätter aktiv Performance enligt regler i `05-performance`

När Round övergår till state `ABORTED`:

  - Alla Guess kopplade till den tidigare Performancen upphör att gälla.
  - Alla registrerade Joker-användningar kopplade till den tidigare Performancen annulleras.

Fortsättningen efter `ABORTED` beror på orsaken till avbrottet:

- Om `ABORTED` orsakas av att Game avslutas fortsätter spelet inte.
- Om `ABORTED` orsakas av att antalet kvarvarande Players understiger
  `minPlayers` fortsätter Game i state `IN_PROGRESS`, men ingen ny Round
  får skapas förrän antalet kvarvarande Players åter uppfyller `minPlayers`
  enligt regler i `02-game`.
- Om `ABORTED` orsakas av att aktiv Performance ersätts fortsätter spelet
omedelbart:
  - En ny Round skapas i `READY`.
  - Dealer startar därefter rundan igen enligt regler för `READY`.

# NORMATIVT: Tillståndsövergångar

- `READY` → `GUESSING`
- `GUESSING` → `LOCKED`
- `LOCKED` → `GUESSING`
- `LOCKED` → `REVEALED`
- `READY` → `ABORTED`
- `GUESSING` → `ABORTED`
- `LOCKED` → `ABORTED`

# NORMATIVT: Dealer vs Host

Dealer ansvarar för Roundens tillståndsövergångar och styr RoundState.

Dealer:
- startar Round
- väljer vilken Performance som används
- låser och låser upp Round
- gör reveal

Dealer:
- lämnar ingen Guess
- använder inga Jokrar

Host:
- ansvarar för ljuduppspelning
- administrerar Players anslutning och borttagning

# NORMATIVT: Bedömning av Guess

Bedömning baseras på den Performance som var aktiv i det
ögonblick då Round gick från `GUESSING` till `LOCKED`.

Varje Guess består av:

- Placement (tidslinje)
- Title Guess
- Artist Guess

## Bedömning av Placement

Placement är korrekt om låtens year hamnar i korrekt ordning
mellan de två befintliga Cards som Placementen placeras emellan.

Det Card som ligger direkt före positionen är vänsterkort.
Det Card som ligger direkt efter är högerkort.

Placement är korrekt om:

- year ≥ vänsterkortets year (om vänsterkort finns)
- year ≤ högerkortets year (om högerkort finns)

I annat fall är Placement inkorrekt.

## Bedömning av Title och Artist

Title Guess är korrekt om korrekt Title valts.

Artist Guess är korrekt om korrekt Artist valts.

# NORMATIVT: Tilldelning av Cards

Endast kvarvarande Players kan tilldelas Card.

Tilldelning sker vid `REVEALED`.

För varje kvarvarande Player (ej Dealer):

- Om Placement är korrekt → ett Vibe Card.
- Om Placement är inkorrekt men Title Guess eller Artist Guess är korrekt → ett Hit Card.

En Player kan få högst ett Card i en Round.

# NORMATIVT: Tilldelning av Jokrar

Joker tilldelas endast vid `REVEALED`.

En kvarvarande Player (ej Dealer) tilldelas 1 Joker om:

- Title Guess är korrekt
- Artist Guess är korrekt

En Player kan vinna högst 1 Joker per Round.

Dealer kan aldrig vinna Joker i sin egen Round.

Exakta regler för saldo och användning definieras i `07-joker`.

# NORMATIVT: Relation till Performance

- En Round kan referera flera Performances över tid.
- Högst en Performance är aktiv åt gången.
- Endast den Performance som var aktiv vid `LOCKED` kan generera Cards och Jokrar.
