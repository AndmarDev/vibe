# docs/08-candidates.md

## Syfte

Detta dokument definierar kandidatlistor för GuessParts.

Kandidatmodellen är en del av spelreglernas fairness och determinism,
men påverkar inte state machines eller tilldelning av Cards/Jokers.

Dokument 01–07 definierar spelregler.
Detta dokument definierar hur valmöjligheter konstrueras.

# NORMATIVT: Kandidatlista

Varje GuessPart presenteras som en kandidatlista.

En kandidatlista:

- är gemensam för alla Players i samma Round
- tillhör exakt en (Performance, GuessPart)
- är deterministisk
- är en del av den normativa modellen

Kandidatlistan är gemensam state, inte viewer-specifik.

# NORMATIVT: Ursprunglig storlek

Ursprunglig kandidatlista för varje GuessPart innehåller exakt 10 kandidater.

- Kandidater får inte upprepas.
- Korrekt svar måste alltid ingå.
- Antalet 10 är normativt och får inte variera.

Reducerad kandidatlista (efter Joker-spend) kan innehålla färre än 10 kandidater.

Reducerad kandidatlista:

- får aldrig exkludera korrekt alternativ
- får endast vara en delmängd av den ursprungliga kandidatlistan

# NORMATIVT: Determinism

Kandidatlistan är en deterministisk funktion av:

(Performance, GuessPart)

Det innebär:

- Samma (Performance, GuessPart) ger exakt samma kandidatlista.
- Kandidatlistan får inte bero på Player-identitet.
- Kandidatlistan får inte bero på tidigare Rounds.
- Kandidatlistan får inte bero på klienttillstånd.
- Kandidatlistan får inte variera mellan plattformar eller versioner.
- Kandidatlistan får inte bero på slump.

Ordning är en del av modellen.

# NORMATIVT: Fairness-constraint

Kandidatlistor får inte trivialiseras av perceptuella kontraster.

Det innebär att kandidatlistan inte får konstrueras så att:

- facit är den enda kandidaten av en tydlig perceptuell kategori
- facit framstår som uppenbart genom extrem kontrast mot övriga kandidater

Exempel på otillåtna situationer:

- 9 kvinnliga soloartister och 1 manlig soloartist där facit är manlig
- 9 soloartister och 1 grupp där facit är grupp
- 9 låtar på svenska och 1 på engelska där facit är den enda engelska

Fairness-constrainten:

- förbjuder trivialiserande kontraster
- kräver inte total homogenitet
- gäller per kandidatlista
- är inte ett krav på statistisk balans över flera Rounds

# NORMATIVT: Relation till Joker

Joker reducerar kandidatlistan genom deterministisk reducering.

Reducerad kandidatlista är en deterministisk funktion av:

(ursprunglig kandidatlista, korrekt svar, antal spenderade Jokers)

Reduceringsregler:

- Reducering får endast ske inom den ursprungliga kandidatlistan.
- Joker får inte introducera nya kandidater.
- Joker får inte ändra ordning.
- Reducering får aldrig exkludera korrekt svar.
- Reducering får inte skapa nya perceptuella kontraster som gör facit trivialt.

Joker skapar ingen ny kandidatvärld. Den minskar endast mängden inom den befintliga.

# NORMATIVT: Per GuessPart

Varje GuessPart kan ha egen kandidatmodell.

- Timeline kan baseras på årtal.
- Title kan baseras på Song-identitet.
- Artist kan baseras på Artist-identitet.

Varje GuessPart ska följa:

- determinism
- fast ursprunglig storlek (10)
- fairness-constraint
- korrekt alternativ alltid inkluderat

# NORMATIVT: Ansvar

Kandidatgenerering är en del av spelreglernas kanon och ska implementeras i rules-lagret.

Frontend får inte generera eller modifiera kandidatlistor.

# INFORMATIVT: Variation och svårighet

Perfekt strukturell symmetri mellan Rounds är inte ett mål.

Syftet med fairness-constrainten är att undvika oavsiktliga
genvägar till korrekt svar, inte att göra varje Round lika svår.

Naturlig variation mellan kandidatlistor är tillåten och önskvärd, så länge:

- determinism upprätthålls
- fairness-constrainten respekteras
- korrekt svar inte trivialiseras

Fairness innebär inte homogenitet. Variation är en del av spelupplevelsen.
