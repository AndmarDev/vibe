# docs/_writing.md

## Syfte
Detta dokument definierar **hur dokumentationen i detta projekt ska skrivas**.

Syftet är att:
- bevara begreppslig disciplin
- skilja normativt innehåll från förklarande text
- minska risken för dokumentationsglidning över tid

Detta dokument beskriver **skrivprinciper**, inte arbetsprocess.

## Normativt vs informativt innehåll

Dokumentationen använder två typer av text:

### Normativt
Normativ text:
- definierar begrepp
- låser regler och betydelser
- är bindande för implementation

Normativ text ska:
- vara kort
- vara exakt
- undvika exempel om de inte är nödvändiga

Om normativ text ändras, ändras systemets kanon.

### Informativt
Informativ text:
- förklarar varför något är som det är
- ger intuition eller motivation
- är inte bindande

Informativ text ska:
- vara tydligt avskild
- aldrig motsäga normativ text
- kunna tas bort utan att reglerna ändras

## Begreppsanvändning

- Endast begrepp som är definierade i dokumentationen är normativa.
- Samma begrepp ska alltid användas med samma innebörd.
- Synonymer används inte för normativa begrepp.

Nya begrepp införs aldrig informellt i dokumentationen.
Begreppsändringar följer projektets etablerade process (se `process.md`).

Tekniska namn i kod eller API är inte normativa begrepp.
De får inte ändra eller utöka spelreglernas innebörd.

## Språklig disciplin

Endast definierade engelska domänbegrepp får användas som substantiv.
Övrig löptext ska använda etablerad svenska.
Odefinierade engelska ord får inte introduceras informellt.

## Exempel

Exempel används:
- endast när de tillför precision
- aldrig som ersättning för definitioner

Exempel är alltid **informativa**, aldrig normativa, även om de råkar se rimliga ut.

## Korsreferenser

Korsreferenser används **med omdöme**, när de ökar tydlighet eller
hjälper läsaren att förstå dokumentens avgränsning.

De används när:
- ett begrepp definieras på exakt ett ställe
- ett dokument uttryckligen avgränsar sig mot eller bygger vidare på ett annat
- det är viktigt att peka ut var normativ auktoritet finns

Korsreferenser används **inte**:
- slentrianmässigt
- för att skapa sken av fullständighet
- som ersättning för tydliga definitioner i texten
- för att bygga kedjor eller cirklar av beroenden mellan dokument

I de flesta fall ska samband uttryckas genom konsekvent begreppsanvändning i löptexten.

## Dokumentens ansvar

Varje dokument ska:
- vara så självbärande som möjligt
- ha ett tydligt avgränsat syfte
- inte upprepa andra dokument i onödan

Dokument är:
- inte kodkommentarer
- inte tutorials
- inte implementationsexempel

De är systemets **normativa referens**.

## Disciplin: Nivåläckage

Ett dokument får inte definiera eller omtolka regler,
begrepp eller tillstånd som ägs av en annan nivå i modellen.

Om en regel hör till en annan nivå ska den:
- flyttas till rätt dokument, eller
- refereras utan att dupliceras.

Normativ auktoritet får aldrig spridas över flera dokument.

## Stil och ton

- Föredra precision framför pedagogik.
- Undvik metaforer.
- Undvik framtidslöften (“senare”, “i V2”).
- Skriv som om dokumenten ska läsas om ett år,
  utan tillgång till dagens kontext.

## Sammanfattning

- Skriv lite, men exakt.
- Lås begrepp tidigt.
- Förklara endast där det behövs.
- Undvik slentrian.
- Dokumentationen är systemets kanon.
