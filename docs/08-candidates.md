# docs/08-candidates.md

## Syfte

Detta dokument definierar kandidatpaket för GuessParts.

Kandidatpaket används för Title och Artist.
Timeline omfattas inte av detta dokument.

Dokument 01–07 definierar spelregler.
Detta dokument definierar vilka alternativ som presenteras.

# NORMATIVT: Kandidatpaket

För varje aktiv Performance och GuessPart (Title och Artist)
ska backend generera ett kandidatpaket.

Ett kandidatpaket består av tre listor i fast ordning:

- `candidates10` (exakt 10 alternativ)
- `candidates5` (exakt 5 alternativ)
- `candidates2` (exakt 2 alternativ)

Alla tre listor är gemensamma för alla Players i samma Round.

Kandidatpaketet är indata till spelreglerna.
Rules får alltid kandidatpaketet som indata.
Frontend får inte ändra det.

# NORMATIVT: Relation till Joker

Joker skapar inga nya alternativ.

Huruvida en Player använder Jokrar eller inte för Title/Artist, väljer spelet vilken lista som visas:

- 0 Jokrar → `candidates10`
- 1 Joker → `candidates5`
- 2 Jokrar → `candidates2`

Regler för när Joker får användas definieras i `07-joker`.

# NORMATIVT: Krav på kandidatpaket

För varje GuessPart (Title och Artist) gäller:

- `candidates10` innehåller exakt 10 alternativ och inga dubletter.
- `candidates5` innehåller exakt 5 alternativ och är en delmängd av `candidates10`.
- `candidates2` innehåller exakt 2 alternativ och är en delmängd av `candidates5`.
- Ordningen i `candidates5` och `candidates2` följer ordningen i `candidates10`.
- Korrekt svar finns i `candidates10`, `candidates5` och `candidates2`.

# NORMATIVT: Ansvar

## Backend

Backend skapar och sparar kandidatpaket per Performance och GuessPart.

## Rules

Rules:
- validerar att kandidatpaketet uppfyller kraven ovan.
- avgör vilken lista som ska användas beroende på Joker-användning.

Om rules underkänner kandidatpaketet (Title- eller Artist-paketet
uppfyller inte kraven ovan) får Rounden inte gå vidare till reveal.

Backend ska då avbryta Rounden genom att sätta RoundState till `ABORTED`.

## Frontend

Frontend visar endast den lista som gäller för aktuell Player.
