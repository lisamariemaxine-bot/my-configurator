# AGENTS.md — werken aan Pixel Home

Instructies voor coding agents (Claude Code, Codex, …) en nieuwe ontwikkelaars. Lees eerst [README.md](README.md) (wat en hoe) en [PLAN.md](PLAN.md) (eisen, beslissingen, testplan).

## Commando's

```sh
npm install          # afhankelijkheden (npm + package-lock.json; geen yarn/pnpm)
npm run dev          # http://localhost:5173
npm test             # Vitest unit-tests (snel, geen browser)
npm run build        # moet altijd slagen voor je klaar bent
npm run test:e2e     # Playwright, desktop + mobiel; gebruikt de geïnstalleerde Google Chrome
npm run check        # alles samen
```

Een wijziging is pas klaar als `npm test` en `npm run build` slagen. Bij UI- of 3D-wijzigingen draai je ook `npm run test:e2e` en bekijk je de wijziging zelf, met een screenshot of in de browser. Dat op desktop (1440×900), gsm staand (390×844) en gsm liggend (844×390).

## Taal en stijl

- **Alle UI-tekst en code-commentaar in het Nederlands** (Vlaams, informeel "je"). Code-identifiers mogen Engels zijn.
- Geen puntkomma's, 2 spaties, enkele quotes. Volg de stijl van het bestand waarin je werkt.
- Visuele stijl: pixel-art. Gebruik `Press Start 2P` (`var(--px-font)`) voor titels en knoppen, harde pixelranden (box-shadow of SVG met `shape-rendering: crispEdges`), geen zachte schaduwen of blur in de tekstballon. De aanpaspanelen blijven wit, ook in nachtmodus.

## Waar staat wat

| Bestand | Inhoud |
|---|---|
| `src/living-room.js` | three.js-scène. `createLivingRoom()` bouwt alles en geeft een API terug (`setTheme`, `setFurnitureModel`, `setSofaModel`, `focusFurniture`, `getScreenPoint`, …). |
| `src/main.js` | DOM, panelen, tutorial (`tutorialSteps`), opslag in `localStorage`. |
| `src/furniture-config.js` | Data: winkelitems, pixelicoontjes (16×16 SVG), sofamodellen, `furnitureCustomizers` (modellen + kleurkiezers per meubel). |
| `src/palette.js` | `PALETTE`, `THEME_PALETTES`, `resolveColor()`. |
| `src/utils.js` | Pure hulpfuncties. Hier komen nieuwe testbare functies. |
| `src/room-view.css` | Alle CSS. De intro/tutorial en de gsm-layouts staan onderaan. |

## Patronen die je moet kennen

1. **Kleuren via paletsleutels.** Elke mesh krijgt `userData.paletteKey` (via `box()` of `detailMesh()`). Wil je een onderdeel apart kunnen kleuren, maak dan een **nieuwe sleutel** in `PALETTE` (en een afleiding in `THEME_PALETTES` indien nodig). Hergebruik geen gedeelde sleutel zoals `cream`, want dan kleuren andere voorwerpen mee.
2. **Een model toevoegen** (bv. een 4e bureau):
   - Bouw het in `living-room.js` in een `modelGroup('desk', 'naam')`.
   - Zet het in `furnitureCustomizers.desk.models` in `furniture-config.js`, met `key`, `label`, `icon` (16×16 SVG) en `parts` (`[paletsleutel, 'Kleur …']`).
   - De unit-tests controleren dat elke sleutel bestaat.
3. **Bureau = set met het mannetje.** Het geanimeerde mannetje zit aan het bureau op wereldpositie (-3.4, 0.89, 3.02), in desk-coördinaten (-3.3, 0.89, -2.42), en typt op hoogte 1,2. Elk bureaumodel moet zitting-bovenkant 0,89, bladhoogte 1,19 en vrije beenruimte tussen x -3.75 en -2.85 onder het blad houden. Controleer dit met een screenshot van opzij.
4. **`refineRoomObjects()` verandert BoxGeometry achteraf.** Olijf- of groene platte blokjes worden bladeren, `cream`/`terracotta`-kubussen worden potten. Wil je dat niet (bv. boeken), zet dan `mesh.userData.keepShape = true`, of gebruik een niet-Box-geometrie.
5. **Klikken en hover.** Gebruik `isShown(object)`: de raycaster negeert de zichtbaarheid van ouders niet. De muur is bewust **niet** aanpasbaar. Nieuwe aanpasbare meubels voeg je toe aan `customizableFurniture` (living-room.js) én aan `furnitureCustomizers` (furniture-config.js).
6. **Hover-outline = kopie van de groep.** Die wordt één keer gemaakt. Zichtbaarheid moet je dus via `userData` synchroniseren (zie `setFurnitureModel`), niet door alleen het origineel te wijzigen.
7. **Opslag.** Lees altijd via `readStoredJSON` en valideer met `keepValidChoices`. Ga ervan uit dat `localStorage` kapot, leeg of geblokkeerd kan zijn.

8. **Tutorial-layout.** Verschuif het beeld nooit met een CSS-transform op het canvas, want dan wordt het huis afgesneden bij inzoomen. Gebruik `room.setViewShift({ x, y, scale })`.
9. **Dag/nacht.** De site start altijd in dagmodus. Koppel nachtmodus niet opnieuw aan het uur.

## Testen

- **Unit:** `tests/unit/*.test.js`. Voeg tests toe voor elke pure functie en voor nieuwe config.
- **Browser:** `tests/e2e/pixel-home.spec.js`. In dev-modus bestaat `window.__pixelHome.room` met `getScreenPoint(naam)`, `projectPoint([x,y,z])` en `getCameraState()`. Gebruik die om op meubels te klikken. Het haakje zit **niet** in de productiebuild.
- Playwright draait Chrome **met de GPU**. Zet geen SwiftShader-vlag in `playwright.config.js`: dan haal je ±2 fps en lopen klikken vast. `waitForFunction` gebruikt `polling: 250`.
- Headless Chrome (CDP-screenshots) tekent WebGL soms in software. Screenshots zijn traag, en CSS-animaties lopen er niet in realtime. Test animaties door de duur tijdelijk te verlengen, en zet die daarna terug.

## Niet doen

- Niets committen in `node_modules/` of `dist/`. Geen secrets in de repo.
- Verborgen functies (timer, eten, munten) niet verwijderen zonder te overleggen. Ze zijn bewust via CSS verborgen.
- Geen nieuwe frameworks toevoegen (geen React of Tailwind). Het project is bewust vanilla JS + three.js.
