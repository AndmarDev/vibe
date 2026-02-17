# docs/01-glossary.md

## Syfte

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
Ett varv runt bordet där varje Player är DJ exakt en gång.

**Egenskaper:**
- Cycle består av Rounds.
- DJ-rotation sker per Round.
- En Player är DJ en gång per Cycle.
- Cycle är struktur, inte spelhändelse.

## Round

**Definition:**
En spelhändelse där en Performance är aktiv, Players lämnar Guesses och resultat fastställs.

**Egenskaper:**
- Round har exakt en DJ.
- Round har en state machine.
- Round kan referera flera Performances över tid.
- Round äger transitions och fastställer tilldelning av Cards och Jokers.

## Performance

**Definition:**
En instans av en Recording inom en Round.

**Egenskaper:**
- En Round kan referera flera Performances över tid.
- Högst en Performance är aktiv åt gången.
- Alla Guesses gäller aktiv Performance.
- Endast aktiv Performance ligger till grund för tilldelning av Cards och Jokers.
- Performance har ingen egen state machine.

## Player

**Definition:**
En deltagare i ett Game.

**Egenskaper:**
- Player existerar endast inom ett Game.
- Player är inte ett konto eller device.
- Player kan gissa, vara DJ, samt vinna Cards och Jokers.

## DJ

**Definition:**
Den Player som är utsedd att leda en specifik Round.

**Egenskaper:**
- Varje Round har exakt en DJ.
- DJ leder Roundens flöde enligt reglerna i `04-round`.
- DJ lämnar Guess som övriga Players.
- DJ får inte spendera Jokers i den Round där hen är DJ.
- När DJ tilldelas Card i sin Round är kortet ett DJ Card (utom vid DJ Takeover).

## Ordinarie DJ

**Definition:**
Den Player som utses till DJ genom Cycle-rotation enligt `03-cycle`.

**Egenskaper:**
- Ordinarie DJ är den normala DJ-rollen i en Round.
- DJ genom DJ Takeover är inte Ordinarie DJ.

## Creator

**Definition:**
Den Player som skapade Game.

**Egenskaper:**
- Det finns exakt en Creator per Game.
- Creator startar och avslutar Game.
- Creator kan utföra DJ Takeover.
- Creator deltar i övrigt som vanlig Player.

## DJ Takeover

**Definition:**
Creator övertar DJ-rollen i en aktiv Round.

**Egenskaper:**
- Creator blir DJ för Rounden.
- Creator lämnar Guess som övriga Players.
- Creator kan inte tilldelas DJ Card i den Rounden.
- Om Creator gissar korrekt under Takeover, tilldelas hen ett Timeline Card.
- Takeover påverkar inte framtida DJ-rotation.

## Guess

**Definition:**
En Players samlade svar för en Performance.

**Egenskaper:**
- En Player har högst en Guess per Performance och den gäller alltid aktiv Performance.
- Guess består av GuessParts.
- Guess bedöms vid reveal.

## GuessPart

**Definition:**
En separat bedömd del av en Guess.

**Typer:**
1. Timeline
2. Title
3. Artist

**Egenskaper:**
- GuessParts skickas in sekventiellt.
- GuessParts bedöms separat.

## Card

**Definition:**
Ett persistent objekt som tillhör en Player i ett Game.

Card är en kategori som inkluderar:

- Start Card
- Timeline Card
- DJ Card

**Egenskaper:**
- Card tillhör exakt en Player.
- Card är persistent under hela Game.
- Alla Card-typer räknas lika i total Card count.
- En Player kan få högst ett Card per Round.
- Vissa Cards genereras av Round, andra skapas vid Game-start.

## Start Card

**Definition:**
Ett Card som skapas vid Game-start och etablerar Playerns initiala timeline-position.

**Egenskaper:**
- Innehåller endast year.
- Har ingen Song.
- Placeras i Playerns timeline.

## Timeline Card

**Definition:**
Ett Card som genereras av en Round när en Player uppfyller villkoren för korrekt Guess.

**Egenskaper:**
- Innehåller Song och year.
- Placeras i Playerns timeline.
- Påverkar framtida timeline-guessing.

## DJ Card

**Definition:**
Ett Card som genereras när DJ lämnar en korrekt Guess i en Round utan DJ Takeover.

**Egenskaper:**
- Räknas som Card i total Card count.
- Placeras inte i timeline.
- Påverkar inte framtida timeline-guessing.

## Joker

**Definition:**
En begränsad resurs som kan tilldelas baserat på Guess-utfall.

**Egenskaper:**
- Tillhör en Player inom ett Game.
- En Player kan vinna högst 1 Joker per Round.
- En Player kan inneha högst 3 Jokers samtidigt.
- Jokers spenderas när Player väljer att reducera alternativ för en GuessPart (före submit).
- Jokers påverkar inte facit.

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
- Round har exakt en DJ.
- Högst en Performance är aktiv per Round.
- Guess gäller alltid aktiv Performance.
- Cards och Jokers genereras genom Round.
