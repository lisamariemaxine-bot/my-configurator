# PLAN — Pixel Home

## Doel

Eén product op een single-page site, gebouwd met **Vite + three.js**. Het product is een pixel-art huisje dat de bezoeker zelf inricht. Je kan het draaien en erop inzoomen, minstens drie eigenschappen zijn configureerbaar, de visuele identiteit komt uit het [moodboard](docs/moodboard.png), en de site werkt op desktop en mobiel.

## Opdracht → waar het zit

| Eis | Invulling | Bewijs |
|---|---|---|
| Eén product, single-page Vite + three.js | `index.html` + `src/main.js` + `src/living-room.js` | `npm run build` |
| Draaien en zoomen | `OrbitControls` (slepen, scrollen, knijpen), met grenzen op hoek en afstand | e2e: *slepen draait de camera*, *scrollen zoomt in* |
| ≥ 3 configureerbare eigenschappen | Sofa (model, 2 kleuren, kussenvorm), bureauset (model + 3 kleuren), keuken (model + 3 kleuren) | e2e: *configureren* |
| Visuele identiteit uit moodboard | Pixelfont, pixelrendering, stripballon, palet en objecten uit het moodboard | README → *Concept* |
| Responsive | Aparte layouts voor desktop, gsm staand en gsm liggend | e2e-project `mobile` (Pixel 7) + *responsive* |
| Documentatie voor agents | `README.md`, `PLAN.md`, `AGENTS.md`, `CLAUDE.md`, `docs/AI-WERKWIJZE.md` | — |
| Versiebeheer | Git, GitHub (`origin`), betekenisvolle commits | `git log` |
| Projectsetup, package management | `package.json` (scripts, engines), `package-lock.json`, `vite.config.js`, `playwright.config.js` | — |
| Systematisch testen | Vitest (unit) + Playwright (e2e, 2 schermformaten) | `npm run check` |

## Architectuur en beslissingen

- **Eén scène, themagroepen.** Elk meubel is een `THREE.Group` in `themeGroups` (bv. `sofa`, `desk`, `kitchen`). Elke mesh heeft `userData.paletteKey`. `setTheme(item, style, custom)` kleurt alle meshes van een groep opnieuw.
- **Modellen.** `modelGroup(item, name)` maakt per model een subgroep. `setFurnitureModel(item, name)` zet de zichtbaarheid via `userData.modelOf` en `userData.modelName`, ook in de oplichtende kopie (hover-outline). Zo hoeft er niets opnieuw opgebouwd te worden.
- **Eigen paletsleutels per onderdeel** (bv. `deskGaming`, `kitchenRetroAccent`). Anders kleuren gedeelde sleutels zoals `cream` ook andere dingen mee (kookplaten, toetsenbord). De winkelstijlen leiden ze af van hun basiskleur.
- **Bureau en stoel = één set.** Het frame van de stoel gebruikt de bureaukleur. Elk bureaumodel houdt de zitting op hoogte 0,89 bij (-3.3, -2.42), en het blad op 1,19 met vrije beenruimte. Zo zit het geanimeerde mannetje op elk model correct.
- **Klikken.** De eerste *zichtbare* hit onder de muis telt (raycast op de hele kamer). De doorzichtige bovenverdieping en weggefade muren tellen niet mee, en slepen (> 6 px) is geen klik. Zo opent een klik op de tv niet de muur erachter.
- **Tutorial-layout via de camera.** Tijdens de uitleg schuift en verkleint het beeld met `camera.setViewOffset` (`setViewShift`), niet met een CSS-transform op het canvas. Een verkleind canvas toonde zijn rand: bij inzoomen werd het huis afgesneden.
- **Camera.** Zoom begrensd (`minZoom` 0,3 en `maxZoom` 6). Wissel je van meubel terwijl de camera nog terugzoomt, dan blijft het oorspronkelijke beeld het terugkeerpunt. De huisjesknop zet altijd alles terug.
- **Pixelpanelen.** De aanpaspanelen gebruiken dezelfde 9-slice pixelrand als de tekstballon.
- **Dag/nacht.** Start altijd overdag, los van het uur. In nachtmodus verschijnt een sterrenhemel (`.night-stars`) achter het transparante canvas.
- **Muur bewust niet aanpasbaar** (keuze van de ontwerper). Geen hover en geen paneel, oude opgeslagen muurkleuren worden genegeerd.
- **Opslag.** `localStorage`, gelezen via `readStoredJSON` en gevalideerd met `keepValidChoices`. Kapotte of oude waarden vallen terug op de standaard.
- **Instellingen in data.** Modellen, icoontjes en kleurkiezers staan in `src/furniture-config.js` en zijn getest in `tests/unit`.
- **Verborgen, niet verwijderd.** Timer, eten geven, munten en de eten-winkel zijn via CSS verborgen (zie het blok onderaan `room-view.css`). De code blijft bestaan voor later.

## Testplan

**Unit (Vitest, `tests/unit/`)**
- Paletten: geldige hexkleuren, stijlen gebruiken enkel bestaande sleutels, afgeleide sleutels kloppen.
- `resolveColor`: eigen kleur gaat voor, terugval bij onbekende stijl of sleutel.
- Meubelconfig: 3 unieke modellen met icoon voor bureau en keuken, elke kleurkiezer wijst naar een bestaande sleutel, bureau en stoel als set, de muur zoomt niet in.
- Hulpfuncties: `darkenHex` (grenzen, ongeldige invoer), `readStoredJSON` (kapotte JSON, array, `null`, geen storage, storage die een fout gooit), `keepValidChoices`, `clamp`.

**Browser (Playwright, `tests/e2e/`, desktop 1440×900 + Pixel 7)**
- Laden zonder console-fouten; tutorial bij elke refresh; 7 stappen, vorige/volgende, Esc, ?-knop.
- Draaien (slepen) en zoomen (scrollen; enkel op desktop).
- Sofa: model + kussenvorm + kleur, bewaard na refresh.
- Bureau: 3 sets, de kleurkiezers wisselen mee, de keuze wordt bewaard.
- Keuken: model wisselen, kleur bewaard, "Herstel kleuren" wist de kleuren.
- Camera: van meubel wisselen en sluiten laat je niet ingezoomd achter; de huisjesknop zet de zoom terug.
- Randgevallen: de muur opent niets, klik op de tv opent niets, slepen opent niets, kapotte opslag, klikken op de bovenverdieping.
- Dag/nacht: start overdag, ook om 23u30 (klok vastgezet in de test); de nachtknop toont 46 sterren.
- Responsive: geen horizontale scroll, de ballon en de panelen passen in beeld, en tijdens de tutorial vult het canvas het hele scherm (geen CSS-transform).

**Handmatig/visueel (screenshots in headless Chrome tijdens de ontwikkeling)**
- Elk sofa-, bureau- en keukenmodel. Het mannetje aan elk bureau, van opzij bekeken, zodat er niets door elkaar steekt.
- Reling rond het hele trapgat boven (behalve waar de trap aankomt).
- Tekstballon en panelen op 1440×900, 390×844 en 844×390, dag en nacht.

## Bekende beperkingen en volgende stappen

- `src/attic-roof.js` bestaat maar wordt (nog) nergens gebruikt.
- De koelkast die opengaat voor eten werkt enkel in de klassieke keuken. Die functie is nu verborgen.
- WebGL is vereist. Zonder WebGL toont de pagina een melding.
- Ideeën: meer meubels configureerbaar maken (eettafel, boekenkast), een deelbare link met je inrichting, een "reset alles"-knop.
