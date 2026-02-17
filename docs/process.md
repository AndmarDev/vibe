# docs/process.md

## Syfte
Detta dokument beskriver **arbetsprocessen och disciplinen** för projektet,
som utvecklar ett **socialt musikspel**.

Syftet är att:
- säkerställa begreppslig konsekvens
- undvika semantisk glidning
- möjliggöra omtag utan kaos
- minska framtida teknisk och konceptuell skuld

Detta dokument beskriver **hur vi arbetar**, inte spelets innehåll och regler.

## Grundprincip: Normativ riktning

Projektet har en tydlig normativ riktning:

**Dokumentation → spelregler → kod**

- Dokumentation definierar begrepp och semantik.
- Spelregler preciserar tillåtna beteenden.
- Kod implementerar dessa utan att förändra deras innebörd.

Lägre nivåer får vara mer detaljerade och striktare,
men får aldrig ändra betydelsen av högre nivåer.

Om en motsägelse uppstår ska dokumentationen uppdateras –
inte semantiken i koden.

## Begreppsdisciplin

Kod får inte introducera nya **domänbegrepp** utan att arbetet pausas
och begreppen först diskuteras och dokumenteras.

Med domänbegrepp avses begrepp som:
- bär spelregler eller ansvar
- måste vara konsekventa över hela systemet
- påverkar hur spelet förstås och spelas

När ett behov av ett nytt sådant begrepp uppstår gäller:

1. Stoppa kod
2. Diskutera begreppet
3. Uppdatera dokumentationen
4. Fortsätt koda

Planen är planen tills planen ändras.

## Dokumentens roll

Dokumenten är **normativa**, inte beskrivande i efterhand.

- De är inte kommentarer till kod.
- De är inte implementationsexempel.
- De är spelets kanon.

Kod får aldrig i efterhand “förklaras” genom att dokumentationen
anpassas för att passa redan skriven kod utan begreppsdiskussion.

## Spelets normativa modell

Dokument 01–07 utgör spelets normativa modell.

De definierar:
- spelregler (vad som är tillåtet, förbjudet och hur utfall fastställs)
- den formella struktur som reglerna uttrycks i (tillstånd, transitions, relationer och konsekvenser)

Tillsammans beskriver de både hur spelet fungerar och hur dess regler är strukturerade.

Övriga dokument (t.ex. Premium, responsmodell, implementation)
får inte ändra eller omtolka denna modell.


## Korsreferenser mellan dokument

Dokument ska i huvudsak vara **självbärande**.

Korsreferenser används endast när de är nödvändiga för förståelse, t.ex.:
- när ett dokument explicit bygger vidare på ett annat
- när ett begrepp definieras på exakt ett ställe (glossary)

Övriga samband uttrycks genom konsekvent språk, inte genom listor av “se även”.

## Arbetsordning (prioritet)

Arbetet sker i följande ordning:

1. Process och disciplin
2. Glossary och begrepp
3. Spelregler och flöden
4. Datamodell och lagring
5. Implementation

Databasschema och lagringsdetaljer designas **sent** för att spegla
låsta begrepp – inte för att forma dem.

## AI-verktyg (Claude Code)

AI-verktyg används som:
- implementatör
- assistent
- granskare

AI-verktyg får:
- skriva kod enligt befintliga begrepp
- föreslå implementationer inom låst semantik

AI-verktyg får inte:
- introducera nya domänbegrepp
- ersätta eller omtolka befintliga begrepp
- “fylla i” otydliga delar av modellen på eget initiativ

Vid osäkerhet ska arbetet pausas och frågan lyftas till begreppsnivå.

## Sammanfattning

- Begrepp först, kod sen
- Hellre paus än slentrian
- Hellre omtag nu än soppa senare
- Dokumentation är spelets ryggrad
