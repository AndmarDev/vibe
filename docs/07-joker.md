# docs/07-joker.md

# Syfte

Detta dokument definierar Joker.

Joker är en resurs som en Player kan använda för att minska osäkerheten i en GuessPart.

Joker ändrar aldrig korrekt svar eller bedömning.

# NORMATIVT: Joker-saldo

- Varje Player har ett Joker-saldo.
- Joker-saldo är ett heltal i intervallet 0–3.
- Joker-saldo är persistent under hela Game.
- Vid Game-start initialiseras varje Player med saldo 1.
- Oracle kan inte använda eller vinna Joker i sin egen Round.

# NORMATIVT: Intjäning

Joker kan vinnas endast vid övergång till `REVEALED`.

En kvarvarande Player vinner 1 Joker om:
- Timeline är korrekt
- Title är korrekt
- Artist är korrekt

En Player kan vinna högst 1 Joker per Round.

Oracle kan inte vinna Joker i sin egen Round.

# NORMATIVT: Uppdatering av Joker-saldo vid Round-avslut

När Round övergår till `REVEALED` uppdateras varje kvarvarande Players Joker-saldo enligt följande:

1. Saldot minskas med antalet Jokrar som Playern har registrerat för Roundens aktiva Performance.
2. Om Playern vinner en Joker i `REVEALED` ökas saldot med 1.
3. Därefter begränsas saldot till intervallet 0–3.

Registrerad användning som har annullerats (Performance-byte eller `ABORTED`)
räknas inte och ger därför ingen minskning.

# NORMATIVT: Användning

- Joker får användas endast när Round är i `GUESSING`.
- Oracle får inte använda Joker i sin egen Round.
- En Joker används innan aktuell GuessPart submittas.
- En Player får använda högst 1 Joker per GuessPart.

När en Player använder en Joker under `GUESSING` registreras den för den aktiva Performancen.

Det publika Joker-saldot minskar först vid övergång till `REVEALED`.

Under `GUESSING` får en Player använda högst så många Jokrar
som Playerns publika Joker-saldo medger, minus de Jokrar som
redan är registrerade för den aktiva Performancen.

# NORMATIVT: Effekt per GuessPart

## Timeline

När Joker används för GuessPart `Timeline` visas ett tidsintervall som motsvarar korrekt decennium.

Tidsintervallet:
- innehåller alltid korrekt år
- påverkar inte bedömningen
- påverkar inte andra GuessParts

## Title och Artist

För GuessPart `Title` och `Artist` minskar Joker antalet alternativ som visas.

Alternativen kommer från CandidateSet i `08-candidates`:
- 0 Jokrar → visa `full`
- 1 Joker → visa `reduced`

# NORMATIVT: Relation till Performance-byte

Om Performance ersätts under `GUESSING`:
- all registrerad Joker-användning för den tidigare Performancen annulleras
- annullerad användning påverkar inte Joker-saldot

# NORMATIVT: Relation till avbruten Round

Om Round övergår till `ABORTED` ska registrerad Joker-användning inte påverka Joker-saldot.
