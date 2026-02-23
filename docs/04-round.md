# docs/04-round.md

## Syfte

Detta dokument definierar Round.

En Round är den spelhändelse där en Performance spelas,
Players lämnar Guess och resultat fastställs.

Round äger sin state machine och fastställer
tilldelning av Cards och Jokrar.

# NORMATIVT: RoundState

Varje Round har exakt ett av följande tillstånd:

- `WAITING_FOR_DJ`
- `GUESSING`
- `LOCKED`
- `REVEALED_TIMELINE`
- `REVEALED_FULL`
- `ABORTED`

## WAITING_FOR_DJ

Round är skapad och en DJ är utsedd.

DJ kan starta Round genom att initiera första låten.

När Round startas:

- en Performance skapas
- den sätts som aktiv
- RoundState sätts till `GUESSING`

## GUESSING

Round pågår.

- Exakt en Performance är aktiv.
- Alla kvarvarande Players, inklusive DJ, lämnar Guess.
- Alla kvarvarande Players får använda Jokrar enligt `07-joker`.
  DJ är undantagen och får inte använda Jokrar.
- DJ kan ersätta aktiv Performance (byta låt) enligt `05-performance`.

DJ kan spela låten flera gånger under detta tillstånd.

## LOCKED

Round är låst.

- Inga nya GuessParts får skickas in.
- DJ kan låsa upp Round som då återgår till `GUESSING`.

## REVEALED_TIMELINE

Första reveal-steget är genomfört.

- Korrekt år är synligt.
- Timeline är bedömd.
- Eventuella Cards för korrekt Timeline är tilldelade.
- Round kan inte återgå till tidigare tillstånd.

## REVEALED_FULL

Full reveal är genomförd.

- Samtliga GuessParts är bedömda.
- Eventuella återstående Cards är tilldelade.
- Eventuella Jokrar är tilldelade.
- Joker-saldon fastställs i detta tillstånd.
- Round är avslutad.

`REVEALED_TIMELINE` och `REVEALED_FULL` är irreversibla.

## ABORTED

Rounden är avbruten.

- Inga fler transitions sker i Rounden.
- Ingen bedömning eller tilldelning sker för Rounden.
- Spelet går vidare till nästa Round.
- Joker-saldo påverkas inte, se `07-joker`.

# NORMATIVT: Tillståndsövergångar

En Round övergår mellan tillstånd enligt följande:

- `WAITING_FOR_DJ` → `GUESSING`
- `GUESSING` → `LOCKED`
- `LOCKED` → `GUESSING` (upplåsning)
- `LOCKED` → `REVEALED_TIMELINE`
- `REVEALED_TIMELINE` → `REVEALED_FULL`
- `WAITING_FOR_DJ` → `ABORTED`
- `GUESSING` → `ABORTED`
- `LOCKED` → `ABORTED`

En Round kan också bli `ABORTED`:
- när Creator avslutar Game, se `02-game`
- om spelets indata är ogiltig, t.ex. om kandidatpaketet
  för Title/Artist inte uppfyller kraven i `08-candidates`

Inga andra övergångar är tillåtna.

# NORMATIVT: DJ

DJ leder ceremonin i en Round. Det innebär att DJ:

- startar Round
- spelar upp låten
- låser och låser upp Round
- initierar reveal

Om DJ tas bort kan Creator leda ceremonin enligt regler nedan.

# NORMATIVT: Borttagning av Player

Om Creator tar bort en Player medan Round pågår:

- Playern räknas inte längre som deltagare i Rounden.
- Playerns Guess ignoreras från och med borttagningen.
- Playern kan inte få Card eller Joker i Rounden.

Utsedd DJ ändras inte av borttagning.

Om borttagen Player är DJ gäller:

- I state `WAITING_FOR_DJ` avbryts Rounden, dvs den övergår till `ABORTED`.
- I state `GUESSING` kan Creator:
  - spela upp låten,
  - låsa Round,
  - eller avbryta Rounden.
- I state `LOCKED` kan Creator:
  - initiera `REVEALED_TIMELINE`,
  - låsa upp Round (till `GUESSING`),
  - eller avbryta Rounden.
- I state `REVEALED_TIMELINE` kan Creator initiera `REVEALED_FULL`.
- I state `REVEALED_FULL` påverkas inget.

När Creator leder ceremonin i dessa fall räknas Creator inte som DJ.

Registrerad Joker-användning för en Player som tas bort innan `REVEALED_FULL`
ignoreras och påverkar inte Joker-saldot.

# NORMATIVT: Bedömning av GuessParts

Bedömning sker vid reveal och gäller den Performance som är aktiv när Round går till `REVEALED_TIMELINE`.

## Timeline

En Player gissar Timeline genom att placera låten i sin egen timeline.

Placeringen är korrekt om låtens år hamnar i rätt ordning relativt Playerns närmaste Cards på båda sidor:

- året är större än eller lika med året på närmaste Card på vänster sida, och
- året är mindre än eller lika med året på närmaste Card på höger sida.

Om placeringen bryter mot ordningen är Timeline inkorrekt.

## Title och Artist

Title och Artist bedöms som korrekt om Playern har valt det
korrekta alternativet (korrekt kandidat) för respektive GuessPart.

Kandidatpaket definieras i `08-candidates`.

# NORMATIVT: Tilldelning av Cards

Endast kvarvarande Players kan tilldelas Card.
En Player som har tagits bort före tilldelningstidpunkten (se nedan)
kan aldrig få Card i Rounden.

Tilldelning sker i två steg.

Vid `REVEALED_TIMELINE`:

- Varje kvarvarande Player med korrekt Timeline får 1 Card.

Vid `REVEALED_FULL`:

- Varje kvarvarande Player som ännu inte fått Card
  och har korrekt Title och Artist får 1 Card.

En Player kan få högst 1 Card per Round.

Om den Player som är utsedd DJ får Card i sin egen Round
är kortet ett DJ Card.
I alla andra fall är det ett Timeline Card.

# NORMATIVT: Tilldelning av Jokrar

Joker kan tilldelas endast vid `REVEALED_FULL`.

Endast kvarvarande Players kan tilldelas Joker.
En Player som har tagits bort före `REVEALED_FULL` kan aldrig vinna Joker i Rounden.

En kvarvarande Player tilldelas 1 Joker om:

- Timeline är korrekt
- Title är korrekt
- Artist är korrekt

En Player kan vinna högst 1 Joker per Round.

Regler för Joker-användning under `GUESSING` samt uppdatering
av Joker-saldo vid `REVEALED_FULL` definieras i `07-joker`.

# NORMATIVT: Relation till Performance

- En Round kan referera flera Performances över tid.
- Högst en Performance är aktiv åt gången.
- Endast den Performance som är aktiv vid övergång till
  `REVEALED_TIMELINE` ligger till grund för bedömning.
