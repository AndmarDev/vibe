# docs/04-round.md

## Syfte

Detta dokument definierar Round, som är spelhändelsen för en Performance inom en Cycle.

Round äger sin state machine, reveal samt fastställer tilldelning av Cards och Jokers.

# NORMATIVT: RoundState

Varje Round har exakt ett av följande tillstånd:

- `WAITING_FOR_DJ`
- `GUESSING`
- `LOCKED`
- `REVEALED_TIMELINE`
- `REVEALED_FULL`

## WAITING_FOR_DJ

Round är skapad och DJ är utsedd.

- Ingen aktiv Performance behöver ännu finnas.
- Acting DJ kan starta Round genom att initiera första låten.

När Round startas:

- en Performance skapas
- den sätts som aktiv
- RoundState sätts till `GUESSING`

## GUESSING

Round pågår.

- Exakt en Performance är aktiv.
- Alla Players, inklusive Scheduled DJ, lämnar Guess.
- Players som inte är Scheduled DJ får spendera Jokers.
- Acting DJ kan ersätta aktiv Performance enligt `05-performance`.

## LOCKED

Round är låst.

- Inga nya GuessParts får skickas in.
- Round kan låsas upp endast i tillståndet `LOCKED` och övergår då till `GUESSING`.

## REVEALED_TIMELINE

Första reveal-steget är genomfört.

- Timeline-delen är bedömd.
- Round kan inte återgå till tidigare tillstånd.

## REVEALED_FULL

Full reveal är genomförd.

- Samtliga GuessParts är bedömda.
- Tilldelning av Cards och Jokers är fastställd.
- Round är avslutad.

`REVEALED_TIMELINE` och `REVEALED_FULL` är irreversibla tillstånd.

# NORMATIVT: Tillståndsövergångar

En Round får endast övergå mellan tillstånd enligt följande:

- Från `WAITING_FOR_DJ` till `GUESSING`
- Från `GUESSING` till `LOCKED`
- Från `LOCKED` tillbaka till `GUESSING`
- Från `LOCKED` till `REVEALED_TIMELINE`
- Från `REVEALED_TIMELINE` till `REVEALED_FULL`

Inga andra övergångar är tillåtna.

# NORMATIVT: Aktörer

- Endast Acting DJ får starta Round (`WAITING_FOR_DJ → GUESSING`).
- Endast Acting DJ får låsa och låsa upp Round (`GUESSING ↔ LOCKED`).
- Endast Acting DJ får ersätta aktiv Performance under `GUESSING`.
- Endast Creator får utföra DJ Takeover.

DJ Takeover:
- Vid Takeover blir Creator Acting DJ.
- Scheduled DJ för Rounden ändras inte.
- Takeover påverkar inte framtida DJ-rotation.

# NORMATIVT: Tilldelning av Cards

Korttyper:

- Scheduled DJ får DJ Card, när hen får Card.
- Alla andra Players får Timeline Card, när de får Card.

Tilldelning sker i två steg.

Vid `REVEALED_TIMELINE`:
- Varje Player med korrekt Timeline får 1 Card.

Vid `REVEALED_FULL`:
- Varje Player som ännu inte fått Card och har korrekt Title och Artist får 1 Card.

En Player kan få högst 1 Card per Round.

# NORMATIVT: Tilldelning av Jokers

Joker kan tilldelas endast vid `REVEALED_FULL`.

Till skillnad från Card-tilldelning finns inga rollspecifika undantag:
alla Players, inklusive Scheduled DJ, kan tilldelas Joker.

En Player tilldelas 1 Joker om:

- Timeline är korrekt
- Title är korrekt
- Artist är korrekt

En Player kan vinna högst 1 Joker per Round.

Regler för Joker-saldo, spendering och reducering definieras i `07-joker`.

# NORMATIVT: Relation till Performance

- En Round kan referera flera Performances över tid.
- Högst en Performance är aktiv åt gången.
- Endast den Performance som är aktiv vid övergång till `REVEALED_TIMELINE`
  ligger till grund för bedömning och tilldelning.

Regler för ersättning av Performance definieras i `05-performance`.
