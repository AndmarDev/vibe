# docs/04-round.md

## Syfte

Detta dokument definierar Round, som är spel­händelsen för en Performance inom en Cycle.

Round äger state machine, transitions, reveal och fastställer tilldelning av Cards, Jokers och DJ Stars.

## NORMATIVT: RoundState

Varje Round har exakt ett av följande tillstånd:

- `WAITING_FOR_DJ`
- `GUESSING`
- `LOCKED`
- `REVEALED_TIMELINE`
- `REVEALED_FULL`

## WAITING_FOR_DJ

Round är skapad och DJ är utsedd.

- Ingen aktiv Performance behöver ännu finnas.
- DJ kan starta `GUESSING`.

## GUESSING

Round pågår.

- Exakt en Performance är aktiv.
- Players lämnar Guess.
- DJ lämnar DJ Prediction för aktiv Performance.
- DJ kan skapa ny Performance enligt `05-performance`.

## LOCKED

Round är låst.

- Inga nya GuessParts får committas.
- DJ Prediction är fastställd.
- Round kan övergå till reveal.

Precondition för `GUESSING → LOCKED`:
- DJ Prediction finns för aktiv Performance.

Round får återgå till `GUESSING` så länge reveal inte har påbörjats.

## REVEALED_TIMELINE

Första reveal-steget är genomfört.

- Tidslinje-delen är bedömd.
- Round kan inte återgå till tidigare tillstånd.

## REVEALED_FULL

Full reveal är genomförd.

- Samtliga GuessParts är bedömda.
- Tilldelning av Cards, Jokers och DJ Stars är fastställd.
- Round är avslutad.

## NORMATIVT: Tillåtna övergångar

- `WAITING_FOR_DJ → GUESSING`
- `GUESSING → LOCKED`
- `LOCKED → GUESSING` (upplåsning)
- `LOCKED → REVEALED_TIMELINE`
- `REVEALED_TIMELINE → REVEALED_FULL`

Inga andra övergångar är tillåtna.

## NORMATIVT: DJ

- Varje Round har exakt en DJ.
- DJ styr transitions.
- DJ lämnar ingen Guess.
- DJ lämnar DJ Prediction under `GUESSING`.
- DJ initierar byte av Performance.

## NORMATIVT: DJ Takeover

DJ Takeover innebär att Creator övertar DJ-rollen i en aktiv Round.

- Creator blir DJ för Rounden.
- DJ Star utdelas inte i den Rounden.
- Takeover påverkar inte tillåtna transitions.

## NORMATIVT: Relation till Performance

- En Round kan referera flera Performances över tid.
- Högst en Performance är aktiv åt gången.
- Endast aktiv Performance ligger till grund för bedömning och tilldelning.
- Regler för skapande, byte och invalidation definieras i `05-performance`.
