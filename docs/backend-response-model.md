# docs/backend-response-model.md

# Syfte

Detta dokument beskriver hur backend skickar spelets tillstånd till en Player.

Backend skickar alltid två delar:

- **Snapshot** – gemensamt och identiskt för alla Players
- **ViewerContext** – privat information för den mottagande Playern

Dokumentet definierar principer och informationsgränser.
Det låser inte exakt API-form.

Syftet är att säkerställa att privat information (alternativval, Joker-användning, Prediction m.m.)
inte exponeras publikt före reveal.

# NORMATIVT: Snapshot

Snapshot representerar spelets gemensamma, objektiva tillstånd.

Snapshot innehåller endast information som är sann och synlig för alla Players vid samma tidpunkt.

### Innehåll

Snapshot kan innehålla:

- GameState
- aktuella Players
- aktuell Cycle och dess CycleState
- aktuell Round och dess RoundState
- Oracle för Rounden
- aktiv Performance (utan facit före reveal)
- publik submit-status per Player (t.ex. vilka GuessParts som är inskickade)
- Cards (Start Card, Timeline Card, Oracle Card)
- publikt Joker-saldo per Player
- ⭐-markeringar på Cards
- fastställd svårighetsgrad (endast i `REVEALED`)
- facit (endast i `REVEALED`)

Snapshot är identisk för alla Players.

Under `GUESSING` är publikt Joker-saldo stabilt.
Registrerad Joker-användning påverkar inte saldot förrän Round övergår till `REVEALED`.

### Players i Snapshot

Snapshot innehåller den aktuella Player-listan för Game.

Player-listan kan endast ändras i:
- `GameState = LOBBY`
- `GameState = IN_PROGRESS` när aktuell Cycle är i `BOUNDARY_DECISION`

Under en aktiv Round (t.ex. `READY`, `GUESSING`, `LOCKED`, `REVEALED`) får Player-listan inte ändras via join.

### Förbjudet innehåll

Snapshot får aldrig innehålla:

- privata Guess-val
- privata Joker-registreringar
- Oracle Prediction före reveal
- korrekt svar före reveal

# NORMATIVT: ViewerContext

ViewerContext är härledd information som gäller endast den mottagande Playern.

ViewerContext beräknas från:

- Snapshot
- mottagarens identitet

ViewerContext kan innehålla:

### Roller

- om mottagaren är Creator
- om mottagaren är Oracle i aktuell Round

Om mottagaren har anslutit under `BOUNDARY_DECISION` ska ViewerContext kunna
ange att mottagaren ännu inte ingår i Oracle-rotation förrän nästa Cycle startar.
Detta är härledd information och får inte påverka Snapshot.

### Guess-progress (endast i `GUESSING`)

- mottagarens egna redan inskickade GuessParts
- vilken GuessPart mottagaren ska skicka in härnäst

Om mottagaren inte deltar i Guess (t.ex. är Oracle i aktuell Round)
ska ViewerContext inte ange någon nästa GuessPart.

### Joker (privat under `GUESSING`)

- antal registrerade Jokrar för aktiv Performance
- per GuessPart: om Joker är registrerad
- återstående tillgängliga Jokrar (publikt saldo minus registrerade)

### Kandidater och hints (endast i `GUESSING`)

- Title/Artist:
  - CandidateSet.full (utan registrerad Joker)
  - CandidateSet.reduced (med registrerad Joker)
- Timeline:
  - korrekt decenniumintervall om Joker är registrerad

### Oracle-specifikt (endast för Oracle)

- facit (year, title, artist) i `GUESSING`
- Oracle Prediction (egen inskickad)
- möjlighet att låsa Round (om Prediction finns)

ViewerContext får aldrig motsäga Snapshot.

# NORMATIVT: Informationsregler före reveal

Före `REVEALED` gäller:

- Backend får inte exponera korrekt svar i Snapshot.
- Backend får inte exponera andra Players Guess.
- Backend får inte exponera Oracle Prediction i Snapshot.
- Backend får inte exponera information som indirekt avslöjar facit.

Privat Joker-hjälp får skickas endast till den Player som har registrerat Joker.

# NORMATIVT: Reveal

När Round övergår till `REVEALED`:

Snapshot ska visa:

- korrekt year
- korrekt title
- korrekt artist
- bedömning av alla GuessParts
- tilldelade Cards
- ⭐-markeringar
- uppdaterade publika Joker-saldon
- fastställd svårighetsgrad
- Oracle Prediction
- om Oracle Prediction var korrekt

All bedömning är då publik och definitiv.

# NORMATIVT: Relation till Performance-byte

Om Performance ersätts under `GUESSING`:

- tidigare privata Guess och Joker-registreringar upphör att gälla
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
