# docs/06-guess-and-prediction.md

# Syfte

Detta dokument definierar Guess och Prediction.

Guess är en Players svar på den aktiva Performancen i en Round.
Prediction är Oracles bedömning av rundans svårighetsgrad.

# NORMATIVT: Grundprinciper

- Varje kvarvarande Player (utom Oracle i sin egen Round) har högst en Guess per aktiv Performance.
- Guess gäller alltid aktiv Performance.
- Om aktiv Performance ersätts under `GUESSING` upphör tidigare Guess att gälla.
- Guess kan ändras endast när Round är i `GUESSING`.
- När Round är i `LOCKED` kan Guess inte längre ändras.
- Oracle lämnar ingen Guess i sin egen Round.
- Oracle gör istället exakt en Prediction per aktiv Performance.
- Backend är authoritative för submit och bedömning.

Jokrar kan användas under `GUESSING` enligt regler i `07-joker`.

# NORMATIVT: Guess

En Guess:

- tillhör exakt en Player
- tillhör exakt en Performance
- kan vara partiell

En Guess består av:

- Placement (tidslinjeplacering)
- Title Guess
- Artist Guess

Placement uttrycks genom att placera låten på en position i Playerns tidslinje.

Title Guess och Artist Guess uttrycks genom att välja ett av de
svarsalternativ som backend genererar för den aktuella Performancen.

Om en del av Guess inte är inskickad bedöms den som inkorrekt vid `REVEALED`.

Regler för hur Placement, Title Guess och Artist Guess bedöms definieras i `04-round`.

# NORMATIVT: Svarsalternativ för Title/Artist Guess

För varje aktiv Performance ska backend generera:

- exakt 10 Title-alternativ
- exakt 10 Artist-alternativ

Dessa alternativ:

- är gemensamma för alla Players i Rounden
- presenteras i samma ordning för alla Players
- är fasta under hela Rounden
- påverkas inte av Joker-användning

Varje uppsättning om 10 alternativ ska innehålla exakt ett korrekt svar.

Svarsalternativen är knutna till den aktiva Performancen.

Om aktiv Performance ersätts under `GUESSING` ska en ny uppsättning
om 10 Title-alternativ och 10 Artist-alternativ genereras för den nya Performancen.
Tidigare alternativ upphör då att gälla och får inte återanvändas.

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

# NORMATIVT: Bedömning av svårighetsgrad

Oracle lämnar en Prediction av rundans svårighetsgrad.

Rundans svårighetsgrad baseras enbart på antal korrekta
Placements bland kvarvarande Players som får lämna Guess.
Oracle lämnar ingen Guess och ingår inte i beräkningen.

Antal gissare = antal kvarvarande Players minus Oracle.

Klassificering sker enligt följande tabell.
Tabellen täcker samtliga tillåtna antal gissare (2–9).

## 2 gissare
- 0 korrekta → Svår
- 1 korrekt → Medel
- 2 korrekta → Lätt

## 3 gissare
- 0 korrekta → Svår
- 1 korrekt → Medel
- 2–3 korrekta → Lätt

## 4 gissare
- 0–1 korrekta → Svår
- 2 korrekta → Medel
- 3–4 korrekta → Lätt

## 5 gissare
- 0–1 korrekta → Svår
- 2–3 korrekta → Medel
- 4–5 korrekta → Lätt

## 6 gissare
- 0–2 korrekta → Svår
- 3–4 korrekta → Medel
- 5–6 korrekta → Lätt

## 7 gissare
- 0–2 korrekta → Svår
- 3–4 korrekta → Medel
- 5–7 korrekta → Lätt

## 8 gissare
- 0–2 korrekta → Svår
- 3–5 korrekta → Medel
- 6–8 korrekta → Lätt

## 9 gissare
- 0–3 korrekta → Svår
- 4–6 korrekta → Medel
- 7–9 korrekta → Lätt

# NORMATIVT: Tilldelning

Om Oracles Prediction överensstämmer med den fastställda
svårighetsgraden tilldelas ett Oracle Card enligt `04-round`.

Guess kan enligt `04-round` generera Song Card och Joker.
