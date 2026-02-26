# docs/08-candidates.md

# Syfte

Detta dokument definierar CandidateSet.

CandidateSet anger vilka svarsalternativ som får visas för GuessParts `Title` och `Artist`.

GuessPart `Timeline` omfattas inte av detta dokument.

# NORMATIVT: Definition

För varje aktiv Performance och GuessPart `Title` respektive `Artist`
ska backend generera ett CandidateSet.

Ett CandidateSet består av två listor:

- `full`
- `reduced`

CandidateSet är normativ indata till rules; frontend får aldrig ändra det.

CandidateSet är gemensamt för alla Players i samma Round och Performance.

# NORMATIVT: Strukturkrav

För varje GuessPart (`Title` och `Artist`) gäller:

- `full` innehåller exakt 10 alternativ.
- `reduced` innehåller exakt 3 alternativ.
- Inga dubletter får förekomma inom respektive lista.
- `reduced` är en delmängd av `full`.
- Ordningen i `reduced` ska följa ordningen i `full`.
- Korrekt svar måste finnas i både `full` och `reduced`.

# NORMATIVT: Relation till Joker

Joker skapar inga nya alternativ.

För GuessPart `Title` och `Artist` avgör Joker vilken lista som visas:

- 0 registrerade Jokrar → visa `full`
- 1 registrerad Joker → visa `reduced`

Regler för när Joker får användas definieras i `07-joker`.

# NORMATIVT: Relation till Performance

CandidateSet är knutet till en specifik Performance.

Om Performance ersätts under `GUESSING`:

- tidigare CandidateSet upphör att gälla
- nytt CandidateSet måste genereras
- alla GuessParts börjar om från början

# NORMATIVT: Ansvarsfördelning

## Backend

Backend ska:

- generera CandidateSet per Performance och GuessPart
- säkerställa att korrekt svar inkluderas
- lagra CandidateSet tillsammans med Performance

## Rules

Rules ska:

- validera att CandidateSet uppfyller strukturkraven
- avgöra vilken lista (`full` eller `reduced`) som används
  för respektive Player baserat på registrerad Joker-användning

Om CandidateSet inte uppfyller strukturkraven får Round inte övergå till `REVEALED`.

I detta fall ska Round övergå till `ABORTED`.

## Frontend

Frontend ska:

- visa den lista som rules anger
- inte modifiera ordning eller innehåll
