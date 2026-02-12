# docs/05-performance.md

## Syfte

Detta dokument definierar Performance: instansen av en Recording inom en Round.

Performance separerar spelhändelsen (Round) från den konkreta uppspelningen (Recording).

## NORMATIVT: Struktur

- En Round kan referera flera Performances över tid.
- En Round har högst en aktiv Performance (`active_performance_id`).
- Endast aktiv Performance ligger till grund för bedömning och tilldelning av Cards, Jokers och DJ Stars.

Performance har ingen egen state machine.

## NORMATIVT: Skapande

En Performance skapas under `GUESSING`.

När en ny Performance skapas:

- den blir aktiv,
- tidigare aktiv Performance upphör att vara aktiv.

## NORMATIVT: Byte av Performance

Byte av Performance innebär att aktiv Performance ersätts med en ny.

Byte initieras av DJ.

Byte är tillåtet endast när Round är i `GUESSING`.

## NORMATIVT: Invalidation

När en Performance ersätts:

- den ersatta Performancen används inte för bedömning,
- dess Guess och DJ Prediction ligger kvar som historik,
- endast den nya aktiva Performancen kan generera resultat.

## NORMATIVT: Joker-refund vid byte

Om en Performance ersätts under `GUESSING`:

- Jokers som spenderats i Guess på den ersatta performancen återförs till respektive Player.
- Guess på den ersatta performancen påverkar inte resultat.

## NORMATIVT: Relation till Round

- Round styr tillstånd och transitions.
- Performance representerar den Recording som Round spelas på.
- Reveal och bedömning baseras på den Performance som är aktiv vid övergång till `REVEALED_TIMELINE`.

## INFORMATIVT: Motivation

Performance separerar Round (spelstruktur) från Recording (konkret instans).

Byte av Performance möjliggör att en Round kan referera olika Recordings utan att skapa en ny Round.
