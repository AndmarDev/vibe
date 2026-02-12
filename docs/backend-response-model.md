# docs/backend-response-model.md

## Syfte

Detta dokument definierar hur spelets faktiska tillstånd
presenteras för en specifik deltagare.

Backend skickar:

- en gemensam bild av spelet (Snapshot)
- en viewer-specifik kontext (ViewerContext)

Detta dokument definierar principen.
Det definierar inte API-strukturen i detalj.

## NORMATIVT: Snapshot

Snapshot är den gemensamma bilden av spelet.

Snapshot innehåller det som är objektivt synligt för alla, till exempel:

- GameState
- aktuell Cycle
- aktuell Round och dess tillstånd
- aktuell DJ
- synliga GuessParts
- Cards, Jokers och DJ Stars
- facit i reveal-faser

Snapshot är identisk för alla viewers vid samma tidpunkt.

Snapshot är en representation av spelets faktiska tillstånd.

## NORMATIVT: ViewerContext

ViewerContext är den del av svaret som är specifik
för den viewer som tar emot det.

ViewerContext är härledd från:

- Snapshot
- viewerns identitet i Game

ViewerContext kan innehålla till exempel:

- om viewern är DJ eller Player
- vilken GuessPart viewern får committa härnäst
- viewer-specifik narrowing vid Joker-användning
- om viewern får initiera vissa actions

ViewerContext är inte ett eget spelobjekt.
Det lagras inte som primär state.

Exakt struktur definieras i API-kontraktet.

## NORMATIVT: Ansvar

Backend:

- beräknar Snapshot
- beräknar ViewerContext
- validerar alla actions mot spelets regler

Frontend:

- renderar från: Snapshot + ViewerContext
- skickar actions
- implementerar inga egna spelregler

Backend är alltid authoritative.

## NORMATIVT: Reveal och informationsgränser

Före reveal:

- Snapshot får inte innehålla facit.
- ViewerContext får inte innehålla facit-signaler.

Under `GUESSING` får backend skicka viewer-specifik
hjälpinformation (t.ex. narrowing), men aldrig resultat.

## INFORMATIVT: Motivation

Spelets tillstånd är gemensamt.
Det som visas kan skilja sig mellan deltagare.

Genom att skilja på Snapshot och ViewerContext kan backend:

- visa olika information för olika deltagare
- dölja facit före reveal
- stödja reconnect utan specialfall

Frontend behöver då endast rendera det den får.
