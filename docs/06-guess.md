# docs/06-guess.md

# Syfte

Detta dokument definierar Guess.

Guess är en Players svar på den aktiva Performancen i en Round.

# NORMATIVT: Grundprinciper

- Varje kvarvarande Player (utom Dealer i sin egen Round) har högst en Guess per aktiv Performance.
- Guess gäller alltid aktiv Performance.
- Om aktiv Performance ersätts under `GUESSING` upphör tidigare Guess att gälla.
- Guess kan ändras endast när Round är i `GUESSING`.
- När Round är i `LOCKED` kan Guess inte längre ändras.
- Dealer lämnar ingen Guess i sin egen Round.
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

Om en del av Guess inte är inskickad när Round övergår till `LOCKED`
bedöms den delen som inkorrekt vid `REVEALED`.

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

# NORMATIVT: Late join under GUESSING

En Player som ansluter när Round är i `GUESSING`:

- kan lämna Guess för den aktiva Performancen
- omfattas av samma regler som övriga Players

Om Guess inte lämnas innan Round övergår till `LOCKED`
bedöms saknade delar av Guess som inkorrekta.

# NORMATIVT: Relation till Round

Guess lämnas endast medan Round är i `GUESSING`.

När Round övergår till `LOCKED` fastställs utfallet.

Guess kan därefter inte ändras.
