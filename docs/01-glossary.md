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
En strukturell enhet inom ett Game där varje Player är Oracle en gång.

**Egenskaper:**
- Cycle består av Rounds.
- I en avslutad Cycle har Players varit Oracle varsin gång.
- Oracle-rotation är deterministisk.
- Cycle är struktur, inte spelhändelse.

## Round

**Definition:**
En spelhändelse inom ett Game där en Song spelas, Players lämnar Guesses,
Oracle ger Prediction och resultat fastställs.

**Egenskaper:**
- Round har en Oracle.
- Oracle leder rundans flöde.
- En Round kan referera flera Performances över tid.
- Högst en Performance är aktiv åt gången.
- Round fastställer tilldelning av Cards och Jokrar (regler definieras i 04-round och 07-joker).

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
- Player kan lämna Guess, vara Oracle samt vinna Cards och Jokrar enligt Roundens regler.
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

## Oracle

**Definition:**
Den Player som leder en specifik Round och som har facit.

**Egenskaper:**
- Varje Round har exakt en Oracle.
- Oracle leder rundans flöde.
- Oracle gör Prediction istället för Guess.
- Oracle kan tilldelas ett Oracle Card enligt regler för Prediction.

## Prediction

**Definition:**
Oracles bedömning av svårighetsgrad (Lätt, Medel eller Svår) för aktiv Performance.

**Egenskaper:**
- Varje aktiv Performance kan ha högst en Prediction.
- Prediction bedöms vid reveal.
- Korrekt Prediction genererar ett Oracle Card.

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
- Placement är en Players försök att placera Song i sin tidslinje.
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
- Song Card
- Oracle Card

## Start Card

**Definition:**
Ett Card som skapas vid Game-start och etablerar Playerns initiala timeline-position.

**Egenskaper:**
- Innehåller endast year.
- Har ingen Song.
- Placeras i Playerns timeline.
- Påverkar framtida Placement.

## Song Card

**Definition:**
Ett Card som representerar en Song som en Player placerat korrekt i sin tidslinje.

**Egenskaper:**
- Innehåller Song och year.
- Placeras i Playerns timeline.
- Påverkar framtida Placement.
- Räknas i slutresultatet.

## Oracle Card

**Definition:**
Ett Card som representerar rundans Song och tilldelas Oracle vid korrekt Prediction.

**Egenskaper:**
- Innehåller Song och year.
- Placeras inte i Playerns timeline.
- Räknas inte i antalet kort i tidslinjen när vinnare koras.
- Används endast som utslagsgivare vid lika många kort i tidslinjen.

## Joker

**Definition:**
En resurs som en Player kan använda för att förenkla Placement i en Round.

**Egenskaper:**
- Tillhör en Player inom ett Game.
- Joker påverkar aldrig korrekt svar eller bedömning.
- Joker kan endast användas på Placement.
- Exakta regler för begränsningar, effekt, intjäning och saldo definieras i 07-joker.

# NORMATIVT: Music Model

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
- Round har en Oracle.
- En Round kan ha högst en aktiv Performance åt gången.
- Guess gäller alltid aktiv Performance.
- Cards och Jokrar genereras genom Round.
- Prediction gäller alltid aktiv Performance.
