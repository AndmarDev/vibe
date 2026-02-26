# docs/06-guess-and-prediction.md

# Syfte

Detta dokument definierar Guess och Prediction.

Guess är en Players svar på den aktiva Performancen i en Round.
Prediction är Oracles bedömning av rundans svårighetsgrad.

# NORMATIVT: Grundprinciper

- Varje Player (utom Oracle i sin egen Round) har högst en Guess per Performance.
- Guess gäller alltid aktiv Performance.
- Guess kan ändras endast när Round är i `GUESSING`.
- Oracle lämnar ingen Guess i sin egen Round.
- Oracle gör istället exakt en Prediction per aktiv Performance.
- Backend är authoritative för submit och bedömning.

Jokrar kan användas under `GUESSING` enligt regler i `07-joker`.

# NORMATIVT: Guess

## Struktur

En Guess:

- tillhör exakt en Player
- tillhör exakt en Performance
- kan vara partiell

Guess består av tre GuessParts:

1. Timeline
2. Title
3. Artist

`Timeline` uttrycks genom att placera låten på en position i Playerns timeline.

`Title` och `Artist` uttrycks genom att välja ett alternativ ur ett CandidateSet (se `08-candidates`).
Spelet visar antingen `full` eller `reduced` CandidateSet beroende på Joker-användning.

## Informationsordning och redigerbarhet

GuessParts följer en strikt informationsordning:

Timeline → Title → Artist

När en GuessPart har skickats in och nästa GuessPart blivit tillgänglig
får tidigare GuessPart inte ändras.
Detta beror på att nästa GuessPart innebär tillgång till ny information
(kandidatlista) som kan påverka tidigare beslut.

Detta innebär:

- När Timeline är inskickad och Title blivit tillgänglig
  kan Timeline inte längre ändras.
- När Title är inskickad och Artist blivit tillgänglig
  kan Title inte längre ändras.
- Artist kan ändras så länge Round är i `GUESSING`,
  eftersom ingen ytterligare information följer efter Artist.

När Round är i `LOCKED` kan inga GuessParts ändras.

När Round övergår till `REVEALED` blir samtliga GuessParts definitiva.

## Submit

En GuessPart blir inskickad när den submittas.
Progression är individuell per Player.

- En Player får endast submitta sin egen GuessPart.
- Endast inskickade GuessParts bedöms.
- En GuessPart som inte är inskickad bedöms som inkorrekt.

# NORMATIVT: Prediction

Prediction:

- tillhör exakt en Oracle
- tillhör exakt en Performance
- kan anta ett av tre värden:
  - Lätt
  - Medel
  - Svår
- kan ändras så länge Round är i `GUESSING`

Prediction måste vara inskickad innan Round kan övergå till `LOCKED`.

När Round övergår till `LOCKED` kan Prediction inte längre ändras.

Om Performance byts under `GUESSING` ogiltigförklaras tidigare Prediction.

# NORMATIVT: Relation till Performance-byte

Om Performance ersätts under `GUESSING`:

- Alla Guess kopplade till den tidigare Performancen upphör att gälla.
- Alla registrerade Joker-användningar kopplade till den tidigare Performancen annulleras.
- Oracle Prediction för den tidigare Performancen ogiltigförklaras.
- Varje Player börjar om från GuessPart 1.
- Oracle måste lämna en ny Prediction.

# NORMATIVT: Bedömning

Bedömning av Guess och Prediction sker vid övergång till `REVEALED`.

Bedömningen baseras på den Performance som är aktiv vid övergången.

Varje GuessPart bedöms separat.

Regler för korrekthet definieras i `04-round`.

Guess kan enligt regler i `04-round` generera Timeline Card och Joker.

Prediction kan enligt regler i `04-round` generera Oracle Card.
