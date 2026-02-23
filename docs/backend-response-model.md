# docs/backend-response-model.md

## Syfte

Detta dokument beskriver hur backend skickar spelets tillstånd till en Player.

Backend skickar alltid två delar:

- **Snapshot** – samma för alla Players
- **ViewerContext** – extra information för just den Player som tar emot svaret

Dokumentet beskriver principen. Det låser inte exakt API-form.

# NORMATIVT: Snapshot

Snapshot är spelets gemensamma tillstånd.

Snapshot innehåller endast det som är objektivt sant
för alla Players vid samma tidpunkt.

Exempel på innehåll:

- GameState
- aktuella Players
- aktuell Cycle och dess CycleState
- aktuell Round och dess RoundState
- utsedd DJ för Rounden
- aktiv Performance (utan facit före reveal)
- synliga GuessParts och deras submit-status
- Cards (Start Card, Timeline Card, DJ Card)
- Joker-saldo per Player
- facit i reveal-faser (endast när reveal-reglerna säger att facit är synligt)

Snapshot är identisk för alla Players.

Under `GUESSING` ändras inte det publika Joker-saldot,
även om en Player använder Jokrar i Rounden.

# NORMATIVT: ViewerContext

ViewerContext är information som endast gäller
den Player som tar emot svaret.

ViewerContext härleds från:

- Snapshot
- mottagarens identitet

ViewerContext kan innehålla:

- om mottagaren är Creator
- om mottagaren är utsedd DJ i aktuell Round
- vilken GuessPart som är nästa att skicka in
- hur många Jokrar mottagaren har använt i den pågående Rounden
- vilken kandidatlista eller vilket tidsintervall
  som ska visas under `GUESSING`

Vilken GuessPart som är nästa att skicka in
härleds enbart från:

- submit-status för mottagarens GuessParts, och
- den fasta submit-ordningen i `06-guess`.

Om Round inte är i `GUESSING`,
eller om GuessParts redan är definitiva,
ska ViewerContext inte ange någon nästa GuessPart.

ViewerContext får aldrig motsäga Snapshot.

# NORMATIVT: Kandidater och Joker-hints i svaret

Före reveal gäller:

- Backend får inte skicka korrekt svar (facit).
- Backend får inte skicka information som avslöjar facit.

Under `GUESSING` får backend skicka hjälp som beror på Joker-användning, till exempel:

- reducerad kandidatlista för Title/Artist (`candidates5`/`candidates2`)
- tidsintervall för Timeline (t.ex. 1980–1989 eller 1980–1984)

Denna hjälp får aldrig exkludera korrekt alternativ och får aldrig avslöja facit.

# NORMATIVT: Reveal

Vid `REVEALED_TIMELINE`:

- korrekt år är synligt
- Cards som delas ut för korrekt Timeline är synliga
- inga Jokrar tilldelas i detta steg

Vid `REVEALED_FULL`:

- titel, artist och korrekt år är synliga
- Cards som delas ut för Title+Artist (för Players som ännu inte fått Card) är synliga
- tilldelade Jokrar är synliga
- uppdaterade Joker-saldon är synliga

# NORMATIVT: Ansvar

Backend:

- beräknar Snapshot
- beräknar ViewerContext
- validerar actions mot spelreglerna
- är authoritative

Frontend:

- renderar från Snapshot + ViewerContext
- skickar actions
- implementerar inga egna spelregler
