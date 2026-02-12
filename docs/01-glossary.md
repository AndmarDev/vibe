# docs/01-glossary.md

## Syfte

Detta dokument definierar begreppen i ett socialt musikspel
där deltagare turas om att spela musik och gissa.

Begrepp som definieras här är normativa.
Regler och tillstånd definieras i respektive dokument.

## NORMATIVT: Spelmodell

## Game

**Definition:**
En spelomgång där Players deltar och Rounds spelas inom Cycles.

**Egenskaper:**
- Game är persistent.
- Game äger Players och övergripande flöde.
- Game består av Cycles.

## Cycle

**Definition:**
Ett varv runt bordet där varje Player är DJ exakt en gång.

**Egenskaper:**
- Cycle består av Rounds.
- DJ-rotation sker per Round.
- Cycle är struktur, inte spelhändelse.

## Round

**Definition:**
En spelhändelse där en Performance är aktiv, Players gissar och resultat fastställs.

**Egenskaper:**
- Round har exakt en DJ.
- Round har en state machine.
- Round kan referera flera Performances över tid.
- Round äger transitions och reveal samt fastställer tilldelning av Cards, Jokers och DJ Stars.

## Performance

**Definition:**
En instans av en Recording inom en Round.

**Egenskaper:**
- En Round kan ha flera Performances över tid.
- Högst en Performance är aktiv åt gången.
- Alla Guess och DJ Prediction gäller aktiv Performance.
- Endast aktiv Performance kan ligga till grund för tilldelning av Cards, Jokers och DJ Stars.
- Performance har ingen egen state machine.

## Player

**Definition:**
En deltagare i ett Game.

**Egenskaper:**
- Player existerar endast inom ett Game.
- Player är inte ett konto eller en device.
- Player kan gissa, vara DJ och vinna Cards, Jokers och DJ Stars.

## DJ

**Definition:**
Den Player som är utsedd att leda en specifik Round.

**Egenskaper:**
- Varje Round har exakt en DJ.
- DJ styr Roundens transitions enligt de tillåtna övergångarna i `04-round`.
- DJ lämnar ingen Guess i den Rounden.
- DJ lämnar en DJ Prediction för aktiv Performance.

## Creator

**Definition:**
Den Player som skapade Game.

**Egenskaper:**
- Det finns exakt en Creator per Game.
- Creator startar och avslutar Game.
- Creator kan utföra DJ Takeover.
- Creator deltar i övrigt som vanlig Player.

## Guess

**Definition:**
En Players samlade svar för en Performance.

**Egenskaper:**
- En Player har högst en Guess per Round och den gäller alltid aktiv Performance.
- Guess består av GuessParts.
- Guess bedöms vid reveal.

## GuessPart

**Definition:**
En separat bedömd del av en Guess.

**Exempel:**
1. Tidslinje
2. Låt
3. Artist

**Egenskaper:**
- GuessParts committas sekventiellt.
- GuessParts bedöms separat.

## DJ Prediction

**Definition:**
DJ:s bedömning av aktiv Performances svårighetsgrad.

**Egenskaper:**
- Tillhör Performance.
- Fastställs vid låsning.
- Ligger till grund för eventuell tilldelning av DJ Star.

## Card

**Definition:**
Ett persistent resultat som kan tilldelas en Player baserat på dennes Guess i en Round.

**Egenskaper:**
- Tillhör Player inom ett Game.
- Uppstår vid reveal.
- En Player kan få högst ett Card per Round.

## Joker

**Definition:**
En begränsad resurs som kan tilldelas en Player baserat på dennes Guess i en Round.

**Egenskaper:**
- Tillhör Player inom ett Game.
- En Player kan vinna högst en Joker per Round.
- Spenderas i samband med commit av GuessPart.
- Påverkar inte facit.

## DJ Star

**Definition:**
Ett persistent resultat som kan tilldelas DJ baserat på DJ Prediction i en Round.

**Egenskaper:**
- Tillhör Player inom ett Game.
- En Round kan generera högst en DJ Star.
- Används vid tie-break i slutresultat.

## DJ Takeover

**Definition:**
Creator övertar DJ-rollen i en aktiv Round.

**Egenskaper:**
- Creator blir DJ för Rounden.
- DJ Star utdelas inte i den Rounden.

## NORMATIVT: Musikmodell

## Song

**Definition:**
Kuraterad musikalisk identitet (titel, artist, år).

**Egenskaper:**
- Song är persistent.
- Song är inte uppspelningsbar.
- Song kan tillhöra Mixes.

## Recording

**Definition:**
En uppspelningsbar instans av en Song.

**Egenskaper:**
- Tillhör exakt en Song.
- Kan bytas utan att Song ändras.

## Mix

**Definition:**
En kuraterad samling av Songs.

**Egenskaper:**
- En Song kan tillhöra flera Mixes.
- Mix påverkar endast urval av Songs.

## NORMATIVT: Relationer

- Game består av Cycles.
- Cycle består av Rounds.
- Högst en Performance är aktiv per Round.
- Guess och DJ Prediction gäller alltid aktiv Performance.
- Recording tillhör exakt en Song.
- Cards, Jokers och DJ Stars genereras genom Round.
