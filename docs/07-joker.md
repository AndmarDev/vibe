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

Joker kan vinnas endast i `REVEALED_FULL`.

En kvarvarande Player vinner 1 Joker i `REVEALED_FULL` om:

- Timeline är korrekt
- Title är korrekt
- Artist är korrekt

# NORMATIVT: Uppdatering av Joker-saldo vid Round-avslut

När en Round övergår till `REVEALED_FULL` uppdateras
varje kvarvarande Players Joker-saldo så här:

1. Saldot minskas med antalet Jokrar som Playern har registrerat för Roundens aktiva Performance.
2. Om Playern vinner en Joker i `REVEALED_FULL` ökas saldot med 1.
3. Efter stegen ovan begränsas saldot till intervallet 0–3.

Registrerad användning som har annullerats (Performance-byte eller `ABORTED`) räknas inte och ger därför ingen minskning.

# NORMATIVT: Användning

- Joker får användas endast när Round är i `GUESSING`.
- DJ får inte använda Jokrar i sin egen Round.
- En Joker används innan aktuell GuessPart har submittats.
- En Player får använda högst 1 Joker per GuessPart.

När en Player använder en Joker under `GUESSING` registreras den
för den aktuella Roundens aktiva Performance.

Det publika Joker-saldot minskar först när Rounden avslutas i `REVEALED_FULL`.

Under `GUESSING` får en Player använda högst så många Jokrar som Playerns
publika Joker-saldo medger, minus de Jokrar som redan är registrerade
för den aktiva Performancen.

# NORMATIVT: Effekt per GuessPart

## Timeline

För GuessPart `Timeline` ger Joker ett tidsintervall som är det korrekta decenniet (t.ex. 1980–1989).

Tidsintervallet:

- innehåller alltid korrekt år
- påverkar inte bedömningen
- påverkar inte andra GuessParts

## Title och Artist

För Title och Artist minskar Joker antalet alternativ som visas.

Alternativen kommer från ett CandidateSet i `08-candidates`:

- 0 Jokrar → visa `full` (10 alternativ)
- 1 Joker → visa `reduced` (3 alternativ)

# NORMATIVT: Relation till Performance-byte

Om Performance ersätts under `GUESSING`:

- all registrerad Joker-användning för den ersatta Performancen annulleras
- den annullerade användningen ska inte minska Joker-saldot vid `REVEALED_FULL`

# NORMATIVT: Relation till avbruten Round

Om en Round övergår till `ABORTED` ska registrerad Joker-användning i Rounden inte påverka Joker-saldot.
