# docs/07-joker.md

# Syfte

Detta dokument definierar Joker.

Joker är en resurs som en Player kan använda för att minska osäkerheten i Placement (tidslinjeplacering).

Joker ändrar aldrig korrekt svar eller bedömning.

# NORMATIVT: Joker-saldo

- Varje Player har ett Joker-saldo.
- Joker-saldo är ett heltal i intervallet 0–3.
- Joker-saldo är persistent under hela Game.
- Vid Game-start initialiseras varje Player med saldo 1.
- Oracle kan inte använda eller vinna Joker i sin egen Round.

# NORMATIVT: Intjäning

Joker kan vinnas endast vid övergång till `REVEALED`.

En kvarvarande Player (ej Oracle) vinner 1 Joker om:

- både Title Guess och Artist Guess är korrekta.

Joker tilldelas oberoende av om Placement var korrekt.

En Player kan vinna högst 1 Joker per Round.

# NORMATIVT: Användning

- Joker får användas endast när Round är i `GUESSING`.
- En Player får använda högst 1 Joker per Round.
- Joker får användas endast om Playerns publika Joker-saldo är ≥ 1.
- Joker får användas endast för Placement.
- Oracle får inte använda Joker i sin egen Round.

När en Player använder en Joker under `GUESSING` registreras den för den aktiva Performancen.
Det publika Joker-saldot minskar först vid övergång till `REVEALED`.

# NORMATIVT: Effekt

När en Joker används för Placement visas vilket decennium låten tillhör, t.ex. 1980–1989.

- Decenniet innehåller alltid det korrekta året.
- Jokern påverkar bara Placement, inte Title Guess eller Artist Guess.
- Jokern påverkar inte bedömningen.

# NORMATIVT: Uppdatering av Joker-saldo vid Round-avslut

När Round övergår till `REVEALED` uppdateras varje kvarvarande Players Joker-saldo enligt följande:

1. Saldot minskas med antalet Jokrar som Playern har registrerat för Roundens aktiva Performance.
2. Om Playern vinner en Joker i `REVEALED` ökas saldot med 1.
3. Därefter begränsas saldot till intervallet 0–3.

# NORMATIVT: Relation till Performance-byte

Om Performance ersätts under `GUESSING`:

- all registrerad Joker-användning för den tidigare Performancen annulleras
- annullerad användning påverkar inte Joker-saldot

# NORMATIVT: Relation till avbruten Round

Om Round övergår till `ABORTED` ska registrerad Joker-användning inte påverka Joker-saldot.
