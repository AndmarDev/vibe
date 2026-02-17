
# docs/premium.md

## Syfte

Detta dokument definierar Premium som en produktpolicy:
vilka kapabiliteter som är tillgängliga för ett ägarskap (entitlement).

Premium ändrar inte spelmodellen i 01–07 eller reglerna i 08.

## NORMATIVT: Definition

Premium är en entitlement som ger utökade kapabiliteter inom spelets befintliga ram.

Premium är inte ett eget spel, inte ett spel-läge och inte en alternativ regeluppsättning.

## NORMATIVT: Kapabiliteter

Premium påverkar endast kapabiliteter vid skapande av Game:

- vilka Mixes som får väljas
- vilket maxPlayers som är tillåtet

Premium förändrar inte spelets regler, state machines eller transitions.

GameState, CycleState och RoundState är identiska oavsett Premium-status.

## NORMATIVT: Kontrollpunkt

Entitlement kontrolleras endast vid skapande eller ändring av Game-konfiguration.

Ingen entitlement-kontroll sker under en aktiv Round.

## INFORMATIVT: Motivation

Premium hålls separat för att undvika två spel.
Spelreglerna är kanon (01–07). Premium begränsar eller utökar endast val
vid skapande och konfiguration.
