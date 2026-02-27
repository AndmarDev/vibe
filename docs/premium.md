# docs/premium.md

# Syfte

Detta dokument definierar Premium och relaterade entitlements.

Premium reglerar kapabiliteter vid skapande av Game.
Premium påverkar aldrig spelregler, state machines eller transitions.

Spelmodellen i dokument 01–07 är identisk oavsett Premium-status.

# NORMATIVT: Entitlements

Följande entitlements kan förekomma:

- Free (ingen entitlement)
- Premium
- Mix (enskilda mix-köp)

Entitlements är knutna till ägare (store_user), inte till enskilda Players i ett Game.

# NORMATIVT: Player-gränser

Vid skapande av Game gäller:

Free:
- minPlayers = 3
- maxPlayers = 5

Premium:
- minPlayers = 3
- maxPlayers = 10

Player-gränser låses vid `startGame`.

Premium påverkar inte Player-count under en pågående Round.

# NORMATIVT: Mix-kapabiliteter

Free:
- tillgång till basmix (t.ex. All Time Hits)

Premium:
- tillgång till Premium-mixar (t.ex. Anthems, Evergreens)

Mix-entitlement:
- ger tillgång till specifik köpt Mix

Premium är ett krav för att få köpa extra Mixar, men Mix är en separat entitlement.

Vid skapande av Game väljer skaparen exakt en Mix.
Endast Mixar som är tillgängliga enligt ägarens entitlements får väljas.

# NORMATIVT: Kontrollpunkt

Entitlements kontrolleras endast vid:

- skapande av Game
- ändring av Game-konfiguration före `startGame`

Vid `startGame` fastställs Game-konfigurationen, inklusive `maxPlayers`.

Efter `startGame` sker ingen ytterligare entitlement-kontroll som påverkar deltagande eller kapacitet.

Entitlements som ändras under spelets gång påverkar endast framtida Games.

# INFORMATIVT: Princip

Spelet är ett och samma för alla.

Premium begränsar eller utökar endast vilka konfigurationsval som är tillåtna innan spelet startar.
