# docs/05-performance.md

# Syfte

Detta dokument definierar Performance.

Performance är den konkreta instansen av en Recording som används i en Round.

Round är spelhändelsen.
Performance är den aktuella låten som spelas och gissas på.

# NORMATIVT: Definition

En Performance är en instans av en Recording som används i en Round.

- En Performance tillhör exakt en Round.
- En Round kan referera flera Performances över tid.
- En Round har högst en aktiv Performance.
- Performance har ingen egen state machine. Den styrs helt av RoundState.

# NORMATIVT: Aktiv Performance

- En Round har högst en aktiv Performance åt gången.
- I tillståndet `GUESSING` ska exakt en Performance vara aktiv.
- Alla Guess gäller alltid aktiv Performance.
- Bedömning och tilldelning baseras på den Performance som är aktiv
  i det ögonblick då Round går från `GUESSING` till `LOCKED`.

# NORMATIVT: Val av Performance

När en Round skapas och är i state `READY`:

- två möjliga Performances presenteras för Dealer
- Dealer väljer en av dem
- den valda Performancen sätts som aktiv

Dealer känner inte till låtens facit vid valet.

När Dealer har valt en Performance övergår Round till state `GUESSING` och
Dealer får tillgång till facit (year, title, artist) för den valda Performancen.

Facit används därefter av systemet för bedömning och reveal.

# INFORMATIVT: Val av Performance-kandidater

De två Performances som presenteras för Dealer i `READY` tillhör samma year.

Syftet är att Dealer inte ska kunna påverka rundans svårighetsgrad genom sitt val.

# NORMATIVT: Uppspelning

Host ansvarar för uppspelning av den Recording som tillhör den aktiva Performancen.

Uppspelning påverkar inte RoundState.

# NORMATIVT: Byte av Performance

Om den aktiva Performancen inte kan spelas upp eller måste ersättas medan
Round är i `GUESSING`, övergår Round till `ABORTED` enligt regler i `04-round`.
En ny Round skapas och den nya Performancen behandlas som en helt ny gissningssituation.
