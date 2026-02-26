# docs/04-round.md

# Syfte

Detta dokument definierar Round.

En Round är den spelhändelse där en Performance spelas,
Players lämnar Guess, Oracle gör Prediction och resultat fastställs.

Round äger sin state machine och fastställer tilldelning av Cards och Jokrar.

# NORMATIVT: RoundState

Varje Round har exakt ett av följande tillstånd:

- `READY`
- `GUESSING`
- `LOCKED`
- `REVEALED`
- `ABORTED`

## READY

Round är skapad och en Oracle är utsedd.

Oracle är den som i detta läge startar Round.

När Round startas:

- en Performance skapas
- den sätts som aktiv
- RoundState sätts till `GUESSING`

## GUESSING

Round pågår.

- Exakt en Performance är aktiv.
- Creator ansvarar för uppspelning av låten.
- Alla kvarvarande Players utom Oracle lämnar Guess.
- Oracle gör Prediction.
- Players får använda Jokrar enligt `07-joker`.
- Oracle använder inga Jokrar.
- Creator kan byta Performance (byta låt) enligt `05-performance`.

Prediction är knuten till aktiv Performance.
Prediction kan ändras så länge Round är i `GUESSING`.
När Round övergår till `LOCKED` är Prediction fastställd.

Om Performance byts under `GUESSING`:

- tidigare Guess ogiltigförklaras,
- tidigare Prediction ogiltigförklaras,
- ny Performance blir aktiv.

## LOCKED

Round är låst.

- Inga nya GuessParts får skickas in.
- Prediction kan inte ändras.

Precondition för `GUESSING → LOCKED`:
- En Prediction finns för aktiv Performance.

Oracle kan låsa upp Round som då återgår till `GUESSING`.

## REVEALED

Reveal har genomförts.

Vid övergången till `REVEALED` är resultatet redan fastställt.

- Samtliga GuessParts bedöms.
- Prediction bedöms.
- Cards tilldelas.
- Jokrar tilldelas.
- Joker-saldon fastställs.

`REVEALED` är ett enda terminalt tillstånd.
Eventuell stegvis visning av resultat (t.ex. år → titel/artist → prediction)
är en presentationsfråga och utgör inte separata tillstånd i modellen.

Round är avslutad och kan inte återgå till tidigare tillstånd.

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

En Round kan också bli `ABORTED`:

- när Creator avslutar Game (`02-game`)
- om speldata är ogiltig (t.ex. ogiltigt kandidatpaket enligt `08-candidates`)

Inga andra övergångar är tillåtna.

# NORMATIVT: Oracle

Oracle leder Roundens transitions.

Oracle:

- startar Round
- låser och låser upp Round
- initierar reveal
- gör Prediction

Oracle:

- lämnar ingen Guess
- använder inga Jokrar

Om Oracle tas bort hanteras situationen enligt regler i nästa kapitel.
Ingen annan roll kan ersätta Oracle i den Rounden.

# NORMATIVT: Borttagning av Player

Om Creator tar bort en Player medan Round pågår:

- Playern räknas inte längre som deltagare i Rounden.
- Playerns Guess ignoreras från och med borttagningen.
- Playern kan inte få Card, Joker eller ⭐ i Rounden.

### Om Oracle tas bort

Om Oracle tas bort från Game medan Round är i `READY`, `GUESSING` eller `LOCKED`
ska Round omedelbart avbrytas och övergå till `ABORTED`.

- Ingen reveal får ske.
- Ingen bedömning eller tilldelning får ske.
- Rounden räknas inte som genomförd Oracle-tur (se `03-cycle`).

Om Oracle tas bort när Round redan är i `REVEALED` påverkas inget.

# NORMATIVT: Bedömning av GuessParts

Bedömning baseras på den Performance som är aktiv när Round övergår till `LOCKED`.

Varje GuessPart bedöms separat.

## Bedömning av Timeline

Timeline är korrekt om låtens år ligger i korrekt ordning
relativt Playerns närmaste Timeline Cards:

- year ≥ närmaste vänsterkort
- year ≤ närmaste högerkort

I annat fall är Timeline inkorrekt.

## Bedömning av Title och Artist

Title och Artist är korrekt om korrekt kandidat har valts.

Kandidatpaket definieras i `08-candidates`.

# NORMATIVT: Bedömning av Prediction

Prediction definieras i `06-guess-and-prediction`.
Detta avsnitt definierar hur rundans svårighetsgrad fastställs.

Rundans svårighetsgrad bestäms utifrån andelen korrekta GuessParts i den aktuella Rounden.
Endast kvarvarande Players som får lämna Guess ingår i beräkningen.
Oracle lämnar ingen Guess i sin egen Round och bidrar därför inte till beräkningen.
Varje sådan Player kan ha högst tre korrekta GuessParts: Timeline, Title och Artist.

**Steg 1 – Möjliga GuessParts**

Antal möjliga GuessParts är: antal gissande Players multiplicerat med tre.

**Steg 2 – Faktiskt korrekta GuessParts**

Summera alla korrekta GuessParts för dessa Players.

**Steg 3 – Klassificering**

- Om högst en tredjedel av alla möjliga GuessParts är korrekta klassificeras Rounden som **Svår**.
- Om minst två tredjedelar är korrekta klassificeras Rounden som **Lätt**.
- I övriga fall klassificeras Rounden som **Medel**.

Gränsvärden tillhör ytterkategorierna:
- exakt en tredjedel → Svår
- exakt två tredjedelar → Lätt

Om endast en Player deltar i Guess:
- 0 eller 1 korrekt GuessPart → Svår
- 2 eller 3 korrekta GuessParts → Lätt
- Medel används inte i detta fall

**Tilldelning**

Om Oracles Prediction överensstämmer med den fastställda svårighetsgraden tilldelas ett Oracle Card.

# NORMATIVT: Tilldelning av Cards

Endast kvarvarande Players kan tilldelas Card.

En Player kan få högst 1 Card per Round.

Tilldelning sker vid `REVEALED`.

För varje kvarvarande Player (ej Oracle):

- Om Timeline är korrekt → Timeline Card.
- Annars, om Title och Artist är korrekt → Timeline Card.

Om Timeline, Title och Artist är korrekt i samma Round markeras Timeline Card med ⭐.

För Oracle:

- Om Prediction är korrekt → Oracle Card.

Oracle Card:

- räknas (precis som alla typer av Card) i total Card count
- kan aldrig ha ⭐
- påverkar inte timeline

# NORMATIVT: Tilldelning av Jokrar

Joker tilldelas endast vid `REVEALED`.

En kvarvarande Player (ej Oracle) tilldelas 1 Joker om:

- Timeline är korrekt
- Title är korrekt
- Artist är korrekt

En Player kan vinna högst 1 Joker per Round.

Oracle kan aldrig vinna Joker i sin egen Round.

Exakta regler för saldo och användning definieras i `07-joker`.

# NORMATIVT: Relation till Performance

- En Round kan referera flera Performances över tid.
- Högst en Performance är aktiv åt gången.
- Endast den Performance som var aktiv vid `LOCKED` kan generera Cards och Jokrar.
