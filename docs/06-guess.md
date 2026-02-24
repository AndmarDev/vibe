# docs/06-guess.md

## Syfte

Detta dokument definierar Guess.

En Guess är en Players svar på den aktiva Performancen i en Round.

# NORMATIVT: Grundprinciper

- Varje Player har högst en Guess per Performance.
- Guess gäller alltid aktiv Performance.
- Guess kan ändras endast när Round är i `GUESSING`.
- Backend är authoritative för submit och bedömning.

Jokrar kan användas under `GUESSING` för att förenkla en GuessPart.
En Player får använda högst 1 Joker per GuessPart (Timeline, Title, Artist).
Regler för Joker definieras i `07-joker`.

# NORMATIVT: Struktur

En Guess:

- tillhör exakt en Player
- tillhör exakt en Performance
- kan vara partiell

Guess består av tre GuessParts:

1. Timeline
2. Title
3. Artist

# NORMATIVT: Hur GuessParts uttrycks

`Timeline` uttrycks genom att placera låten på en position i Playerns timeline.

`Title` och `Artist` uttrycks genom att välja ett alternativ
ur de svarsalternativ som visas för GuessParten.
Alternativen kommer från ett CandidateSet (se `08-candidates`).
Spelet visar antingen `full` eller `reduced` beroende på Joker-användning.

Joker-hjälp påverkar en GuessPart innan den submittas.

Regler för vad som räknas som korrekt definieras i `04-round`.

# NORMATIVT: Ordning

GuessParts skickas in i fast ordning:

1 → 2 → 3

En senare GuessPart får inte skickas in förrän föregående är inskickad.

# NORMATIVT: Informationsprincip

En GuessPart får inte ändras efter att nästa GuessPart blivit tillgänglig
för Playern.

Anledningen till denna irreversibilitet är att informationen som blir
tillgänglig för Playern i nästa GuessPart kan påverka beslut.

# NORMATIVT: Submit

En GuessPart blir inskickad när den submittas.

- En Player får endast submitta sin egen GuessPart.
- Endast inskickade GuessParts bedöms.
- En GuessPart som inte är inskickad bedöms som inkorrekt.
- DJ lämnar Guess på samma sätt som övriga Players.

När en GuessPart är inskickad gäller:

- Timeline kan inte ändras efter att den är inskickad.
- Title kan inte ändras efter att den är inskickad.
- Artist kan ändras så länge Round är i `GUESSING`.

Alla GuessParts blir definitiva när Round övergår till `REVEALED_TIMELINE`.

# NORMATIVT: Låsning och upplåsning

När Round är i `LOCKED`:

- Inga nya GuessParts får skickas in.

`LOCKED` innebär interaktionsfrysning.
GuessParts blir bedömningsgrundande först vid övergång till `REVEALED_TIMELINE`.

Om Round låses upp och återgår till `GUESSING`:

- Timeline och Title förblir låsta om de redan är inskickade.
- Om Playern har börjat gissa på Artist så kan denna sista GuessPart
  ändras så länge Round är i `GUESSING`.

Progression är individuell per Player.

Vid upplåsning återgår varje Player till sin senaste tillgängliga GuessPart.

Upplåsning förändrar inte vilken GuessPart som varit tillgänglig.
Den gör endast redigerbara fält skrivbara igen.

# NORMATIVT: Relation till Performance-byte

Om Performance ersätts under `GUESSING`:

- Alla Guess kopplade till den tidigare Performancen upphör att gälla.
- Varje Player börjar om från GuessPart 1 för den nya aktiva Performancen.

# NORMATIVT: Bedömning

Bedömning sker i samband med reveal.

Bedömningen baseras på den Performance som var aktiv vid övergång till `REVEALED_TIMELINE`.

Varje GuessPart bedöms separat.

Guess kan enligt regler i `04-round` generera Card och Joker.
