# docs/backend-response-model.md

# Syfte

Detta dokument beskriver hur backend exponerar spelets tillstånd till en enskild Player.

Backend skickar alltid två delar:

- **Snapshot** – gemensamt och identiskt för alla Players
- **ViewerContext** – privat information för den mottagande Playern

Dokumentet definierar informationsgränser.
Det låser inte exakt API-form.

Syftet är att säkerställa att privat information (Guess, Joker-användning och facit)
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
- Dealer för Rounden
- aktiv Performance (utan facit före `REVEALED`)
- publik submit-status per Player (t.ex. om Guess är inskickad)
- Start Cards och Vibe Cards i respektive Players timeline
- Hit Cards
- publikt Joker-saldo per Player

När Round är i `REVEALED` kan Snapshot även innehålla:

- korrekt year
- korrekt title
- korrekt artist
- resultat av Placement
- tilldelade Vibe Cards
- tilldelade Hit Cards
- uppdaterade publika Joker-saldon

Snapshot är identisk för alla Players.

Under `GUESSING` är publikt Joker-saldo stabilt.
Registrerad Joker-användning påverkar inte saldot förrän Round övergår till `REVEALED`.

## Player-lista

Snapshot visar endast kvarvarande Players.
När en Player upphör att vara kvarvarande ingår varken Playern eller dess
publika artefakter (t.ex. tidslinje, Cards, Joker-saldo) i Snapshot.

Snapshot representerar alltid spelets nuvarande tillstånd.
Den är inte en historikvy.

# INFORMATIVT: Reconnect

Om en Player tillfälligt tappar anslutningen och sedan återansluter räknas detta inte som en ny Player.

Playerns identitet, position i Dealer-rotationen och tidigare spelhandlingar påverkas inte.

# INFORMATIVT: Historik

Snapshot är inte avsedd att visa historik över borttagna Players.

Om systemet erbjuder en separat historikvy kan den inkludera
Players som tidigare deltagit i Game, även om de inte längre är kvarvarande.
En sådan historik är inte en del av Snapshot och påverkar inte spelets regler.

# NORMATIVT: Förbjudet innehåll i Snapshot

Före `REVEALED` får Snapshot aldrig innehålla:

- privata Guess-val
- privata Joker-registreringar
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
- om mottagaren är Dealer i aktuell Round
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

- om Joker är registrerad för Placement
- korrekt decenniumintervall om Joker är registrerad

Publikt Joker-saldo hämtas från Snapshot.

Registrerad Joker påverkar inte publikt saldo förrän `REVEALED`.

## Dealer-specifikt

Under `GUESSING` innehåller ViewerContext för Dealer:

- facit (year, title, artist)

Dealer ser alla Players tidslinjer och publika Joker-saldon i Snapshot.

# NORMATIVT: Reveal

När Round går från `GUESSING` till `LOCKED` fastställs utfallet.

När Round sedan övergår till `REVEALED` ska Snapshot visa det fastställda utfallet.

Snapshot ska då visa:

- korrekt year
- korrekt title
- korrekt artist
- bedömning av varje Players Placement
- bedömning av Title Guess
- bedömning av Artist Guess
- tilldelade Vibe Cards
- tilldelade Hit Cards
- uppdaterade publika Joker-saldon

All bedömning är då publik och definitiv.

# NORMATIVT: Handoff efter REVEALED

När Round är i `REVEALED`:

- Normalt triggar Dealer övergång till nästa Round eller till `BOUNDARY_DECISION`.
- Om Dealer inte längre är kvarvarande ska backend automatiskt fortsätta enligt regler i `03-cycle`.

Detta påverkar inte Snapshotens innehåll.

Tillåtna actions definieras av RoundState och CycleState.

# NORMATIVT: Relation till Round ABORT

Om Round övergår till `ABORTED`:

- privata Guess för Rounden upphör att gälla
- registrerad Joker-användning annulleras
- Joker-saldon påverkas inte

Snapshot ska då återspegla att Rounden inte längre är aktiv.

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
