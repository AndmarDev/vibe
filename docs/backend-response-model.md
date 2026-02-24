# docs/backend-response-model.md

## Syfte

Detta dokument beskriver hur backend skickar spelets tillstånd till en Player.

Backend skickar alltid två delar:

- **Snapshot** – samma för alla Players
- **ViewerContext** – extra information för just den Player som tar emot svaret

Dokumentet beskriver principen. Det låser inte exakt API-form.

Dokumentet definierar vad som får ligga i Snapshot respektive ViewerContext för att
undvika att privat information (t.ex. Joker-användning under `GUESSING`) blir publik.

# NORMATIVT: Snapshot

Snapshot är spelets gemensamma tillstånd.

Snapshot innehåller endast det som är objektivt sant för alla Players vid samma tidpunkt.

Exempel på innehåll:

- GameState
- aktuella Players
- aktuell Cycle och dess CycleState
- aktuell Round och dess RoundState
- utsedd DJ för Rounden
- aktiv Performance (utan facit före reveal)
- synliga GuessParts och deras submit-status
- Cards (Start Card, Timeline Card, DJ Card)
- Joker-saldo per Player (publikt saldo)
- ⭐-markeringar på Cards (om ett Card är markerat med ⭐ är det synligt i Snapshot)
- facit i reveal-faser (endast när reveal-reglerna säger att facit är synligt)

Snapshot är identisk för alla Players.

Snapshot visar varje Players publika Joker-saldo.
Under `GUESSING` är detta saldo stabilt och ändras inte av Joker-användning.
Saldo uppdateras först när Rounden når `REVEALED_FULL` enligt `07-joker`.

# NORMATIVT: ViewerContext

ViewerContext är information som endast gäller den Player som tar emot svaret.

ViewerContext härleds från:

- Snapshot
- mottagarens identitet

ViewerContext kan innehålla:

- Roller:
  - om mottagaren är Creator
  - om mottagaren är utsedd DJ i aktuell Round
- Progress:
  - vilken GuessPart mottagaren ska skicka in härnäst (endast i `GUESSING`)
- Joker (privat):
  - hur många Jokrar mottagaren har registrerat i Roundens aktiva Performance totalt
  - per GuessPart: om mottagaren har registrerat Joker på den GuessParten
- Kandidater och hints (endast i `GUESSING`, per mottagare):
  - Title/Artist: antingen CandidateSet.full eller CandidateSet.reduced
  - Timeline: ett tidsintervall (decennium) om mottagaren har registrerat Joker på Timeline

Vilken GuessPart som är nästa att skicka in härleds enbart från:
- vilka GuessParts mottagaren redan har submittat i den aktiva Performancen, och
- den fasta submit-ordningen i `06-guess`.

Om Round inte är i `GUESSING`, eller om GuessParts redan är
definitiva, ska ViewerContext inte ange någon nästa GuessPart.

ViewerContext får aldrig motsäga Snapshot.

# NORMATIVT: Kandidater och Joker-hints i svaret

Före reveal gäller:

- Backend får inte skicka korrekt svar (facit).
- Backend får inte skicka information som avslöjar facit.

Under `GUESSING` får backend skicka hjälp som beror på Joker-användning:

- Title/Artist: backend skickar den kandidatlista som gäller för mottagaren:
  - CandidateSet.full (utan Joker)
  - CandidateSet.reduced (med Joker)
- Timeline: om mottagaren har registrerat Joker på Timeline skickar backend
  ett decenniumintervall som innehåller rätt år (t.ex. 1980–1989).

Denna hjälp får aldrig exkludera korrekt alternativ och får aldrig avslöja facit.

# NORMATIVT: Reveal

Vid `REVEALED_TIMELINE`:

- korrekt år är synligt
- Cards som delas ut för korrekt Timeline är synliga
- inga Jokrar tilldelas i detta steg

Vid `REVEALED_FULL`:

- titel, artist och korrekt år är synliga
- Cards som delas ut för Title+Artist (för Players som ännu inte fått Card) är synliga
- ⭐ för Cards som vunnits med full pott är synliga
- tilldelade Jokrar är synliga
- uppdaterade publika Joker-saldon är synliga (enligt `07-joker`)

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
