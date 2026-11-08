# Werken met AI — prompts, iteraties en debugging

Dit project is gebouwd met **Claude Code** (in VS Code) als programmeerpartner. Dit document toont hoe ik prompts formuleerde, hoe ik het resultaat kritisch bijstuurde, en welke bugs we vonden en oplosten in code die ik niet zelf schreef.

## Werkwijze

1. **Kleine, concrete prompt**: één wens per keer, met wat ik zie en wat ik wil zien.
2. **AI past de code aan** en controleert met `npm run build`.
3. **Visuele controle**: de AI maakte screenshots in headless Chrome (desktop, gsm staand en liggend) en keek die na voor ze "klaar" zei.
4. **Ik beoordeel** in de browser en geef gerichte feedback ("de hand verdwijnt achter het blauwe vlak", "ik zie de oude kleur nog").
5. Bij twijfel over wat ik bedoelde, gaf de AI aan hoe ze mijn prompt had gelezen, zodat ik kon corrigeren.

## Promptlogboek (selectie)

| # | Prompt (samengevat) | Wat de AI deed | Mijn kritische bijsturing |
|---|---|---|---|
| 1 | "Zorg dat bij refresh het huis smooth ingroeit" | Zoomanimatie van 35 % naar 100 % in 1,4 s | Goed. Later bleek "recht van voren" niet wat ik wilde, dus die wijziging heb ik zelf teruggedraaid. |
| 2 | "Intro: mannetje groot links, huis rechts, maak een tutorial over kleuren en stijl" | Groot mannetje met eigen canvas, 9 tutorialstappen met highlights | Teksten over verborgen functies (broodjes, munten, timer) moesten eruit. |
| 3 | "Als mijn mannetje zwaait belandt zijn hand achter het blauwe vlak" | Diagnose: niet de ballon maar de **rand van zijn canvas** knipte de hand af. Opgelost door de camera asymmetrisch te zetten. | Goede analyse, want mijn beschrijving van de oorzaak klopte niet. |
| 4 | "Zorg dat de kleur deftig verandert, ik zie de oude kleur van de kussens nog" | De naad rond de sierkussens volgt nu automatisch de kussenkleur | Ook oude opgeslagen kleuren worden nu correct getoond. |
| 5 | "Let op details: boeken langer, planten die goed in potten staan" | Nieuwe `createBookRow` en `createPottedPlant`, gecontroleerd met close-ups | Bij de eerste versie werden groene boeken "bladeren" (zie debugging 2). |
| 6 | "Broodjes en centjes weg, alles responsive" | Stappen weg, munten verborgen, aparte gsm-layouts | Getest op 390×844 en 844×390: de ballon liep buiten beeld, dat is opgelost. |
| 7 | "Maak mijn mannetje beter, denk aan kledij en haar" | Overhemd, T-shirt, jeans, sneakers, krullen in 2 tinten, gezicht | Eerste versie: de haarkap viel over de ogen. Die is naar achter gekanteld. |
| 8 | "Haal het mannetje met de uitleg weg, behoud de tekstballon" | Portret en code volledig verwijderd | Ik koos zelf voor een eenvoudiger concept. |
| 9 | "Tekstballon echt zoals in strips met een puntje, pixelated" | 9-slice pixel-SVG-rand en een getekende pixelwig | Eerste staart was te dun, die is opnieuw getekend. |
| 10 | "Bureau en keuken ook aanpassen", "muur ook", "3 totaal verschillende sofa's met icoontjes" | Generiek aanpaspaneel, eigen paletsleutels, 3 sofamodellen | Klikken op de tv opende de muur (zie debugging 4). |
| 11 | "Bureau en keuken andere stijlen, niet glitchen met het mannetje, stoel hoort bij bureau" | 3 bureausets en 3 keukens, bureau en stoel als set | Elk bureau van opzij gecontroleerd terwijl het mannetje typt. |
| 13 | "Vakjes van het aanpassen ook pixelated; mijn site is ingezoomd en ik geraak niet weg" | Panelen met pixelrand; camerabug gevonden en opgelost | Eerst nagebootst in plaats van gegokt, daarna een test die de bug vastlegt |
| 12 | "Altijd eerst dag, sterren 's nachts, muur niet meer aanpasbaar, tijdens de tut wordt het afgesneden bij inzoomen, reling boven ontbreekt" | Dagmodus los van het uur, pixelsterren, de muur uit de klikbare meubels, tutorial-layout via de camera, extra reling | Ik heb de muur bewust teruggeschroefd: minder is hier beter. |

### Wat ik leerde over prompts

- **Werkt goed:** beschrijven wat je *ziet* ("de hand verdwijnt", "ik zie de oude kleur nog een beetje"), één wens per prompt, en een referentie geven ("zoals in de strips").
- **Werkt minder:** vage woorden zoals "froefroe" of "links gecentreerd". De AI moest gokken en gaf haar interpretatie terug. Beter is: "haal de schaduw en het pijltje weg" of "zet het huis in het midden van het scherm".
- Een **betere versie** van prompt 11 zou zijn geweest: *"Geef bureau en keuken elk 3 modellen (zoals bij de sofa, met icoontjes). Bureau en stoel zijn één set. Het mannetje moet op elk bureau correct zitten en typen; controleer met een screenshot van opzij."*

## Debugging van code die ik niet zelf schreef

| # | Symptoom | Oorzaak | Oplossing | Controle |
|---|---|---|---|---|
| 1 | Oude kussenkleur nog zichtbaar | De naad (`TubeGeometry`) had een eigen paletsleutel die niet mee veranderde | `userData.followsPaletteKey`: de naad volgt de kussenkleur, iets donkerder | Screenshot met een oude opgeslagen kleur |
| 2 | Groene boeken werden zwevende ovalen | `refineRoomObjects()` zet elke platte olijfgroene `BoxGeometry` om in een blad | `userData.keepShape = true` op boeken | Close-up van de boekenplank |
| 3 | Aarde lag als een deksel op de pot, bladeren zweefden | De aarde stond boven de rand, de bladeren hadden geen stengel | Nieuwe plantenfunctie: aarde onder de rand, bladeren met de punt in de aarde | Close-ups per plant |
| 4 | Klik op de tv opende "Muur aanpassen" | Er werd enkel op aanpasbare meubels geraycast, dus de muur achter de tv werd geraakt | Raycast op de hele kamer, de eerste *zichtbare* hit telt | e2e-test *klik op de tv opent niets* |
| 5 | Verborgen sofamodellen bleven klikbaar en lichtten op | three.js' raycaster negeert `visible` van ouders | `isShown()` controleert alle ouders en de doorzichtigheid | e2e + handmatig |
| 6 | Oplichtende rand toonde het oude sofamodel | De hover-outline is één keer gekloond | Modellen herkennen via `userData` (die mee gekloond wordt) en samen wisselen | Screenshot met hover |
| 7 | Build faalde: `lightningcss: Unexpected token` | Aanhalingstekens in een inline SVG-data-URI in CSS | Volledige URL-codering van de SVG | `npm run build` |
| 8 | Knoppen liepen uit de tekstballon | Een grid-kolom groeide mee met de minimale breedte van de knoppen | `grid-template-columns: minmax(0, 1fr)` en `flex-wrap` | Screenshots op 3 formaten |
| 9 | Slepen om te draaien opende soms een paneel | `click` vuurt ook na een sleepbeweging | Drempel van 6 px tussen `pointerdown` en `click` | e2e *slepen opent geen paneel* |
| 10 | Screenshots toonden de animatie niet | Headless Chrome speelt CSS-animaties niet realtime af | Wandelduur tijdelijk op 60 s gezet om de pose te controleren, daarna terug | — |
| 11 | Eigen unit-test faalde ("icoon bevat `<rect`") | Fout in de **test**: sommige icoontjes gebruiken `<path>` | Test aangepast, niet de code | `npm test` |
| 12 | Huis afgesneden bij inzoomen tijdens de tutorial | Het canvas werd met CSS `scale(0.8)` verkleind, dus bij inzoomen zag je de rand van het canvas | Verschuiven/verkleinen via `camera.setViewOffset`, zodat het canvas altijd schermvullend is | e2e: *canvas vult het hele scherm* |
| 13 | Alle browsertests liepen vast (time-out) | `waitForFunction` wacht standaard per animatieframe, en met WebGL in software komen er bijna geen frames | `polling: 250` | `npm run test:e2e` |
| 15 | "Mijn website is ingezoomd en ik geraak niet weg" | Bij wisselen van meubel terwijl de camera nog terugzoomde, werd het half ingezoomde beeld als terugkeerpunt bewaard | Het terugkeerpunt van de lopende terugzoom hergebruiken, zoomgrenzen instellen en een huisjesknop toevoegen | e2e: *je zit niet vast ingezoomd* en *huisjesknop* |
| 16 | Browsertests liepen nog steeds vast, ook na de polling-fix | Elke klik wacht op een getekend frame; SwiftShader haalde 2 fps | Gemeten: met de echte GPU 47–50 fps, dus de SwiftShader-vlag verwijderd | 38/38 e2e geslaagd in 4,7 min |
| 14 | Een rand van het trapgat boven had geen reling | Alleen de lange kant en het bordes hadden balusters | Reling langs de open linkerrand | Screenshot |

## Kritische noot

AI levert snel werkende code, maar niet altijd de juiste. Wat telde: elke wijziging **zien**, met screenshots op meerdere formaten en close-ups van details. Daarnaast de AI vragen haar interpretatie uit te leggen. Verschillende "klaar"-momenten bleken bij visuele controle nog fouten te hebben (punten 2, 3, 4 en 8 hierboven). Die zijn pas door die controle boven gekomen.
