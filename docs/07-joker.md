# docs/07-joker.md

## Syfte

Detta dokument definierar Joker inom spelmodellen.

Joker är en persistent resurs som tillhör Player och kan användas under en Round.

## NORMATIVT: Definition

Joker är en begränsad resurs som kan användas för att reducera
tillgängliga alternativ i en GuessPart under `GUESSING`.

Joker förändrar inte facit eller bedömning.

## NORMATIVT: Ägarskap och saldo

- Joker tillhör en Player inom ett Game.
- Varje Player har ett Joker-saldo.
- Joker-saldo är persistent inom Game.
- Om en Joker tilldelas när saldot redan är 3, tilldelas ingen ytterligare Joker.

## NORMATIVT: Intjäning

- Joker kan tilldelas en Player vid reveal enligt Joker-reglerna.
- En Player kan vinna högst 1 Joker per Round.
- Tilldelning sker endast i samband med `REVEALED_FULL`.

## NORMATIVT: Användning

Joker får användas endast när Round är i `GUESSING`.

Joker spenderas i samband med commit av en GuessPart.

När Joker används:
- tillgängliga alternativ reduceras före commit,
- reduceringen gäller endast aktuell GuessPart.

Reduceringsgraden beror på hur många Jokers som spenderas
på aktuella GuessPart.

1 eller 2 Jokers motsvarar två olika reduceringsnivåer.

Reduceringsnivåerna är deterministiska och definieras
per GuessPart i spelreglerna.

Joker spenderas i det ögonblick en GuessPart committas.
Efter commit är den spenderade Jokern förbrukad och kan inte användas igen.
Undantag, vid byte av Performance, definieras i `05-performance`.

## NORMATIVT: Begränsningar

- En Player kan använda högst 2 Jokers per GuessPart.
- En Player kan inneha högst 3 Jokers samtidigt.
- Spenderad Joker återfås inte.
- DJ spenderar inga Jokers i den Round där hen är DJ.

Undantag vid byte av Performance definieras i `05-performance`.

## INFORMATIVT: Roll i spelmodellen

Joker påverkar endast gissningssituationen och är frikopplad
från RoundState, transitions och DJ Prediction.
