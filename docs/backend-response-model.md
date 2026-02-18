# docs/backend-response-model.md

## Syfte

Detta dokument definierar hur spelets faktiska tillstånd presenteras för en specifik Player.

Backend skickar:

- Snapshot, en gemensam bild av spelet
- ViewerContext, en viewer-specifik kontext

Detta dokument definierar principen. Det definierar inte API-strukturen i detalj.

# NORMATIVT: Snapshot

Snapshot är den gemensamma bilden av spelet.

Snapshot innehåller det som är objektivt synligt för alla, till exempel:

- GameState
- aktuell Cycle och dess state
- aktuell Round och dess RoundState
- Scheduled DJ
- Acting DJ
- aktiv Performance (utan facit före reveal)
- synliga GuessParts
- Cards (Start Card, Timeline Card, DJ Card)
- Joker-saldo per Player
- facit i reveal-faser

Snapshot är identisk för alla Players vid samma tidpunkt.

Snapshot är en representation av spelets faktiska tillstånd.

# NORMATIVT: ViewerContext

ViewerContext är den del av svaret som är specifik för den Player som tar emot det.

ViewerContext är härledd från:

- Snapshot
- Playerns identitet i Game

ViewerContext kan innehålla viewer-specifik information
som inte förändrar spelets gemensamma tillstånd, till exempel:

- om Player är Scheduled DJ
- om Player är Acting DJ
- om Player är Creator
- vilken GuessPart som är nästa att skickas in
- reducerade alternativ vid Joker-spend
- Playerns aktuella Joker-saldo

# NORMATIVT: Ansvar

Backend:

- beräknar Snapshot
- beräknar ViewerContext
- validerar alla actions mot spelets regler
- är authoritative

Frontend:

- renderar från Snapshot + ViewerContext
- skickar actions
- implementerar inga egna spelregler

# NORMATIVT: Reveal och informationsgränser

Före reveal:

- Snapshot får inte innehålla facit.
- ViewerContext får inte innehålla facit eller indirekta facit-signaler.

Under `GUESSING` får backend skicka viewer-specifik hjälpinformation
(t.ex. reducerade alternativ via Joker), men aldrig korrekt svar.

Vid `REVEALED_TIMELINE`:

- Korrekt Timeline-facit är synligt.
- Cards för korrekt Timeline är synliga.
- Dessa Cards påverkas inte av senare reveal-steg.
- Inga Jokers tilldelas i detta steg.

Vid `REVEALED_FULL`:

- Samtliga GuessParts och korrekt svar är synliga.
- Cards för Title + Artist (för Players som ännu inte fått Card) är synliga.
- Tilldelade Jokers är synliga.
- Uppdaterade Joker-saldon är synliga.
