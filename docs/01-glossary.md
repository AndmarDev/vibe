# docs/01-glossary.md

# Syfte

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
En strukturell enhet inom ett Game där varje Player är Oracle en gång.

**Egenskaper:**
- Cycle består av Rounds.
- Varje Player är Oracle exakt en gång per Cycle.
- Oracle-rotation är deterministisk.
- Cycle är struktur, inte spelhändelse.

## Round

**Definition:**
En spelhändelse inom ett Game där en låt spelas,
Players lämnar Guesses och resultat fastställs.

**Egenskaper:**
- Round har en Oracle.
- Oracle leder rundans flöde.
- Round har en state machine (definieras i `04-round`).
- En Round kan referera flera Performances över tid.
- Högst en Performance är aktiv åt gången.
- Round fastställer tilldelning av Cards och Jokrar (definieras i `04-round` och `07-joker`).

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
En Player som har tagits bort från Game är inte kvarvarande.

## Creator

**Definition:**
Den Player som skapade Game och ansvarar för dess livscykel.

**Egenskaper:**
- Det finns exakt en Creator per Game.
- Creator kan starta och avsluta Game.
- Creator kan ta bort Players.
- Creator ansvarar för ljuduppspelning.
- Creator deltar i övrigt som vanlig Player.

## Oracle

**Definition:**
Den Player som leder en specifik Round och som har facit.

**Egenskaper:**
- Varje Round har exakt en Oracle.
- Oracle leder Roundens transitions (start, lås, lås upp, reveal).
- Oracle får facit (year, title, artist) när Round övergår till `GUESSING`.
- Oracle gör Prediction istället för Guess och använder därför inga Jokrar.
- Oracle kan tilldelas ett Oracle Card enligt regler för Prediction.

## Prediction

**Definition:**
Oracles bedömning av svårighetsgrad (Lätt, Medel eller Svår) för aktiv Performance.

**Egenskaper:**
- Varje aktiv Performance kan ha högst en Prediction.
- Prediction är knuten till aktiv Performance.
- Oracle kan ändra Prediction under gissningsfasen och den blir definitiv när Round låses.
- Prediction bedöms vid reveal.
- Korrekt Prediction genererar ett Oracle Card.

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
Ett persistent objekt som tillhör en Player i ett Game och som tilldelas enligt Roundens regler.

Card är en kategori som inkluderar:
- Start Card
- Timeline Card
- Oracle Card

## Start Card

**Definition:**
Ett Card som skapas vid Game-start och etablerar Playerns initiala timeline-position.

**Egenskaper:**
- Innehåller endast year.
- Har ingen Song.
- Placeras i Playerns timeline.

## Timeline Card

**Definition:**
Ett Card som representerar rundans Song och placeras i Playerns timeline.

**Egenskaper:**
- Innehåller Song och year.
- Placeras i Playerns timeline.
- Påverkar framtida timeline-guessing.

## Oracle Card

**Definition:**
Ett Card som representerar rundans Song och tilldelas Oracle vid korrekt Prediction.

**Egenskaper:**
- Innehåller Song och year.
- Räknas (precis som alla typer av Card) i total Card count.
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
- Round har en Oracle.
- En Round kan ha högst en aktiv Performance åt gången.
- Guess gäller alltid aktiv Performance.
- Cards och Jokrar genereras genom Round.
- Oracle Prediction gäller alltid aktiv Performance.
