# docs/06-guess-and-prediction.md

## Syfte

Detta dokument definierar Guess, GuessPart och DJ Prediction samt commit-ordning och låsning.

## NORMATIVT: Grundprinciper

- Varje Player har exakt en Guess per Round.
- Guess gäller alltid aktiv Performance.
- DJ Prediction gäller alltid aktiv Performance.
- GuessParts och DJ Prediction får endast ändras när Round är i `GUESSING`.
- Backend är authoritative för commit, låsning och bedömning.

## NORMATIVT: Guess

### Definition

En Guess är en Players samlade svar för en Performance.

En Guess:
- hör till exakt en Player
- hör till exakt en Performance
- kan vara partiell

Guess består av tre GuessParts:

1. Tidslinje
2. Låt
3. Artist

## NORMATIVT: Ordning

GuessParts committas i fast ordning:

1 → 2 → 3

En senare GuessPart får inte committas innan föregående är committad.

## NORMATIVT: Commit

En GuessPart blir giltig när den committas.

- Endast committade GuessParts bedöms.
- En icke-committad GuessPart bedöms som inkorrekt.
- Tidslinje och Låt är irreversibelt fastställda vid commit.
- Artist är fastställd när Round övergår till `LOCKED`.

Om Round återgår från `LOCKED` till `GUESSING`:
- Artist kan ändras fram till nästa låsning.
- Tidigare committad Tidslinje och Låt påverkas inte.

## NORMATIVT: DJ Prediction

### Definition

DJ Prediction är DJ:s bedömning av aktiv Performances svårighetsgrad.

### Regler

- Varje Performance kan ha högst en DJ Prediction.
- DJ Prediction kan sättas och ändras endast under `GUESSING`.
- DJ Prediction fastställs när Round övergår till `LOCKED`.
- `GUESSING → LOCKED` är inte tillåten utan att DJ Prediction finns.
- DJ Prediction bedöms vid reveal.
- DJ Prediction påverkar inte state machine-strukturen.

## NORMATIVT: Relation till Performance-byte

Om Performance byts ut under `GUESSING`:
- Guess och DJ Prediction kopplade till den ersatta Performancen räknas inte.
- Ny Performance kräver ny DJ Prediction före låsning.

## NORMATIVT: Bedömning

Bedömning sker i samband med reveal och baseras på den Performance som var aktiv när Round låstes.

För varje Player:
- varje GuessPart bedöms separat
- GuessParts kan enligt Roundens regler generera Card och Joker.

DJ Prediction:
- jämförs med objektivt utfall
- kan generera en DJ Star

## INFORMATIVT: Designprincip

Guess är Players prestation.
DJ Prediction är DJ:s bedömning.

Båda knyts till Performance.
Round styr när de fastställs.
