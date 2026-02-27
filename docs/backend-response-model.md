# docs/backend-response-model.md

# Syfte

Detta dokument beskriver hur backend exponerar spelets tillstånd till en enskild Player.

Backend skickar alltid två delar:

- **Snapshot** – gemensamt och identiskt för alla Players
- **ViewerContext** – privat information för den mottagande Playern

Dokumentet definierar informationsgränser.
Det låser inte exakt API-form.

Syftet är att säkerställa att privat information (Guess, Joker-användning, Prediction, facit)
inte exponeras publikt före `REVEALED`.

# NORMATIVT: Snapshot

Snapshot representerar spelets gemensamma, objektiva tillstånd.

Snapshot innehåller endast information som är sann och synlig för alla Players vid samma tidpunkt.

## Innehåll

Snapshot kan innehålla:

- GameState
- aktuella Players
- aktuell Cycle och dess CycleState
- aktuell Round och dess RoundState
- Oracle för Rounden
- aktiv Performance (utan facit före `REVEALED`)
- publik submit-status per Player (t.ex. om Guess är inskickad)
- Song Cards (inkl. Start Cards) i respektive tidslinje
- Oracle Cards
- publikt Joker-saldo per Player
- fastställd svårighetsgrad (endast i `REVEALED`)
- facit (endast i `REVEALED`)

Snapshot är identisk för alla Players.

Under `GUESSING` är publikt Joker-saldo stabilt.
Registrerad Joker-användning påverkar inte saldot förrän Round övergår till `REVEALED`.

## Player-lista

Snapshot visar endast kvarvarande Players.
När en Player upphör att vara kvarvarande ingår varken Playern eller dess
publika artefakter (t.ex. tidslinje, Cards, Joker-saldo) i Snapshot.

Snapshot representerar alltid spelets nuvarande tillstånd.
Den är inte en historikvy.

# INFORMATIVT: Historik

Snapshot är inte avsedd att visa historik över borttagna Players.

Om systemet erbjuder en separat historikvy kan den inkludera
Players som tidigare deltagit i Game, även om de inte längre är kvarvarande.
En sådan historik är inte en del av Snapshot och påverkar inte spelets regler.

# NORMATIVT: Förbjudet innehåll i Snapshot

Före `REVEALED` får Snapshot aldrig innehålla:

- privata Guess-val
- privata Joker-registreringar
- Oracle Prediction
- korrekt year
- korrekt title
- korrekt artist
- något som indirekt avslöjar facit

# NORMATIVT: ViewerContext

ViewerContext är härledd information som gäller endast den mottagande Playern.

ViewerContext beräknas från:

- Snapshot
- mottagarens identitet

ViewerContext får aldrig motsäga Snapshot.

## Roller

ViewerContext kan ange:

- om mottagaren är Host
- om mottagaren är Oracle i aktuell Round
- om mottagaren är gissande Player

## Guess (privat under `GUESSING`)

ViewerContext kan innehålla:

- mottagarens egna Placement
- mottagarens Title Guess
- mottagarens Artist Guess
- om Guess är fullständig
- om Guess kan ändras (dvs RoundState = `GUESSING`)

Andra Players Guess exponeras aldrig före `REVEALED`.

## Svarsalternativ

Under `GUESSING` ska ViewerContext innehålla:

- exakt 10 Title-alternativ
- exakt 10 Artist-alternativ

Dessa alternativ:

- är identiska i innehåll och ordning för alla Players i Rounden
- är fasta under hela Rounden

ViewerContext innehåller endast alternativen, inte korrekthetsmarkering.

## Joker (privat under `GUESSING`)

ViewerContext kan innehålla:

- antal registrerade Jokrar
  för aktiv Performance (max 1)
- om Joker är registrerad för Placement
- korrekt decenniumintervall
  om Joker är registrerad

Publikt Joker-saldo hämtas från Snapshot.

Registrerad Joker påverkar inte publikt saldo förrän `REVEALED`.

## Oracle-specifikt (endast för Oracle)

Under `GUESSING` innehåller ViewerContext för Oracle:

- facit (year, title, artist)
- egen Prediction
- om Round kan låsas (Prediction finns)

Oracle ser alla Players tidslinjer och publika Joker-saldon i Snapshot.

# NORMATIVT: Reveal

När Round går från `GUESSING` till `LOCKED` fastställs utfallet.
När Round sedan övergår till `REVEALED` ska Snapshot visa det fastställda utfallet.

Snapshot ska visa:

- korrekt year
- korrekt title
- korrekt artist
- bedömning av varje Players Placement
- bedömning av Title Guess och Artist Guess
- tilldelade Song Cards
- tilldelade Oracle Cards
- uppdaterade publika Joker-saldon
- fastställd svårighetsgrad
- Oracle Prediction
- om Oracle Prediction var korrekt

All bedömning är då publik och definitiv.

# NORMATIVT: Handoff efter REVEALED

När Round är i `REVEALED`:

- Normalt triggar Oracle övergång till nästa Round eller `BOUNDARY_DECISION`.
- Om Oracle inte längre är kvarvarande ska backend automatiskt fortsätta enligt `03-cycle`.

Detta påverkar inte Snapshotens innehåll.
Tillåtna actions definieras av RoundState och CycleState.

# NORMATIVT: Relation till Performance-byte

Om Performance ersätts under `GUESSING`:

- tidigare privata Guess upphör att gälla
- tidigare Joker-registreringar annulleras
- tidigare Prediction ogiltigförklaras
- ny ViewerContext ska genereras
- Snapshot ska endast spegla den nya aktiva Performancen

Ingen information från tidigare Performance får påverka den nya.

# NORMATIVT: Ansvar

Backend:

- beräknar Snapshot
- beräknar ViewerContext
- validerar alla actions
- är authoritative

Frontend:

- renderar från Snapshot + ViewerContext
- skickar actions
- implementerar inga egna spelregler
- får inte härleda privat information om andra Players
