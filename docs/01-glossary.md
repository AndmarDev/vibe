# docs/01-glossary.md

# Syfte

Detta dokument definierar begreppen i ett socialt musikspel
där deltagare turas om att spela musik och gissa.

Begrepp som definieras här är normativa.
Regler och tillståndsövergångar definieras i dokument 02–07.

# NORMATIVT: Game Model

## Game

**Definition:**
En spelomgång där Players deltar och Rounds spelas inom Cycles.

**Egenskaper:**
- Game är persistent.
- Game äger Players och övergripande flöde.
- Game består av Cycles.

## Cycle

**Definition:**
En strukturell enhet inom ett Game som organiserar en följd av Rounds.

**Egenskaper:**
- Cycle består av Rounds.
- Cycle används för att strukturera Dealer-rotation.
- Cycle är struktur, inte spelhändelse.

## Round

**Definition:**
En spelhändelse inom ett Game där en Song spelas och Players lämnar Guesses.

**Egenskaper:**
- Round har en Dealer.
- Dealer leder rundans flöde.
- En Round kan referera flera Performances över tid.
- Högst en Performance är aktiv åt gången.

## Performance

**Definition:**
En instans av en Recording som används i en Round.

**Egenskaper:**
- Tillhör exakt en Round.
- En Round kan referera flera Performances över tid.
- Högst en Performance är aktiv åt gången.
- Performance har ingen egen state machine.

## Player

**Definition:**
En deltagare i ett Game.

**Egenskaper:**
- Player existerar endast inom ett Game.
- Player är inte ett konto eller device.
- Player kan lämna Guess, vara Dealer samt vinna Cards och Jokrar enligt Roundens regler.
- Player kan tas bort från Game.

**Kvarvarande Player:**
En Player som vid den aktuella tidpunkten ingår i Game.

En Player som har tagits bort från Game upphör att vara kvarvarande från och med borttagningstidpunkten.

## Host

**Definition:**
Den Player som ansvarar för Game under hela dess livscykel.

**Egenskaper:**
- Host skapar Game och är första Player att ansluta.
- Det finns exakt en Host per Game.
- Host bjuder in Players.
- Host kan ta bort Players.
- Host startar och avslutar Game.
- Host ansvarar för ljuduppspelning.
- Host deltar i övrigt som vanlig Player.

## Dealer

**Definition:**
Den Player som leder en specifik Round.

**Egenskaper:**
- Varje Round har exakt en Dealer.
- Dealer leder rundans flöde.
- Dealer väljer vilken Performance rundan spelas på.
- Dealer lämnar ingen Guess i sin egen Round.

## Guess

**Definition:**
En Players samlade svar för en Performance.

**Egenskaper:**
- En Player har högst en Guess per Performance.
- Guess gäller alltid aktiv Performance.
- Guess består av:
  - Placement
  - Title Guess
  - Artist Guess
- Guess bedöms vid reveal.

## Placement

**Definition:**
En Players försök att placera Song i sin tidslinje.

**Egenskaper:**
- Placement representerar en position i Playerns timeline.
- Positionen bestäms relativt de Cards som redan finns i timeline.
- Placement uttrycker ett implicit årintervall.
- Exakta regler för korrekthet definieras i `04-round`.

## Title Guess

**Definition:**
En Players val av title-alternativ för aktiv Performance.

**Egenskaper:**
- Tillhör exakt en Player.
- Tillhör exakt en Performance.
- Bedöms vid reveal.

## Artist Guess

**Definition:**
En Players val av artist-alternativ för aktiv Performance.

**Egenskaper:**
- Tillhör exakt en Player.
- Tillhör exakt en Performance.
- Bedöms vid reveal.

# NORMATIVT: Cards & Resources

## Card

**Definition:**
Ett persistent objekt som tillhör en Player i ett Game och som tilldelas enligt Roundens regler.

Card är en kategori som inkluderar:

- Start Card
- Vibe Card
- Hit Card

## Start Card

**Definition:**
Ett Card som etablerar ett ankare i en Players tidslinje.

**Egenskaper:**
- Innehåller endast year.
- Har ingen Song.
- Placeras i Playerns timeline.
- Påverkar framtida Placement.

## Vibe Card

**Definition:**
Ett Card som representerar en Song som en Player placerat korrekt i sin tidslinje.

**Egenskaper:**
- Innehåller Song och year.
- Placeras i Playerns timeline.
- Påverkar framtida Placement.
- Räknas i slutresultatet.

## Hit Card

**Definition:**
Ett Card som representerar en Song där Playern gissat korrekt Title och Artist men placerat låten fel i tidslinjen.

**Egenskaper:**
- Innehåller Song och year.
- Placeras inte i Playerns timeline.
- Påverkar inte framtida Placement.
- Räknas endast som utslagsgivare i slutlig ranking.

## Joker

**Definition:**
En resurs som en Player kan använda för att förenkla Placement i en Round.

**Egenskaper:**
- Tillhör en Player inom ett Game.
- Joker påverkar aldrig korrekt svar eller bedömning.
- Joker kan endast användas på Placement.
- Exakta regler för begränsningar, effekt, intjäning och saldo definieras i `07-joker`.

# NORMATIVT: Music Model

## Informativt: Syfte

Music Model beskriver den musikaliska datamodellen som spelet använder.

Den definierar relationen mellan:
- Song (den kuraterade musikidentiteten),
- Recording (en spelbar inspelning av en Song),
- Mix (en kuraterad samling av Songs).

Denna modell påverkar urvalet av musik som kan förekomma i spelet,
men den påverkar inte spelregler, state machines eller transitions.
Spelregler definieras i dokument 02–07.

## Song

**Definition:**
Kuraterad musikalisk identitet (title, artist, year).

**Egenskaper:**
- Song är persistent.
- Song är inte direkt spelbar.
- Song kan tillhöra flera Mixes.

## Recording

**Definition:**
En spelbar instans av en Song.

**Egenskaper:**
- Tillhör exakt en Song.
- Kan bytas utan att Song ändras.

## Mix

**Definition:**
En kuraterad samling av Songs.

**Egenskaper:**
- En Song kan tillhöra flera Mixes.
- Mix påverkar endast urval av Songs.

# NORMATIVT: Relationer

- Game består av Cycles.
- Cycle består av Rounds.
- Round har en Dealer.
- En Round kan ha högst en aktiv Performance åt gången.
- Guess gäller alltid aktiv Performance.
- Cards och Jokrar genereras genom Round.
- Start Cards och Vibe Cards placeras i Playerns timeline.
- Hit Cards placeras inte i timeline.
