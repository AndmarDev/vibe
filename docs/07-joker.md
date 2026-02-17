# docs/07-joker.md

## Syfte

Detta dokument definierar Joker.

Joker är en begränsad resurs som en Player kan använda för att göra
en GuessPart enklare genom att minska antalet alternativ.

Joker förändrar aldrig korrekt svar, bedömning eller spelregler.

# NORMATIVT: Definition

Joker är en persistent resurs som tillhör en Player inom ett Game.

När en Joker används reduceras kandidatlistan för en GuessPart under `GUESSING`.

# NORMATIVT: Joker-saldo

- Varje Player har ett Joker-saldo.
- Joker-saldo är ett heltal i intervallet 0–3.
- Joker-saldo är persistent under hela Game.
- Vid Game-start initialiseras varje Player med saldo 1.

# NORMATIVT: Intjäning

Joker tilldelas endast vid `REVEALED_FULL`.

En Player tilldelas 1 Joker om:

- Timeline är korrekt
- Title är korrekt
- Artist är korrekt

En Player kan vinna högst 1 Joker per Round.

Om saldot redan är 3 sker ingen ytterligare tilldelning.

Villkor för när en Round genererar Joker definieras i `04-round`.

# NORMATIVT: Vem får använda Joker

- Joker får endast användas när Round är i `GUESSING`.
- Ordinarie DJ får inte använda Joker i sin Round.
- DJ genom DJ Takeover får använda Joker.
- Alla övriga Players får använda Joker.

Definition av Ordinarie DJ och DJ Takeover finns i `01-glossary`.

# NORMATIVT: Hur Joker används

- En Player får spendera högst 2 Jokers per GuessPart.
- Jokers måste spenderas innan aktuell GuessPart har submittats.
- Spenderade Jokers kan inte tas tillbaka.
- Spenderade Jokers kan inte flyttas mellan GuessParts.

När en Joker spenderas:

- Joker-saldot minskas omedelbart.
- Reducering sker omedelbart.
- Reducering är deterministisk.
- Reducering får aldrig exkludera korrekt svar.
- Reducering ändrar inte RoundState.

# NORMATIVT: Reducering – Timeline

För GuessPart `Timeline` gäller intervallbaserad reducering.

Låt korrekt år vara `y`.
Låt `d = floor(y/10)*10`.

- 0 Jokrar → ingen reducering.
- 1 Joker → rätt decennium (`d .. d+9`).
- 2 Jokers → rätt halva av decenniet:
  - `d .. d+4` om sista siffran i `y` är 0–4
  - `d+5 .. d+9` om sista siffran i `y` är 5–9

Reducerad Timeline:

- är deterministisk
- får aldrig exkludera korrekt år
- påverkar inte andra GuessParts

# NORMATIVT: Reducering – Title och Artist

För GuessParts `Title` och `Artist` gäller:

- Ursprunglig kandidatlista innehåller exakt 10 kandidater enligt `08-candidates`.
- Reducering sker endast inom den ursprungliga kandidatlistan.
- Ordningen i kandidatlistan får inte ändras.
- Korrekt kandidat måste alltid finnas kvar.
- Nya kandidater får inte introduceras.

Effekt av Joker-spend:

- 1 Joker → exakt 5 kandidater återstår.
- 2 Jokers → exakt 2 kandidater återstår.

# NORMATIVT: Urvalsregel (Title/Artist)

Låt ursprunglig kandidatlista vara en ordnad lista med 10 kandidater.
Låt korrekt kandidat vara positionerad någonstans i denna lista.

Reduceringsprincip:

- Den reducerade listan ska alltid vara en sammanhängande delmängd av den ursprungliga listan.
- Den reducerade listan ska alltid innehålla korrekt kandidat.
- Vid 1 Joker väljs exakt 5 sammanhängande kandidater.
- Vid 2 Jokers väljs exakt 2 sammanhängande kandidater.
- Om korrekt kandidat ligger nära början eller slutet av listan förskjuts
  urvalet så att rätt antal kandidater uppnås utan att ordningen ändras.

Reducerad kandidatlista är en deterministisk funktion av:
(ursprunglig kandidatlista, korrekt svar, antal spenderade Jokers)

# NORMATIVT: Relation till Performance-byte

Om Performance ersätts under `GUESSING`:

- Alla Jokers som spenderats på den ersatta Performancen återförs.
- Den nya Performancen behandlas som en ny gissningssituation.
