# docs/07-joker.md

## Syfte

Detta dokument definierar Joker.

Joker är en resurs som en Player kan använda för att minska antalet alternativ i en GuessPart.

Joker ändrar aldrig korrekt svar eller bedömning.

# NORMATIVT: Joker-saldo

- Varje Player har ett Joker-saldo.
- Joker-saldo är ett heltal i intervallet 0–3.
- Joker-saldo är persistent under hela Game.
- Vid Game-start initialiseras varje Player med saldo 1.

# NORMATIVT: Intjäning

Joker tilldelas endast vid `REVEALED_FULL`.

En Player vinner 1 Joker i `REVEALED_FULL` om:

- Timeline är korrekt
- Title är korrekt
- Artist är korrekt

En Player kan vinna högst 1 Joker per Round.

Regler för hur vinsten påverkar Joker-saldot definieras nedan.

# NORMATIVT: Uppdatering av Joker-saldo vid Round-avslut

När en Round övergår till `REVEALED_FULL` uppdateras
varje kvarvarande Players Joker-saldo så här:

1. Först minskas saldot med antalet Jokrar som Playern har registrerade för Roundens aktiva Performance.
2. Därefter ökas saldot med antalet Jokrar som Playern vinner i `REVEALED_FULL` (0 eller 1).
3. Efter båda stegen begränsas saldot till maximalt 3.

Användning som har annullerats (Performance-byte eller `ABORTED`)
räknas inte och ger därför ingen minskning.

# NORMATIVT: Användning

- Joker får användas endast när Round är i `GUESSING`.
- När en Player använder en Joker under `GUESSING` registreras den för den aktuella Roundens aktiva Performance.
- Joker-saldot (det publika saldot) minskar först när Rounden avslutas i `REVEALED_FULL`.
- Under `GUESSING` får en Player inte använda fler Jokrar än vad Playerns publika Joker-saldo tillåter.
- Jokrar som redan har använts i den aktiva Performancen räknas av från vad som fortfarande får användas i samma Round.
- En Player får använda högst 2 Jokrar per GuessPart.

Om en Player tas bort från Game innan Rounden når `REVEALED_FULL`
ignoreras all registrerad Joker-användning för den Playern.
Det innebär att borttagna Players Joker-saldo inte påverkas av Rounden.

# NORMATIVT: Effekt per GuessPart

## Timeline

För GuessPart `Timeline` ger Joker ett tidsintervall som innehåller rätt år.

När en Player använder Jokrar på `Timeline` gäller:

- 0 Jokrar → inget tidsintervall visas.
- 1 Joker → tidsintervallet är hela rätt decennium (t.ex. 1980–1989).
- 2 Jokrar → tidsintervallet är rätt halva av decenniet (t.ex. 1980–1984 eller 1985–1989).

Tidsintervallet:

- innehåller alltid korrekt år
- påverkar inte bedömningen
- påverkar inte andra GuessParts

## Title och Artist

För Title och Artist minskar Joker antalet alternativ som visas.

Alternativen kommer från kandidatpaketet i `08-candidates`.

- 0 Jokrar → visa `candidates10` (10 alternativ)
- 1 Joker → visa `candidates5` (5 alternativ)
- 2 Jokrar → visa `candidates2` (2 alternativ)

# NORMATIVT: Relation till Performance-byte

Om Performance ersätts under `GUESSING` annulleras alla Jokrar som använts i den Performancen.

Användningen påverkar då inte Joker-saldot.

# NORMATIVT: Relation till avbruten Round

Om en Round övergår till `ABORTED` påverkar användningen av Jokrar i Rounden inte Joker-saldot.

Detsamma gäller för en Player som tas bort innan `REVEALED_FULL`:
registrerad Joker-användning för den Playern påverkar inte saldot.
