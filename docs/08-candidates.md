# docs/08-candidates.md

## Syfte

Detta dokument definierar vilka svarsalternativ som kan visas för GuessParts `Title` och `Artist`.

Timeline omfattas inte av detta dokument.

# NORMATIVT: CandidateSet

För varje aktiv Performance och GuessPart (`Title` respektive `Artist`) ska backend generera ett CandidateSet.

Ett CandidateSet består av två listor:

- `full` (exakt 10 alternativ)
- `reduced` (exakt 3 alternativ)

Båda listorna är gemensamma för alla Players i samma Round.

CandidateSet är indata till spelreglerna.
Rules får CandidateSet som indata.
Frontend får inte ändra det.

# NORMATIVT: Relation till Joker

Joker skapar inga nya alternativ.

För `Title` och `Artist` väljer spelet vilken lista som visas:

- 0 Jokrar → `full`
- 1 Joker → `reduced`

Regler för när Joker får användas definieras i `07-joker`.

# NORMATIVT: Krav på CandidateSet

För varje GuessPart (`Title` och `Artist`) gäller:

- `full` innehåller exakt 10 alternativ och inga dubletter.
- `reduced` innehåller exakt 3 alternativ och inga dubletter.
- `reduced` är en delmängd av `full`.
- Ordningen i `reduced` följer ordningen i `full`.
- Korrekt svar finns i både `full` och `reduced`.

# NORMATIVT: Ansvar

## Backend

Backend skapar och sparar CandidateSet per Performance och GuessPart (`Title` och `Artist`).

## Rules

Rules:
- kontrollerar att CandidateSet uppfyller kraven ovan
- avgör vilken lista som ska användas beroende på Joker-användning

Om rules underkänner CandidateSet för `Title` eller `Artist` får Rounden inte gå vidare till reveal.
Backend ska då avbryta Rounden genom att sätta RoundState till `ABORTED`.

## Frontend

Frontend visar endast den lista som gäller för aktuell Player.
