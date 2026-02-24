# docs/01-glossary.md

## Syfte

Detta dokument definierar begreppen i ett socialt musikspel
där deltagare turas om att spela musik och gissa.

Begrepp som definieras här är normativa.
Regler och tillståndsövergångar definieras i dokument 02–08.

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
Ett varv runt bordet där varje Player är DJ varsin gång.

**Egenskaper:**
- Cycle består av Rounds.
- En Player är DJ en gång per Cycle.
- DJ-rotation sker per Round.
- Cycle är struktur, inte spelhändelse.

## Round

**Definition:**
En spelhändelse inom ett Game där en låt spelas,
Players lämnar Guesses och resultat fastställs.

**Egenskaper:**
- Round har en utsedd DJ.
- DJ leder rundans flöde.
- Round har en state machine (definieras i `04-round`).
- En Round kan referera flera Performances över tid.
- Högst en Performance är aktiv åt gången.
- Round fastställer tilldelning av Cards och Jokers (definieras i `04-round` och `07-joker`).

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
- Player kan gissa, vara DJ samt vinna Cards och Jokrar.
- En Player kan tas bort från spelet.
- En borttagen Player är inte längre en del av Game.
  Konsekvenser av borttagning definieras i `02-game` och `04-round`.

**Kvarvarande Player:**
En Player som fortfarande ingår i Game vid den aktuella tidpunkten.

En Player som har tagits bort från Game är inte kvarvarande och beaktas
inte i tilldelning av Cards, Jokers, DJ-rotation eller ranking.

## DJ

**Definition:**
Den Player som leder en specifik Round.

**Egenskaper:**

- Varje Round har en utsedd DJ.
- DJ spelar upp låten i Rounden.
- DJ kan byta låt.
- DJ kan spela låten flera gånger under `GUESSING`.
- DJ driver Roundens övergångar (start, lås, lås upp, reveal).
- DJ lämnar Guess på samma sätt som övriga Players.
- DJ får inte använda Jokrar i sin egen Round.
- Om DJ får Card i sin egen Round är det ett DJ Card.

## Creator

**Definition:**
Creator är den Player som skapar och administrerar Game.

**Egenskaper:**
- Det finns exakt en Creator per Game.
- Creator startar och avslutar Game.
- Creator deltar i övrigt som vanlig Player.
- Om DJ tas bort kan Creator driva ceremonin enligt `04-round`.

## Guess

**Definition:**
En Players samlade svar för en Performance.

**Egenskaper:**
- En Player har högst en Guess per Performance.
- Guess gäller alltid aktiv Performance.
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

## CandidateSet

**Definition:**
De svarsalternativ som spelet kan visa för GuessParts `Title` och `Artist` i en viss Performance.

**Egenskaper:**
- Skapas per aktiv Performance och GuessPart.
- Är gemensamt för alla Players i samma Round.
- Består av två nivåer: `full` och `reduced`.
- `reduced` är alltid en delmängd av `full`.
- Joker avgör vilken nivå som visas (regler i `07-joker`, format och krav i `08-candidates`).

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
- En Player kan få högst 1 Card per Round.
- Ett Card kan ha en markering (t.ex. ⭐). Betydelse och användning definieras i `04-round` och `02-game`.

## Start Card

**Definition:**
Ett Card som skapas vid Game-start och etablerar Playerns initiala timeline-position.

**Egenskaper:**
- Innehåller endast year.
- Har ingen Song.
- Placeras i Playerns timeline.

## Timeline Card

**Definition:**
Ett Card som en Player får när hen gissar rätt i en Round.

**Egenskaper:**
- Innehåller Song och year.
- Placeras i Playerns timeline.
- Påverkar framtida timeline-guessing.

## DJ Card

**Definition:**
Ett Card som utsedd DJ får vid korrekt gissning i sin egen Round.

**Egenskaper:**
- Räknas som Card i total Card count.
- Är inte en del av Playerns timeline-struktur.
- Påverkar inte framtida timeline-guessing.

## Joker

**Definition:**
En resurs som en Player kan använda under `GUESSING` för att förenkla en GuessPart.

**Egenskaper:**
- Tillhör en Player inom ett Game.
- Joker påverkar aldrig korrekt svar eller bedömning.
- Joker kan användas på `Timeline`, `Title` och `Artist`.
- Exakta regler för begränsningar, effekt, intjäning och saldo definieras i `07-joker`.

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
- Round har en utsedd DJ.
- En Round kan ha högst en aktiv Performance åt gången.
- Guess gäller alltid aktiv Performance.
- Cards och Jokrar genereras genom Round.
