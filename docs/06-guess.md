# docs/06-guess.md

## Syfte

Detta dokument definierar Guess, GuessPart samt submit-ordning och låsning.

# NORMATIVT: Grundprinciper

- Varje Player har en Guess per Performance.
- Guess gäller alltid aktiv Performance.
- GuessParts får endast ändras när Round är i `GUESSING`.
- Backend är authoritative för submit, låsning och bedömning.

## Guess

**Definition:**
En Players samlade svar för en Performance.

En Guess:

- hör till exakt en Player
- hör till exakt en Performance
- kan vara partiell

Guess består av tre GuessParts:

1. Timeline
2. Title
3. Artist

## NORMATIVT: Ordning

GuessParts skickas in i fast ordning:

1 → 2 → 3

En senare GuessPart får inte skickas in innan föregående är inskickad.

## NORMATIVT: Submit

En GuessPart blir inskickad när den submittas.

- En Player får endast submitta sin egen GuessPart.
- Endast inskickade GuessParts bedöms.
- En icke-inskickad GuessPart bedöms som inkorrekt.
- Submit av GuessPart är tillåtet för alla Players, inklusive DJ.

Irreversibilitet:

- Timeline och Title blir irreversibelt fastställda vid submit.
- Artist har ingen irreversibilitet vid submit och kan ändras så länge Round är i `GUESSING`.
- Samtliga GuessParts blir definitivt fastställda när Round övergår till `REVEALED_TIMELINE`.

## NORMATIVT: Upplåsning

Om Round återgår från `LOCKED` till `GUESSING`:

- Timeline och Title kan inte ändras om de redan är submittade.
- Artist kan ändras så länge Round är i `GUESSING`.

## NORMATIVT: Relation till Performance-byte

Om Performance byts ut under `GUESSING`:

- Guess kopplade till den ersatta Performancen upphör att gälla.
- Varje Player börjar om på GuessPart 1 (Timeline) för den nya aktiva Performancen.

## NORMATIVT: Bedömning

Bedömning sker i samband med reveal och baseras på
den Performance som var aktiv vid övergång till `REVEALED_TIMELINE`.

För varje Player:

- varje GuessPart bedöms separat
- GuessParts kan enligt Roundens regler generera Card och Joker
