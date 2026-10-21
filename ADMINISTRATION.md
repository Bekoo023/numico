# Numico administratie

Het dashboard bevat drie gekoppelde onderdelen: bonnetjes uploaden en uitlezen, gecontroleerde uitgaven/btw per periode, en een administratie-assistent met opgeslagen gesprekken.

## Gebruik

1. Log in en upload een JPG, PNG, WebP of PDF (één bon per bestand).
2. Het origineel wordt privé bewaard. OpenAI leest leverancier, datum, valuta, totaal inclusief btw, vermelde btw, categorie en notities uit.
3. Vergelijk de uitkomst met het origineel. Ontbrekende bedragen blijven leeg. Controleer en sla de bon op; daarna telt hij mee.
4. Gebruik de periodefilters voor het overzicht én nieuwe vragen aan de assistent. Zoek- en statusfilters gelden alleen voor de bonnenlijst, niet voor de totalen.
5. Open een bestaande bon via Bekijken om hem te corrigeren of het origineel te downloaden. Bij een AI-fout blijft het bestand beschikbaar voor handmatige invoer of opnieuw uitlezen.

Bedragen worden als gehele centen opgeslagen. Creditnota's behouden hun negatieve bedragen. Valuta worden niet bij elkaar opgeteld. Btw op een bon wordt niet automatisch als aftrekbare voorbelasting beschouwd. Dit is een uitgavenadministratie, geen volledige verkoopboekhouding of aangifteservice.

## Backend en configuratie

De Laravel-backend gebruikt de bestaande Sanctum-authenticatie. Iedere bon, download, zoekopdracht en chat is begrensd tot de ingelogde gebruiker. Bestanden staan op de private local disk, nooit onder public/storage. Dubbele bestanden worden per gebruiker herkend met SHA-256. AI-aanvragen hebben snelheidslimieten en locks tegen gelijktijdige wijzigingen.

De nieuwe migratie `2026_10_21_000002_create_administration_tables.php` is lokaal uitgevoerd. Voor een andere omgeving: voer `php artisan migrate` uit vanuit backend. De database en private storage moeten samen geback-upt worden.

De AI leest uitsluitend de server-side `OPENAI_API_KEY` uit backend/.env. Het standaardmodel is `gpt-6-luna`; `OPENAI_MODEL` kan dit overschrijven. Er staat geen sleutel in de frontend. API-antwoorden worden met `store: false` aangevraagd. Geüploade documenten worden naar OpenAI verstuurd voor extractie; de assistent ontvangt gestructureerde gecontroleerde bongegevens en de recente gesprekscontext.

`backend/public/.user.ini` stelt uploads in op 10 MB en POST-verzoeken op 12 MB voor PHP-FPM/FastCGI. PHP kan dit bestand enkele minuten cachen. Apache-module- en CLI-servers gebruiken hun eigen PHP-configuratie. Het dashboard toont daarom de werkelijk door de backend gerapporteerde uploadlimiet. Voor een losse ontwikkelserver kan PHP gestart worden met `php -d upload_max_filesize=10M -d post_max_size=12M artisan serve`.

De frontend gebruikt `VITE_API_BASE_URL`, met `https://backend.test` als bestaande standaard. Laravel CORS staat momenteel `http://localhost:5173` toe. Pas dit aan bij een andere frontend-origin.

Let op: de bestaande root-.gitignore sluit de volledige backend-map uit. De backendwijzigingen staan lokaal op schijf maar komen daardoor niet automatisch mee in een Git-commit. Neem de benodigde bronbestanden mee bij deployment; houd .env, databases, uploads en vendor buiten versiebeheer.

## Assistent

De assistent ontvangt de actuele totalen voor alle gecontroleerde bonnen in de geselecteerde periode en maximaal de 200 nieuwste bonnen in detail. Notities zijn in die context begrensd op 500 tekens per bon. Voor vragen over oudere individuele bonnen kan de periode worden verkleind. Er worden maximaal 20 recente berichten gebruikt als gesprekscontext; het scherm toont de laatste 50 berichten, terwijl eerdere berichten in de database blijven staan.

Fiscale vragen worden met de webzoekfunctie ondersteund, beperkt tot Belastingdienst, overheid.nl en KVK. Expliciet herkende fiscale vragen vereisen een zoekactie; zonder bron volgt geen fiscale conclusie. De assistent kan geen boekingen wijzigen of aangifte indienen. Bronnen worden als links getoond. Documentteksten worden als onbetrouwbare data behandeld, niet als instructies.

## Controle en huidige beperking

- `cd backend` en `php artisan test`: tests met een geïsoleerde SQLite-geheugendatabase en gesimuleerde OpenAI-antwoorden; geen echte klanten of API-kosten.
- `cd frontend` en `npm run build`: TypeScript en productiebuild.
- Browsercontrole uitgevoerd op 375, 768, 1024 en 1440 pixels voor upload, extractie, correctie, opslag, dubbele uploads, zoeken, chat, bronnen en foutafhandeling, met een gesimuleerde API.
- Echte OpenAI-aanroep op 21 oktober 2026: HTTP 429, `credit_balance_exhausted`, type `insufficient_quota`. De sleutel wordt geladen, maar live extractie en AI-antwoorden kunnen pas volledig worden getest nadat het API-tegoed is aangevuld. Er zijn geen demo-bonnen in de applicatiedatabase toegevoegd.

Officiële implementatiereferenties: [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [file inputs](https://developers.openai.com/api/docs/guides/file-inputs), [web search](https://developers.openai.com/api/docs/guides/tools-web-search) en [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna).
