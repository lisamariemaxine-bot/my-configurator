import './room-view.css'
import { createLivingRoom } from './living-room.js'
import { shopItems, furnitureIcons, foodIcons, furnitureStyles, sofaModels, furnitureCustomizers } from './furniture-config.js'
import { darkenHex, readStoredJSON, keepValidChoices, clamp } from './utils.js'




const FURNITURE_STYLE_STORAGE_KEY = 'pixel-home-furniture-styles'
let selectedFurnitureStyles = {}
const FURNITURE_COLOR_STORAGE_KEY = 'pixel-home-furniture-colors'
const SOFA_CUSHION_SHAPE_STORAGE_KEY = 'pixel-home-sofa-cushion-shape'
const SOFA_MODEL_STORAGE_KEY = 'pixel-home-sofa-model'
let selectedSofaModel = 'modern'
// Gekozen model per meubel (bureau, keuken), bv. { desk: 'gaming' }
const FURNITURE_MODEL_STORAGE_KEY = 'pixel-home-furniture-models'
// Alleen bestaande modellen overhouden: een oude of kapotte waarde in localStorage breekt niets
let selectedFurnitureModels = keepValidChoices(
  readStoredJSON(window.localStorage, FURNITURE_MODEL_STORAGE_KEY),
  Object.fromEntries(Object.entries(furnitureCustomizers)
    .filter(([, config]) => config.models)
    .map(([item, config]) => [item, config.models.map(model => model.key)])),
)
try {
  const savedModel = localStorage.getItem(SOFA_MODEL_STORAGE_KEY)
  if (sofaModels.some(([key]) => key === savedModel)) selectedSofaModel = savedModel
} catch (error) {
  console.warn('Het sofamodel kon niet worden geladen.', error)
}
let customFurnitureColors = {}
let selectedSofaCushionShape = 'rounded'
try {
  customFurnitureColors = JSON.parse(localStorage.getItem(FURNITURE_COLOR_STORAGE_KEY) || '{}') || {}
} catch (error) {
  console.warn('Meubelkleuren konden niet worden geladen.', error)
}
const savedSofaColors = customFurnitureColors.sofa
const savedUpholsteryColor = savedSofaColors?.blue ?? savedSofaColors?.sky
if (savedUpholsteryColor) {
  savedSofaColors.sofaSeatCushion = savedUpholsteryColor
  savedSofaColors.sofaBackCushion = savedUpholsteryColor
}
try {
  const savedShape = localStorage.getItem(SOFA_CUSHION_SHAPE_STORAGE_KEY)
  if (savedShape === 'rounded' || savedShape === 'square') selectedSofaCushionShape = savedShape
} catch (error) {
  console.warn('De kussenvorm kon niet worden geladen.', error)
}

function saveCustomColors() {
  try {
    localStorage.setItem(FURNITURE_COLOR_STORAGE_KEY, JSON.stringify(customFurnitureColors))
  } catch (error) {
    console.error('Meubelkleuren konden niet worden opgeslagen.', error)
  }
}

try {
  const savedStyles = JSON.parse(localStorage.getItem(FURNITURE_STYLE_STORAGE_KEY) || '{}')
  selectedFurnitureStyles = Object.fromEntries(
    Object.entries(savedStyles).filter(([, style]) => furnitureStyles.some(([key]) => key === style)),
  )
} catch (error) {
  console.warn('Meubelstijlen konden niet worden geladen.', error)
}

document.querySelector('#app').innerHTML = `
  <div id="room-scene" role="img" aria-label="Kamer 1: The Living Room"></div>
  <time class="belgian-clock" id="belgian-clock" aria-label="Belgische tijd"></time>
  <section class="sofa-customizer" id="sofa-customizer" role="dialog" aria-labelledby="sofa-customizer-title" hidden>
    <header class="sofa-customizer-heading">
      <h2 id="sofa-customizer-title">Sofa aanpassen</h2>
      <button class="sofa-customizer-close" type="button" aria-label="Sofa-aanpassing sluiten">×</button>
    </header>
    <fieldset class="sofa-model-options">
      <legend>Model</legend>
      ${sofaModels.map(([key, label, icon]) => `<button type="button" data-sofa-model="${key}" aria-pressed="false">
        <svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${icon}</svg>
        <span>${label}</span>
      </button>`).join('')}
    </fieldset>
    <label class="sofa-color-control" for="sofa-body-color">Kleur sofa
      <input id="sofa-body-color" type="color" value="#B0D4D2">
    </label>
    <label class="sofa-color-control" for="sofa-cushion-color">Kleur sierkussens
      <input id="sofa-cushion-color" type="color" value="#94CAE2">
    </label>
    <fieldset class="sofa-shape-options">
      <legend>Vorm zitkussens</legend>
      <button type="button" data-cushion-shape="rounded">Rond</button>
      <button type="button" data-cushion-shape="square">Strak</button>
    </fieldset>
    <button class="sofa-customizer-reset" type="button">Herstel kleuren en vorm</button>
    <p>Je ziet elke aanpassing meteen.</p>
  </section>
  <section class="sofa-customizer furniture-customizer" id="furniture-customizer" role="dialog" aria-labelledby="furniture-customizer-title" hidden>
    <header class="sofa-customizer-heading">
      <h2 id="furniture-customizer-title"></h2>
      <button class="sofa-customizer-close furniture-customizer-close" type="button" aria-label="Aanpassen sluiten">×</button>
    </header>
    <fieldset class="sofa-model-options furniture-customizer-models" hidden></fieldset>
    <div class="furniture-customizer-colors"></div>
    <button class="sofa-customizer-reset furniture-customizer-reset" type="button">Herstel kleuren</button>
    <p>Je ziet elke aanpassing meteen.</p>
  </section>
  <nav class="floor-navigation" aria-label="Verdieping kiezen">
    <button type="button" class="floor-arrow" data-floor="1" aria-label="Bekijk bovenverdieping" aria-pressed="false" title="Bovenverdieping"><svg viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><path d="M10 4h4v3h3v3h3v3h3v6H1v-6h3v-3h3V7h3Z"/></svg></button>
    <button type="button" class="floor-arrow" data-floor="0" aria-label="Bekijk benedenverdieping" aria-pressed="true" title="Benedenverdieping"><svg viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><path d="M1 5h22v6h-3v3h-3v3h-3v3h-4v-3H7v-3H4v-3H1Z"/></svg></button>
    <button type="button" class="floor-visibility-toggle" aria-label="Verberg transparante verdieping" aria-pressed="true" title="Verberg transparante verdieping">
      <svg class="eye-open-icon" viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><path fill-rule="evenodd" d="M1 12h3V9h3V7h3V6h4v1h3v2h3v3h3v2h-3v3h-3v2h-4v1h-3v-1H7v-2H4v-3H1z M9 10h2V9h2v1h2v2h1v2h-1v2h-2v1h-2v-1H9v-2H8v-2h1z"/><path class="eye-pupil" d="M11 10h2v1h1v3h-1v1h-2v-1h-1v-3h1z"/></svg>
      <svg class="eye-closed-icon" viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><path fill-rule="evenodd" d="M1 12h3V9h3V7h3V6h4v1h3v2h3v3h3v2h-3v3h-3v2h-4v1h-3v-1H7v-2H4v-3H1z M9 10h2V9h2v1h2v2h1v2h-1v2h-2v1h-2v-1H9v-2H8v-2h1z"/><path class="eye-pupil" d="M11 10h2v1h1v3h-1v1h-2v-1h-1v-3h1z"/><g class="eye-slash"><rect x="17" y="2" width="4" height="4"/><rect x="14" y="5" width="4" height="4"/><rect x="11" y="8" width="4" height="4"/><rect x="8" y="11" width="4" height="4"/><rect x="5" y="14" width="4" height="4"/><rect x="2" y="17" width="4" height="4"/></g></svg>
    </button>
    <button class="night-toggle" type="button" aria-label="Automatische dag- en nachtmodus" aria-pressed="false" title="Automatische dag- en nachtmodus">
      <svg class="day-sun-icon" viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true">
        <path class="sun-edge" d="M9 1h6v1h3v2h2v2h2v3h1v6h-1v3h-2v2h-2v2h-3v1H9v-1H6v-2H4v-2H2v-3H1V9h1V6h2V4h2V2h3z"/>
        <path class="sun-light" d="M9 3h6v1h3v2h2v3h1v6h-1v3h-2v2h-3v1H9v-1H6v-2H4v-3H3V9h1V6h2V4h3z"/>
      </svg>
      <svg class="night-moon-icon" viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true">
        <path class="moon-edge" d="M12 1H9v1H6v2H4v2H2v3H1v6h1v3h2v2h2v2h3v1h3z"/>
        <path class="moon-light" d="M12 3H9v1H6v2H4v3H3v6h1v3h2v2h3v1h3z"/>
      </svg>
    </button>
  </nav>
  <div class="room-toolbar">
  <div class="hunger-status" role="group" aria-label="Kamerbediening">
    <svg viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><defs><clipPath id="bread-clip-1"><path d="M7 3H17V4H19V5H21V6H22V10H20V21H4V10H2V6H3V5H5V4H7Z"/></clipPath></defs><path class="bread-crust" d="M6 2H18V3H20V4H22V6H23V10H22V11H21V21H20V22H4V21H3V11H2V10H1V6H2V4H4V3H6Z"/><path class="bread-crumb-empty" d="M7 3H17V4H19V5H21V6H22V10H20V21H4V10H2V6H3V5H5V4H7Z"/><rect class="bread-fill" data-bread-fill="0" x="0" y="0" width="24" height="24" clip-path="url(#bread-clip-1)"/></svg>
    <svg viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><defs><clipPath id="bread-clip-2"><path d="M7 3H17V4H19V5H21V6H22V10H20V21H4V10H2V6H3V5H5V4H7Z"/></clipPath></defs><path class="bread-crust" d="M6 2H18V3H20V4H22V6H23V10H22V11H21V21H20V22H4V21H3V11H2V10H1V6H2V4H4V3H6Z"/><path class="bread-crumb-empty" d="M7 3H17V4H19V5H21V6H22V10H20V21H4V10H2V6H3V5H5V4H7Z"/><rect class="bread-fill" data-bread-fill="1" x="0" y="0" width="24" height="24" clip-path="url(#bread-clip-2)"/></svg>
    <svg viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><defs><clipPath id="bread-clip-3"><path d="M7 3H17V4H19V5H21V6H22V10H20V21H4V10H2V6H3V5H5V4H7Z"/></clipPath></defs><path class="bread-crust" d="M6 2H18V3H20V4H22V6H23V10H22V11H21V21H20V22H4V21H3V11H2V10H1V6H2V4H4V3H6Z"/><path class="bread-crumb-empty" d="M7 3H17V4H19V5H21V6H22V10H20V21H4V10H2V6H3V5H5V4H7Z"/><rect class="bread-fill" data-bread-fill="2" x="0" y="0" width="24" height="24" clip-path="url(#bread-clip-3)"/></svg>
    <button class="timer-toggle" type="button" aria-label="Timer instellen" aria-expanded="false" aria-controls="timer-panel" title="Timer">
      <svg viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><path class="timer-pixel-clock" d="M8 0h8v2h-2v2h4v2h2v2h2v10h-2v2h-2v2H6v-2H4v-2H2V8h2V6h2V4h4V2H8zm2 8v6h2v2h2v-2h-2V8z"/></svg>
      <output class="timer-badge" id="timer-badge" hidden>25:00</output>
    </button>
  </div>
  <div class="coin-display" role="group" aria-label="Munten verdiend met studeren" title="Een munt per studieminuut">
    <svg viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true">
      <path class="coin-edge" d="M11 1h10v2h4v3h3v4h2v12h-2v4h-3v3h-4v2H11v-2H7v-3H4v-4H2V10h2V6h3V3h4z"/>
      <path class="coin-face" d="M12 4h8v2h4v3h2v4h1v6h-1v4h-2v3h-4v2h-8v-2H8v-3H6v-4H5v-6h1V9h2V6h4z"/>
      <path class="coin-shine" d="M12 6h7v2h-5v2h-2v5h-2V9h2z"/>
      <text class="coin-symbol" x="17" y="22" text-anchor="middle">€</text>
    </svg>
    <output class="coin-balance" id="coin-balance" aria-label="Munten">0</output>
  </div>
  </div>
  <button class="character-hotspot" type="button" aria-label="Klik op het mannetje om eten te geven" title="Geef eten aan het mannetje" hidden></button>
  <section class="shop-panel" id="shop-panel" role="dialog" aria-labelledby="shop-title" hidden>
    <header class="shop-heading">
      <h2 id="shop-title">Winkel</h2>
      <button class="shop-close" type="button" aria-label="Winkel sluiten" title="Sluiten">×</button>
    </header>
    <div class="shop-categories" role="group" aria-label="Winkelcategorieën">
      <button class="shop-category" type="button" data-shop-category="food" aria-pressed="false">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 9c-2-4 1-6 4-6m-5 6c-7-5-13 1-10 9l4 10h14l4-10c3-8-4-14-11-9z"/></svg>
        <span>Eten</span>
      </button>
      <button class="shop-category" type="button" data-shop-category="furniture" aria-pressed="false">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 17v-4a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v4M4 17h24v8H4zm3 8v4m18-4v4M4 17v-3a3 3 0 0 1 3-3m21 6v-3a3 3 0 0 0-3-3"/></svg>
        <span>Meubelen</span>
      </button>
    </div>
    <div class="shop-catalog" hidden>
      <button class="shop-back" type="button">‹ Categorieën</button>
      <h3 class="shop-category-title"></h3>
      <div class="shop-products"></div>
      <div class="shop-controls" hidden></div>
      <div class="shop-preview" role="dialog" aria-label="Preview" hidden>
        <div class="shop-preview-stage" aria-hidden="true"></div>
        <span class="shop-preview-name"></span>
      </div>
    </div>
    <p class="shop-selection" aria-live="polite">Kies een categorie</p>
  </section>
  <button class="room-preview-back" type="button">‹ Terug naar winkel</button>
  <section class="timer-panel" id="timer-panel" role="dialog" aria-labelledby="timer-title" hidden>
    <header class="timer-heading">
      <h2 id="timer-title">Timer</h2>
      <button class="timer-close" type="button" aria-label="Timer sluiten" title="Sluiten">×</button>
    </header>
    <label class="timer-duration" for="timer-minutes">Duur in minuten
      <input class="timer-input" id="timer-minutes" type="number" min="1" max="180" step="1" value="25" inputmode="numeric">
    </label>
    <output class="timer-display" id="timer-display" aria-live="polite">25:00</output>
    <div class="timer-actions">
      <button class="timer-start" id="timer-start" type="button">Start</button>
      <button class="timer-reset" id="timer-reset" type="button">Reset</button>
    </div>
    <section class="stats-section" aria-labelledby="stats-title">
      <div class="stats-title-group">
        <h3 id="stats-title">Werktijden</h3>
        <span class="stats-demo-badge" hidden>Voorbeelddata</span>
      </div>
      <div class="stats-week-toolbar">
        <div class="stats-week-controls" aria-label="Week navigatie">
          <button class="stats-week-button stats-week-previous" type="button" aria-label="Vorige week" title="Vorige week">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5.5-6.5 6.5 6.5 6.5M8 12h12"/></svg>
          </button>
          <output class="stats-week-label" aria-live="polite"></output>
          <button class="stats-week-button stats-week-next" type="button" aria-label="Volgende week" title="Volgende week">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5.5 6.5 6.5-6.5 6.5M16 12H4"/></svg>
          </button>
        </div>
        <p class="stats-week-total">Totaal <output class="stats-week-total-value"></output></p>
      </div>
      <p class="stats-empty" hidden>Nog geen timertijd bijgehouden.</p>
      <div class="stats-chart" role="list" aria-label="Timertijd per dag deze week"></div>
    </section>
  </section>
  <div class="timer-alert" id="timer-alert" role="status" aria-live="assertive" hidden>
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5M9 2h6"/></svg>
    <span>Timer afgelopen</span>
  </div>
  <aside class="feed-menu" id="feed-menu" role="dialog" aria-labelledby="feed-title" hidden>
    <header class="feed-menu-heading">
      <h2 id="feed-title">Geef eten</h2>
      <button class="feed-menu-close" type="button" aria-label="Voermenu sluiten" title="Sluiten">×</button>
    </header>
    <p class="feed-empty">De koelkast is leeg.</p>
    <div class="feed-products" role="list"></div>
  </aside>
  <button class="tutorial-toggle" type="button" aria-label="Uitleg opnieuw bekijken" title="Uitleg">?</button>
  <button class="view-reset" type="button" aria-label="Terug naar het hele huis" title="Terug naar het hele huis">
    <svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true"><path fill="#fff" d="M5 1h2v1h1v1h1v1h1v1h1v1H1V5h1V4h1V3h1V2h1z"/><path fill="#fff" d="M2 6h8v5H2z"/><path fill="#426B83" d="M5 8h2v3H5z"/></svg>
  </button>
  <div class="intro" hidden>
    <section class="intro-bubble" role="dialog" aria-labelledby="intro-title" aria-describedby="intro-text">
      <p class="intro-step-count" aria-live="polite"></p>
      <h2 id="intro-title"></h2>
      <p class="intro-text" id="intro-text"></p>
      <button class="intro-action" type="button" hidden></button>
      <div class="intro-buttons">
        <button class="intro-skip" type="button">Overslaan</button>
        <button class="intro-previous" type="button">Vorige</button>
        <button class="intro-next" type="button">Volgende</button>
      </div>
    </section>
  </div>`

const belgianClock = document.querySelector('#belgian-clock')
const nightIndicator = document.querySelector('.night-toggle')
const belgianTimeFormatter = new Intl.DateTimeFormat('nl-BE', {
  timeZone: 'Europe/Brussels',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})
// Het huis start altijd in dagmodus (los van het uur); de bezoeker wisselt zelf met de zon/maan-knop.
function applyNightMode(isNight) {
  nightIndicator.setAttribute('aria-label', isNight ? 'Schakel dagmodus in' : 'Schakel nachtmodus in')
  nightIndicator.setAttribute('aria-pressed', String(isNight))
  nightIndicator.title = isNight ? 'Nachtmodus' : 'Dagmodus'
  nightIndicator.classList.toggle('is-night', isNight)
  document.body.classList.toggle('is-night', isNight)
  room?.setNightMode(isNight)
}
function updateBelgianClock() {
  const now = new Date()
  belgianClock.textContent = belgianTimeFormatter.format(now)
  belgianClock.dateTime = now.toISOString()
  window.setTimeout(updateBelgianClock, 1000 - now.getMilliseconds())
}
nightIndicator.addEventListener('click', () => {
  applyNightMode(!nightIndicator.classList.contains('is-night'))
})

const feedMenu = document.querySelector('#feed-menu')
const feedProducts = document.querySelector('.feed-products')
const feedEmpty = document.querySelector('.feed-empty')
const characterHotspot = document.querySelector('.character-hotspot')
const hungerStatus = document.querySelector('.hunger-status')
const breadFills = [...hungerStatus.querySelectorAll('[data-bread-fill]')]
let foodItems = []
let nextFoodId = 1
let displayedFood = null

function updateHungerStatus({ food }) {
  if (food === displayedFood) return
  displayedFood = food
  const filledBread = Math.max(0, ((food - 10) / 90) * breadFills.length)

  breadFills.forEach((bread, index) => {
    const fill = Math.min(1, Math.max(0, filledBread - index))
    const fillHeight = fill * 24
    bread.setAttribute('y', String(24 - fillHeight))
    bread.setAttribute('height', String(fillHeight))
  })
  hungerStatus.setAttribute('aria-label', `Eten: ${food}%`)
}

function renderFeedMenu() {
  feedEmpty.hidden = foodItems.length > 0
  feedProducts.replaceChildren(...foodItems.map(item => {
    const button = document.createElement('button')
    button.className = 'feed-product'
    button.type = 'button'
    button.dataset.foodId = item.id
    button.setAttribute('role', 'listitem')
    button.setAttribute('aria-label', `Geef ${item.name}`)
    const icon = foodIcons[item.name]
    const art = icon
      ? `<span class="feed-product-icon feed-product-icon--art" aria-hidden="true"><svg viewBox="0 0 16 16" shape-rendering="crispEdges">${icon}</svg></span>`
      : `<span class="feed-product-icon" style="--product-color:${item.color}" aria-hidden="true"></span>`
    button.innerHTML = `${art}<span class="feed-product-name">${item.name}</span><span class="feed-product-action">Geef</span>`
    return button
  }))
}

function openFeedMenu({ clientX, clientY, foods }) {
  if (getComputedStyle(characterHotspot).display === 'none') return
  foodItems = foods
  renderFeedMenu()
  feedMenu.hidden = false
  const bounds = feedMenu.getBoundingClientRect()
  feedMenu.style.left = `${Math.max(12, Math.min(clientX + 14, innerWidth - bounds.width - 12))}px`
  feedMenu.style.top = `${Math.max(12, Math.min(clientY + 14, innerHeight - bounds.height - 12))}px`
  feedMenu.querySelector('.feed-menu-close').focus()
}

function updateCharacterHotspot({ x, y, visible }) {
  characterHotspot.hidden = !visible
  characterHotspot.style.left = `${x - 40}px`
  characterHotspot.style.top = `${y - 58}px`
}

let room
try {
  room = createLivingRoom(document.querySelector('#room-scene'), updateHungerStatus, openFeedMenu, updateCharacterHotspot, openFurnitureCustomizer)
  // De muur is niet meer aanpasbaar: oude opgeslagen muurkleuren negeren
  delete customFurnitureColors.walls
  Object.keys({ ...selectedFurnitureStyles, ...customFurnitureColors }).forEach(group => {
    room.setTheme(group, selectedFurnitureStyles[group] || 'original', customFurnitureColors[group] || {})
  })
  room.setSofaCushionShape(selectedSofaCushionShape)
  room.setSofaModel(selectedSofaModel)
  Object.entries(selectedFurnitureModels).forEach(([item, model]) => room.setFurnitureModel(item, model))
} catch (error) {
  console.error(error)
  document.querySelector('#room-scene').innerHTML = '<p class="room-error">Dit huisje heeft WebGL nodig. Probeer een andere browser of zet hardwareversnelling aan.</p>'
}
// Sterrenhemel: glinsterende pixelsterretjes bovenaan, alleen zichtbaar in nachtmodus (achter het huis)
const nightStars = document.createElement('div')
nightStars.className = 'night-stars'
nightStars.setAttribute('aria-hidden', 'true')
let starSeed = 7
const starRandom = () => (starSeed = (starSeed * 9301 + 49297) % 233280) / 233280
for (let index = 0; index < 46; index++) {
  const star = document.createElement('i')
  if (index % 9 === 0) star.className = 'is-sparkle'
  star.style.left = `${(starRandom() * 98 + 1).toFixed(2)}%`
  star.style.top = `${(starRandom() * starRandom() * 42 + 1).toFixed(2)}%`
  star.style.animationDelay = `${(starRandom() * 4).toFixed(2)}s`
  star.style.animationDuration = `${(2.2 + starRandom() * 2.6).toFixed(2)}s`
  nightStars.append(star)
}
document.querySelector('#room-scene').prepend(nightStars)
applyNightMode(false)
updateBelgianClock()

characterHotspot.addEventListener('click', () => {
  const bounds = characterHotspot.getBoundingClientRect()
  openFeedMenu({
    clientX: bounds.left + bounds.width / 2,
    clientY: bounds.top + bounds.height / 2,
    foods: room?.getFoodItems() ?? [],
  })
})

const floorButtons = [...document.querySelectorAll('.floor-arrow')]
floorButtons.forEach(button => button.addEventListener('click', () => {
  if (!room) return
  const floor = Number(button.dataset.floor)
  room.setFloor(floor)
  floorButtons.forEach(option => option.setAttribute('aria-pressed', String(option === button)))
  document.querySelector('#room-scene').setAttribute('aria-label', floor === 1 ? 'Bovenverdieping' : 'Benedenverdieping: woonkamer')
}))

const floorVisibilityToggle = document.querySelector('.floor-visibility-toggle')
floorVisibilityToggle.addEventListener('click', () => {
  const isVisible = floorVisibilityToggle.getAttribute('aria-pressed') !== 'true'
  floorVisibilityToggle.setAttribute('aria-pressed', String(isVisible))
  floorVisibilityToggle.setAttribute('aria-label', isVisible ? 'Verberg transparante verdieping' : 'Toon transparante verdieping')
  floorVisibilityToggle.title = isVisible ? 'Verberg transparante verdieping' : 'Toon transparante verdieping'
  room?.setOtherFloorVisible(isVisible)
})

const shopPanel = document.querySelector('.shop-panel')
const shopClose = document.querySelector('.shop-close')
const roomPreviewBack = document.querySelector('.room-preview-back')
const sofaCustomizer = document.querySelector('#sofa-customizer')
const sofaCustomizerClose = sofaCustomizer.querySelector('.sofa-customizer-close')
const sofaBodyColor = sofaCustomizer.querySelector('#sofa-body-color')
const sofaCushionColor = sofaCustomizer.querySelector('#sofa-cushion-color')
const shopSelection = document.querySelector('.shop-selection')
const shopCategories = document.querySelector('.shop-categories')
const shopCatalogView = document.querySelector('.shop-catalog')
const shopProducts = document.querySelector('.shop-products')
const shopControls = document.querySelector('.shop-controls')
const shopPreview = document.querySelector('.shop-preview')
const shopPreviewName = shopPreview.querySelector('.shop-preview-name')
const furnitureSettings = new WeakMap()
let furniturePreview = null

function updateSofaCustomizer() {
  const style = selectedFurnitureStyles.sofa || 'original'
  const custom = customFurnitureColors.sofa || {}
  const parts = new Map((room?.getThemeParts('sofa', style, custom) || []).map(part => [part.key, part.color]))
  sofaBodyColor.value = custom.blue || parts.get('blue') || '#B0D4D2'
  sofaCushionColor.value = custom.cushionYellow
    || custom.olive
    || parts.get('cushionYellow')
    || '#F2C84B'
  sofaCustomizer.querySelectorAll('[data-sofa-model]').forEach(button => {
    const selected = button.dataset.sofaModel === selectedSofaModel
    button.classList.toggle('is-selected', selected)
    button.setAttribute('aria-pressed', String(selected))
  })
  sofaCustomizer.querySelectorAll('[data-cushion-shape]').forEach(button => {
    const selected = button.dataset.cushionShape === selectedSofaCushionShape
    button.classList.toggle('is-selected', selected)
    button.setAttribute('aria-pressed', String(selected))
  })
}

const furnitureCustomizer = document.querySelector('#furniture-customizer')
const furnitureCustomizerColors = furnitureCustomizer.querySelector('.furniture-customizer-colors')
const furnitureCustomizerModels = furnitureCustomizer.querySelector('.furniture-customizer-models')
let customizingFurniture = null

function getActiveModel(name) {
  const models = furnitureCustomizers[name]?.models
  if (!models) return null
  return models.find(model => model.key === selectedFurnitureModels[name]) || models[0]
}

function openFurnitureCustomizer(name) {
  if (name === 'sofa') return openSofaCustomizer()
  const config = furnitureCustomizers[name]
  if (!config || !shopPanel.hidden || !sofaCustomizer.hidden) return
  if (customizingFurniture) closeFurnitureCustomizer()
  if (!room) return
  if (config.focus !== false && !room.focusFurniture(name)) return
  pauseTutorial()
  customizingFurniture = name
  furnitureCustomizer.querySelector('#furniture-customizer-title').textContent = config.title
  renderFurnitureCustomizer()
  furnitureCustomizer.hidden = false
  document.body.classList.add('is-sofa-customizing')
  furnitureCustomizer.querySelector('.furniture-customizer-close').focus()
}

function renderFurnitureCustomizer() {
  const name = customizingFurniture
  const config = furnitureCustomizers[name]
  const activeModel = getActiveModel(name)
  // Modelkeuze: elk model als icoontje in een eigen kader
  furnitureCustomizerModels.hidden = !config.models
  furnitureCustomizerModels.replaceChildren(...(config.models ? [
    Object.assign(document.createElement('legend'), { textContent: 'Model' }),
    ...config.models.map(model => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = model === activeModel ? 'is-selected' : ''
      button.setAttribute('aria-pressed', String(model === activeModel))
      button.innerHTML = `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${model.icon}</svg><span>${model.label}</span>`
      button.addEventListener('click', () => {
        if (!room?.setFurnitureModel(name, model.key)) return
        selectedFurnitureModels[name] = model.key
        try {
          localStorage.setItem(FURNITURE_MODEL_STORAGE_KEY, JSON.stringify(selectedFurnitureModels))
        } catch (error) {
          console.error('Het meubelmodel kon niet worden opgeslagen.', error)
        }
        renderFurnitureCustomizer()
      })
      return button
    }),
  ] : []))

  const style = selectedFurnitureStyles[name] || 'original'
  const custom = customFurnitureColors[name] || {}
  const colors = new Map((room?.getThemeParts(name, style, custom) || []).map(part => [part.key, part.color]))
  const parts = activeModel ? activeModel.parts : config.parts
  furnitureCustomizerColors.replaceChildren(...parts.map(([key, label]) => {
    const control = document.createElement('label')
    control.className = 'sofa-color-control'
    control.textContent = label
    const input = document.createElement('input')
    input.type = 'color'
    input.value = custom[key] || colors.get(key) || '#ffffff'
    input.addEventListener('input', () => {
      const updated = { ...(customFurnitureColors[name] || {}), [key]: input.value }
      customFurnitureColors[name] = updated
      saveCustomColors()
      room?.setTheme(name, selectedFurnitureStyles[name] || 'original', updated)
    })
    control.append(input)
    return control
  }))
}

function closeFurnitureCustomizer() {
  if (furnitureCustomizer.hidden) return
  furnitureCustomizer.hidden = true
  customizingFurniture = null
  document.body.classList.remove('is-sofa-customizing')
  room?.restoreSofaView()
  resumeTutorial()
}

furnitureCustomizer.querySelector('.furniture-customizer-close').addEventListener('click', closeFurnitureCustomizer)
furnitureCustomizer.querySelector('.furniture-customizer-reset').addEventListener('click', () => {
  const name = customizingFurniture
  if (!name) return
  delete customFurnitureColors[name]
  saveCustomColors()
  room?.setTheme(name, selectedFurnitureStyles[name] || 'original')
  renderFurnitureCustomizer()
})

function openSofaCustomizer() {
  if (!shopPanel.hidden) return
  closeFurnitureCustomizer()
  if (!room?.focusSofa()) return
  pauseTutorial()
  updateSofaCustomizer()
  sofaCustomizer.hidden = false
  document.body.classList.add('is-sofa-customizing')
  sofaCustomizerClose.focus()
}

function closeSofaCustomizer() {
  if (sofaCustomizer.hidden) return
  sofaCustomizer.hidden = true
  document.body.classList.remove('is-sofa-customizing')
  room?.restoreSofaView()
  resumeTutorial()
}


function applySofaColor(keys, color, extraColors = {}) {
  if (!room) return
  const custom = { ...(customFurnitureColors.sofa || {}), ...extraColors }
  keys.forEach(key => { custom[key] = color })
  customFurnitureColors.sofa = custom
  saveCustomColors()
  room.setTheme('sofa', selectedFurnitureStyles.sofa || 'original', custom)
}

sofaBodyColor.addEventListener('input', () => applySofaColor(
  ['blue', 'sky', 'sofaSeatCushion', 'sofaBackCushion'],
  sofaBodyColor.value,
))
// De naad rond de sierkussens krijgt een donkerdere tint van dezelfde kleur,
// zodat er niets van de oude kleur zichtbaar blijft.
sofaCushionColor.addEventListener('input', () => applySofaColor(
  ['cushionYellow', 'olive'],
  sofaCushionColor.value,
  { rugGold: darkenHex(sofaCushionColor.value), plantGreen: darkenHex(sofaCushionColor.value) },
))
sofaCustomizer.querySelectorAll('[data-sofa-model]').forEach(button => {
  button.addEventListener('click', () => {
    const model = button.dataset.sofaModel
    if (!room?.setSofaModel(model)) return
    selectedSofaModel = model
    try {
      localStorage.setItem(SOFA_MODEL_STORAGE_KEY, model)
    } catch (error) {
      console.error('Het sofamodel kon niet worden opgeslagen.', error)
    }
    updateSofaCustomizer()
  })
})
sofaCustomizer.querySelectorAll('[data-cushion-shape]').forEach(button => {
  button.addEventListener('click', () => {
    const shape = button.dataset.cushionShape
    if (!room?.setSofaCushionShape(shape)) return
    selectedSofaCushionShape = shape
    try {
      localStorage.setItem(SOFA_CUSHION_SHAPE_STORAGE_KEY, shape)
    } catch (error) {
      console.error('De kussenvorm kon niet worden opgeslagen.', error)
    }
    updateSofaCustomizer()
  })
})
sofaCustomizer.querySelector('.sofa-customizer-reset').addEventListener('click', () => {
  delete customFurnitureColors.sofa
  saveCustomColors()
  room?.setTheme('sofa', selectedFurnitureStyles.sofa || 'original')
  selectedSofaCushionShape = 'rounded'
  room?.setSofaCushionShape(selectedSofaCushionShape)
  try {
    localStorage.setItem(SOFA_CUSHION_SHAPE_STORAGE_KEY, selectedSofaCushionShape)
  } catch (error) {
    console.error('De kussenvorm kon niet worden opgeslagen.', error)
  }
  updateSofaCustomizer()
})
sofaCustomizerClose.addEventListener('click', closeSofaCustomizer)

function showFurniturePreview(name, themeGroup) {
  if (!room?.createPreview) return
  const selectedProduct = [...shopProducts.querySelectorAll('.shop-product')].find(card => card.dataset.name === name)
  const settings = furnitureSettings.get(selectedProduct)
  if (!settings) return
  shopControls.replaceChildren(...settings)
  shopControls.hidden = false
  furniturePreview ??= room.createPreview(shopPreview.querySelector('.shop-preview-stage'))
  shopPreview.hidden = false
  shopPreviewName.textContent = name
  furniturePreview.start()
  furniturePreview.show(themeGroup, selectedFurnitureStyles[themeGroup] || 'original', customFurnitureColors[themeGroup] || {})
  shopProducts.querySelectorAll('.shop-product').forEach(card => card.classList.toggle('is-active', card.dataset.name === name))
}
function hideFurniturePreview() {
  shopPreview.hidden = true
  shopControls.hidden = true
  furniturePreview?.stop()
}
const timerToggle = document.querySelector('.timer-toggle')
const timerPanel = document.querySelector('#timer-panel')
const timerInput = document.querySelector('#timer-minutes')
const timerDisplay = document.querySelector('#timer-display')
const timerBadge = document.querySelector('#timer-badge')
const timerStart = document.querySelector('#timer-start')
const timerReset = document.querySelector('#timer-reset')
const timerClose = document.querySelector('.timer-close')
const timerAlert = document.querySelector('#timer-alert')
const coinBalanceDisplay = document.querySelector('#coin-balance')
const statsEmpty = document.querySelector('.stats-empty')
const statsDemoBadge = document.querySelector('.stats-demo-badge')
const statsWeekPrevious = document.querySelector('.stats-week-previous')
const statsWeekNext = document.querySelector('.stats-week-next')
const statsWeekLabel = document.querySelector('.stats-week-label')
const statsWeekTotal = document.querySelector('.stats-week-total-value')
const statsChart = document.querySelector('.stats-chart')
let remainingSeconds = 25 * 60
let timerInterval = null
let timerEndAt = null
let timerHasDisplay = false
const TIMER_USAGE_STORAGE_KEY = 'pixel-home-timer-daily-usage'
const COIN_STORAGE_KEY = 'pixel-home-study-coins'
let timerUsage = {}
let trackingStartedAt = null
let lastUsageSavedAt = 0
let coinBalance = 0
let coinProgressMilliseconds = 0

try {
  const savedCoins = JSON.parse(localStorage.getItem(COIN_STORAGE_KEY) || '{}')
  if (Number.isSafeInteger(savedCoins.balance) && savedCoins.balance >= 0) coinBalance = savedCoins.balance
  if (Number.isSafeInteger(savedCoins.progressMilliseconds)
    && savedCoins.progressMilliseconds >= 0 && savedCoins.progressMilliseconds < 60000) {
    coinProgressMilliseconds = savedCoins.progressMilliseconds
  }
} catch (error) {
  console.warn('Studymunten konden niet worden geladen.', error)
}

function saveCoins() {
  try {
    localStorage.setItem(COIN_STORAGE_KEY, JSON.stringify({
      balance: coinBalance,
      progressMilliseconds: coinProgressMilliseconds,
    }))
  } catch (error) {
    console.error('Studymunten konden niet worden opgeslagen.', error)
  }
}

function renderCoinBalance() {
  coinBalanceDisplay.textContent = String(coinBalance)
}

renderCoinBalance()

function getLocalDateKey(timestamp) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getLocalWeekStart(timestamp) {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - (date.getDay() + 6) % 7)
  return date
}

let currentWeekStart = getLocalWeekStart(Date.now())
let statsWeekStart = new Date(currentWeekStart)

try {
  const savedUsage = JSON.parse(localStorage.getItem(TIMER_USAGE_STORAGE_KEY) || '{}')
  timerUsage = Object.fromEntries(Object.entries(savedUsage).filter(([date, seconds]) =>
    /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(seconds) && seconds > 0,
  ))
} catch {
  timerUsage = {}
}
let isDemoTimerUsage = Object.keys(timerUsage).length === 0

function createDemoTimerUsage() {
  const today = new Date()
  const weekday = (today.getDay() + 6) % 7
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - weekday)
  const minutesPerDay = [80, 45, 65, 55, 30]
  return Object.fromEntries(minutesPerDay.map((minutes, index) => [
    getLocalDateKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index).getTime()),
    minutes * 60,
  ]))
}

if (isDemoTimerUsage) timerUsage = createDemoTimerUsage()

function saveTimerUsage() {
  try {
    localStorage.setItem(TIMER_USAGE_STORAGE_KEY, JSON.stringify(timerUsage))
  } catch {
    // Keep the in-memory totals usable if browser storage is unavailable.
  }
}

function recordTimerUsage(now = Date.now(), forceSave = false) {
  if (trackingStartedAt === null) return
  let cursor = trackingStartedAt
  const elapsedMilliseconds = now - cursor
  let earnedCoins = 0
  if (elapsedMilliseconds > 0) {
    const totalMilliseconds = coinProgressMilliseconds + elapsedMilliseconds
    earnedCoins = Math.floor(totalMilliseconds / 60000)
    coinProgressMilliseconds = totalMilliseconds % 60000
    if (earnedCoins > 0) {
      coinBalance += earnedCoins
      renderCoinBalance()
    }
  }
  while (cursor < now) {
    const date = new Date(cursor)
    const nextMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime()
    const segmentEnd = Math.min(now, nextMidnight)
    const dateKey = getLocalDateKey(cursor)
    timerUsage[dateKey] = (timerUsage[dateKey] || 0) + (segmentEnd - cursor) / 1000
    cursor = segmentEnd
  }
  trackingStartedAt = now
  if (forceSave || earnedCoins > 0) saveCoins()
  if (forceSave || now - lastUsageSavedAt >= 1000) {
    saveTimerUsage()
    lastUsageSavedAt = now
  }
}

function formatUsageDuration(seconds) {
  if (seconds === 0) return '0 min'
  if (seconds < 60) return `${Math.round(seconds)} sec`
  const totalMinutes = Math.floor(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours ? `${hours} u ${minutes} min` : `${minutes} min`
}

function renderTimerStats() {
  if (timerInterval) recordTimerUsage(Date.now(), true)
  currentWeekStart = getLocalWeekStart(Date.now())
  if (statsWeekStart > currentWeekStart) statsWeekStart = new Date(currentWeekStart)
  const weekDates = Array.from({ length: 7 }, (_, index) =>
    new Date(statsWeekStart.getFullYear(), statsWeekStart.getMonth(), statsWeekStart.getDate() + index),
  )
  const weekSeconds = weekDates.map(date => timerUsage[getLocalDateKey(date.getTime())] || 0)
  const maxSeconds = Math.max(1, ...weekSeconds)
  const totalSeconds = weekSeconds.reduce((total, seconds) => total + seconds, 0)
  const firstDay = weekDates[0].toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })
  const lastDay = weekDates[6].toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })

  statsWeekLabel.textContent = `${firstDay} t/m ${lastDay}`
  statsWeekPrevious.disabled = false
  statsWeekNext.disabled = statsWeekStart >= currentWeekStart
  statsWeekTotal.textContent = formatUsageDuration(totalSeconds)
  statsDemoBadge.hidden = !isDemoTimerUsage || totalSeconds === 0
  statsEmpty.hidden = totalSeconds > 0
  statsChart.setAttribute('aria-label', `Timertijd per dag van ${firstDay} tot en met ${lastDay}`)
  statsChart.replaceChildren(...weekDates.map((date, index) => {
    const seconds = weekSeconds[index]
    const column = document.createElement('div')
    column.className = 'stats-day'
    column.setAttribute('role', 'listitem')
    column.setAttribute('aria-label', `${date.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}: ${formatUsageDuration(seconds)}`)

    const duration = document.createElement('output')
    duration.className = 'stats-day-duration'
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    duration.textContent = seconds === 0 ? '–' : hours ? `${hours}u${String(minutes % 60).padStart(2, '0')}` : `${minutes}m`

    const track = document.createElement('span')
    track.className = 'stats-day-track'
    track.setAttribute('aria-hidden', 'true')
    const fill = document.createElement('span')
    fill.className = 'stats-day-fill'
    fill.style.height = seconds ? `${Math.max(2, seconds / maxSeconds * 100)}%` : '0%'
    track.append(fill)

    const label = document.createElement('span')
    label.className = 'stats-day-label'
    label.textContent = `${date.toLocaleDateString('nl-BE', { weekday: 'short' })} ${date.getDate()}`
    column.append(duration, track, label)
    return column
  }))
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainder = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

function syncTimerDisplay() {
  const formattedTime = formatTimer(remainingSeconds)
  timerDisplay.textContent = formattedTime
  timerBadge.textContent = formattedTime
  timerBadge.hidden = !timerHasDisplay
  timerToggle.setAttribute('aria-label', timerInterval ? `Timer loopt: ${formattedTime}` : timerHasDisplay ? `Timer gepauzeerd: ${formattedTime}` : 'Timer instellen')
  timerStart.textContent = timerInterval ? 'Pauze' : 'Start'
  timerStart.disabled = !timerInterval && remainingSeconds === 0
  timerInput.disabled = Boolean(timerInterval)
  if (!timerAlert.hidden) {
    timerAlert.querySelector('span').textContent = timerInterval
      ? `Timer: ${formattedTime}`
      : remainingSeconds === 0 ? 'Timer afgelopen' : `Timer gepauzeerd: ${formattedTime}`
    timerAlert.setAttribute('aria-live', timerInterval ? 'off' : remainingSeconds === 0 ? 'assertive' : 'polite')
  }
}

function resetShopCategories() {
  shopCatalogView.hidden = true
  hideFurniturePreview()
  shopCategories.classList.remove('has-selection')
  shopPanel.querySelectorAll('.shop-category').forEach(category => {
    category.setAttribute('aria-pressed', 'false')
    category.classList.remove('is-selected')
  })
  shopSelection.textContent = 'Kies een categorie'
}

function setRoomPreview(isOn) {
  document.body.classList.toggle('is-room-preview', isOn)
  if (isOn) roomPreviewBack.focus()
  else shopPanel.querySelector('.furniture-preview-button')?.focus()
}

function setShopOpen(isOpen) {
  if (isOpen) {
    closeSofaCustomizer()
    closeFurnitureCustomizer()
  }
  if (!isOpen) document.body.classList.remove('is-room-preview')
  const wasOpen = !shopPanel.hidden
  shopPanel.hidden = !isOpen
  document.body.classList.toggle('is-shop-open', isOpen)
  if (isOpen) pauseTutorial()
  else if (wasOpen) resumeTutorial()
  if (!isOpen) document.body.classList.remove('is-shop-page')
  if (!isOpen) hideFurniturePreview()
  if (isOpen) {
    resetShopCategories()
    document.body.classList.add('is-shop-page')
    timerPanel.hidden = true
    timerToggle.setAttribute('aria-expanded', 'false')
    shopPanel.querySelector('[data-shop-category="furniture"]').click()
    shopPanel.querySelector('[data-shop-category="furniture"]').focus()
  }
}

function moveStatsWeek(amount) {
  statsWeekStart = new Date(
    statsWeekStart.getFullYear(),
    statsWeekStart.getMonth(),
    statsWeekStart.getDate() + amount * 7,
  )
  renderTimerStats()
}

shopClose.addEventListener('click', () => setShopOpen(false))
roomPreviewBack.addEventListener('click', () => setRoomPreview(false))
statsWeekPrevious.addEventListener('click', () => moveStatsWeek(-1))
statsWeekNext.addEventListener('click', () => moveStatsWeek(1))
timerToggle.addEventListener('click', () => {
  const isOpen = timerPanel.hidden
  if (isOpen) {
    setShopOpen(false)
    statsWeekStart = new Date(currentWeekStart)
    renderTimerStats()
    timerPanel.hidden = false
  }
  if (!isOpen) timerPanel.hidden = true
  timerToggle.setAttribute('aria-expanded', String(isOpen))
  if (isOpen) timerInput.focus()
})
timerClose.addEventListener('click', () => {
  timerPanel.hidden = true
  timerToggle.setAttribute('aria-expanded', 'false')
  timerToggle.focus()
})
timerInput.addEventListener('input', () => {
  if (timerInterval) return
  const minutes = Math.min(180, Math.max(1, Number(timerInput.value) || 1))
  timerInput.value = String(minutes)
  remainingSeconds = minutes * 60
  timerHasDisplay = true
  saveTimerState()
  syncTimerDisplay()
})
const TIMER_STATE_STORAGE_KEY = 'pixel-home-timer-state'
function saveTimerState() {
  try {
    localStorage.setItem(TIMER_STATE_STORAGE_KEY, JSON.stringify({
      minutes: Number(timerInput.value) || 25,
      remainingSeconds,
      endAt: timerEndAt,
      trackingStartedAt,
      hasDisplay: timerHasDisplay,
    }))
  } catch {
    // Timer keeps running in memory if storage is unavailable.
  }
}

function tickTimer() {
  const currentTime = Date.now()
  remainingSeconds = Math.max(0, Math.ceil((timerEndAt - currentTime) / 1000))
  recordTimerUsage(Math.min(currentTime, timerEndAt), remainingSeconds === 0)
  if (remainingSeconds === 0) {
    clearInterval(timerInterval)
    timerInterval = null
    timerEndAt = null
    trackingStartedAt = null
    timerAlert.hidden = false
  }
  saveTimerState()
  syncTimerDisplay()
  if (!timerPanel.hidden) renderTimerStats()
}

timerStart.addEventListener('click', () => {
  if (timerInterval) {
    recordTimerUsage(Date.now(), true)
    trackingStartedAt = null
    remainingSeconds = Math.max(0, Math.ceil((timerEndAt - Date.now()) / 1000))
    clearInterval(timerInterval)
    timerInterval = null
    timerEndAt = null
  } else if (remainingSeconds > 0) {
    if (isDemoTimerUsage) {
      timerUsage = {}
      isDemoTimerUsage = false
    }
    timerHasDisplay = true
    timerAlert.hidden = false
    const startedAt = Date.now()
    trackingStartedAt = startedAt
    lastUsageSavedAt = startedAt
    timerEndAt = startedAt + remainingSeconds * 1000
    timerInterval = setInterval(tickTimer, 250)
  }
  saveTimerState()
  syncTimerDisplay()
})
timerReset.addEventListener('click', () => {
  if (timerInterval) recordTimerUsage(Date.now(), true)
  trackingStartedAt = null
  clearInterval(timerInterval)
  timerInterval = null
  timerEndAt = null
  timerAlert.hidden = true
  remainingSeconds = Number(timerInput.value) * 60
  timerHasDisplay = true
  saveTimerState()
  syncTimerDisplay()
})
shopPanel.querySelectorAll('.shop-category').forEach(button => {
  button.addEventListener('click', () => {
    shopPanel.querySelectorAll('.shop-category').forEach(category => {
      category.setAttribute('aria-pressed', String(category === button))
      category.classList.toggle('is-selected', category === button)
    })
    const categoryName = button.dataset.shopCategory
    const categoryLabel = button.querySelector('span').textContent
    shopSelection.textContent = ''
    shopCategories.classList.add('has-selection')
    shopCatalogView.hidden = false
    hideFurniturePreview()
    shopCatalogView.querySelector('.shop-category-title').textContent = categoryLabel
    shopProducts.replaceChildren(...shopItems[categoryName].map(([name, price, color, themeGroup]) => {
      const item = document.createElement('article')
      item.className = 'shop-product'
      item.dataset.name = name
      const furnitureOptions = themeGroup
        ? `<div class="furniture-options" role="group" aria-label="Kies een stijl voor ${name}">${furnitureStyles.map(([style, label]) => `
            <button class="furniture-style-option${(selectedFurnitureStyles[themeGroup] || 'original') === style ? ' is-selected' : ''}" type="button" data-style="${style}" aria-pressed="${(selectedFurnitureStyles[themeGroup] || 'original') === style}">
              <span class="theme-swatch theme-swatch--${style}" aria-hidden="true"><i></i><i></i><i></i></span>
              <span>${label}</span>
            </button>`).join('')}
          </div>
          <button class="furniture-preview-button" type="button">Bekijk in kamer</button>`
        : `<button class="add-to-cart" type="button" aria-label="Voeg ${name} toe aan winkelwagen" title="Toevoegen">+</button>`
      const icon = themeGroup ? furnitureIcons[name] : foodIcons[name]
      const art = icon
        ? `<span class="shop-product-art shop-product-art--icon" aria-hidden="true"><svg viewBox="0 0 16 16" shape-rendering="crispEdges">${icon}</svg></span>`
        : `<span class="shop-product-art" style="--product-color:${color}" aria-hidden="true"></span>`
      item.innerHTML = `${art}<span class="shop-product-name">${name}</span><span class="shop-product-price">${price}</span>${furnitureOptions}`
      if (themeGroup) {
        furnitureSettings.set(item, [
          item.querySelector('.furniture-options'),
          item.querySelector('.furniture-preview-button'),
        ])
        item.addEventListener('click', () => showFurniturePreview(name, themeGroup))
        item.querySelector('.furniture-preview-button').addEventListener('click', event => {
          event.stopPropagation()
          setRoomPreview(true)
        })
        const styleOptions = [...item.querySelectorAll('.furniture-style-option')]
        styleOptions.forEach(option => {
          option.addEventListener('click', () => {
            const style = option.dataset.style
            if (!room) {
              shopSelection.textContent = 'Meubelstijl kon niet worden toegepast'
              return
            }
            delete customFurnitureColors[themeGroup]
            saveCustomColors()
            room.setTheme(themeGroup, style)
            selectedFurnitureStyles[themeGroup] = style
            try {
              localStorage.setItem(FURNITURE_STYLE_STORAGE_KEY, JSON.stringify(selectedFurnitureStyles))
            } catch (error) {
              console.error('Meubelstijl kon niet worden opgeslagen.', error)
            }
            const label = furnitureStyles.find(([key]) => key === style)?.[1]
            shopSelection.textContent = `${name} veranderd naar ${label}`
            furniturePreview?.show(themeGroup, style, customFurnitureColors[themeGroup] || {})
            styleOptions.forEach(styleOption => {
              const isSelected = styleOption === option
              styleOption.classList.toggle('is-selected', isSelected)
              styleOption.setAttribute('aria-pressed', String(isSelected))
            })
          })
        })
        return item
      }
      item.querySelector('.add-to-cart').addEventListener('click', event => {
        let productId
        if (categoryName === 'food') {
          productId = `food-${nextFoodId++}`
          if (!room?.storeFoodItem({ id: productId, name, color })) {
            nextFoodId -= 1
            shopSelection.textContent = 'Koelkast is vol'
            return
          }
          foodItems = room.getFoodItems()
          if (!feedMenu.hidden) renderFeedMenu()
        }
        event.currentTarget.classList.add('is-added')
        event.currentTarget.textContent = '✓'
        shopSelection.textContent = categoryName === 'food' ? `${name} in de koelkast` : `${name} toegevoegd`
      })
      return item
    }))
    document.body.classList.add('is-shop-page')
    if (categoryName === 'furniture') {
      const first = shopItems.furniture[0]
      showFurniturePreview(first[0], first[3])
    }
  })
})
shopPanel.querySelector('.shop-back').addEventListener('click', () => {
  shopCatalogView.hidden = true
  hideFurniturePreview()
  shopCategories.classList.remove('has-selection')
  shopSelection.textContent = 'Kies een categorie'
})
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !furnitureCustomizer.hidden) closeFurnitureCustomizer()
  if (event.key === 'Escape' && !sofaCustomizer.hidden) closeSofaCustomizer()
  else if (event.key === 'Escape' && document.body.classList.contains('is-room-preview')) setRoomPreview(false)
  else if (event.key === 'Escape' && !shopPanel.hidden) setShopOpen(false)
  if (event.key === 'Escape' && !timerPanel.hidden) {
    timerPanel.hidden = true
    timerToggle.setAttribute('aria-expanded', 'false')
    timerToggle.focus()
  }
  if (event.key === 'Escape' && !timerAlert.hidden) timerAlert.hidden = true
  if (event.key === 'Escape' && !feedMenu.hidden) feedMenu.hidden = true
})

function flushTimerData() {
  const now = timerEndAt === null ? Date.now() : Math.min(Date.now(), timerEndAt)
  recordTimerUsage(now, true)
  saveTimerState()
}
window.addEventListener('pagehide', flushTimerData)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushTimerData()
  else if (timerInterval) tickTimer()
})

try {
  const saved = JSON.parse(localStorage.getItem(TIMER_STATE_STORAGE_KEY) || 'null')
  if (saved && Number.isFinite(saved.remainingSeconds)) {
    timerInput.value = String(Math.min(180, Math.max(1, Number(saved.minutes) || 25)))
    remainingSeconds = Math.max(0, saved.remainingSeconds)
    timerHasDisplay = Boolean(saved.hasDisplay)
    if (Number.isFinite(saved.endAt) && Number.isFinite(saved.trackingStartedAt)) {
      if (isDemoTimerUsage) {
        timerUsage = {}
        isDemoTimerUsage = false
      }
      trackingStartedAt = saved.trackingStartedAt
      timerEndAt = saved.endAt
      lastUsageSavedAt = 0
      timerHasDisplay = true
      timerAlert.hidden = false
      timerInterval = setInterval(tickTimer, 250)
      tickTimer()
    }
  }
} catch (error) {
  console.warn('Timerstatus kon niet worden geladen.', error)
}
syncTimerDisplay()

feedMenu.querySelector('.feed-menu-close').addEventListener('click', () => { feedMenu.hidden = true })
feedProducts.addEventListener('click', event => {
  const button = event.target.closest('.feed-product')
  if (!button) return
  const eatenFood = room?.feedCharacter(button.dataset.foodId)
  if (!eatenFood) return
  foodItems = room.getFoodItems()
  renderFeedMenu()
  shopSelection.textContent = `${eatenFood.name} gegeven aan het mannetje`
})

if (import.meta.hot) import.meta.hot.dispose(() => room?.dispose())
// Alleen in ontwikkeling (npm run dev): toegang voor de Playwright-tests, niet in de gebouwde site
if (import.meta.env.DEV) window.__pixelHome = { room, openFurniture: openFurnitureCustomizer }

// ---------- Intro & tutorial ----------
const intro = document.querySelector('.intro')
const introStepCount = intro.querySelector('.intro-step-count')
const introTitle = intro.querySelector('#intro-title')
const introText = intro.querySelector('.intro-text')
const introAction = intro.querySelector('.intro-action')
const introPrevious = intro.querySelector('.intro-previous')
const introNext = intro.querySelector('.intro-next')
const tutorialToggle = document.querySelector('.tutorial-toggle')
const tutorialSteps = [
  {
    title: 'Welkom!',
    text: 'Dit is jouw huisje en je mag het helemaal zelf inrichten zoals jij wilt. Ik laat je even zien hoe dat werkt.',
  },
  {
    title: 'Rondkijken',
    text: 'Sleep met je muis over het huis om het rond te draaien. Scroll om in en uit te zoomen. Verdwaald? Met het huisje-knopje linksboven zie je weer het hele huis.',
    highlight: ['.view-reset'],
  },
  {
    title: 'Kleuren aanpassen',
    text: 'Klik op de sofa, het bureau of de keuken. Je kiest telkens uit drie totaal verschillende modellen en past de kleuren aan. Je ziet elke aanpassing meteen.',
    furniture: ['sofa', 'desk', 'kitchen'],
    action: ['Probeer het nu', () => openSofaCustomizer()],
  },
  {
    title: 'Stijl kiezen',
    text: 'Elk meubel heeft drie stijlen: Klassiek, Roze en Kleurrijk. Kies een stijl in de winkel en klik op "Bekijk in kamer" om het resultaat in je huis te zien.',
    action: ['Bekijk de stijlen', () => setShopOpen(true)],
  },
  {
    title: 'Verdiepingen',
    text: 'Met de pijltjes ga je naar boven of naar beneden. Met het oogje toon of verberg je de doorzichtige verdieping.',
    highlight: ['.floor-arrow', '.floor-visibility-toggle'],
  },
  {
    title: 'Dag en nacht',
    text: 'Klik op de zon of de maan om te kiezen of het dag of nacht is in je huis.',
    highlight: ['.night-toggle'],
  },
  {
    title: 'Veel plezier!',
    text: 'Dat was het! Met het vraagteken linksboven bekijk je deze uitleg opnieuw.',
    highlight: ['.tutorial-toggle'],
  },
]
let tutorialStep = 0
let tutorialPausedAt = null

function clearTutorialHighlights() {
  document.querySelectorAll('.is-tutorial-highlight').forEach(element => element.classList.remove('is-tutorial-highlight'))
  room?.highlightFurniture(null)
}

function showTutorialStep(index) {
  tutorialStep = clamp(index, 0, tutorialSteps.length - 1)
  const step = tutorialSteps[tutorialStep]
  clearTutorialHighlights()
  introStepCount.textContent = `${tutorialStep + 1} / ${tutorialSteps.length}`
  introTitle.textContent = step.title
  introText.textContent = step.text
  introAction.hidden = !step.action
  if (step.action) introAction.textContent = step.action[0]
  introPrevious.disabled = tutorialStep === 0
  introNext.textContent = tutorialStep === tutorialSteps.length - 1 ? 'Starten' : 'Volgende'
  step.highlight?.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => element.classList.add('is-tutorial-highlight'))
  })
  if (step.furniture) room?.highlightFurniture(step.furniture)
}

// Hoe het huis tijdens de uitleg verschuift (fractie van het scherm) en verkleint, per schermformaat
function introViewShift() {
  if (window.matchMedia('(max-width: 700px)').matches) return { x: 0, y: -0.07, scale: 0.9 }
  if (window.matchMedia('(max-height: 500px)').matches) return { x: 0.2, y: 0, scale: 0.74 }
  return { x: 0, y: 0, scale: 0.8 }
}
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
window.addEventListener('resize', () => {
  if (!intro.hidden) room?.setViewShift(introViewShift(), true)
})

function showIntro(step) {
  intro.hidden = false
  document.body.classList.add('is-intro')
  room?.setViewShift(introViewShift(), reduceMotion)
  showTutorialStep(step)
  introNext.focus()
}

function hideIntro() {
  clearTutorialHighlights()
  intro.hidden = true
  document.body.classList.remove('is-intro')
  room?.setViewShift({}, reduceMotion)
}

function openTutorial() {
  tutorialPausedAt = null
  setShopOpen(false)
  closeSofaCustomizer()
  closeFurnitureCustomizer()
  timerPanel.hidden = true
  feedMenu.hidden = true
  showIntro(0)
}

// Tijdens de tutorial iets uitproberen (sofa, winkel): tutorial even weg,
// en na het sluiten gaat hij verder bij de volgende stap.
function pauseTutorial() {
  if (intro.hidden) return
  const step = tutorialSteps[tutorialStep]
  tutorialPausedAt = step.action || step.furniture ? tutorialStep + 1 : tutorialStep
  hideIntro()
}

function resumeTutorial() {
  if (tutorialPausedAt === null) return
  const step = tutorialPausedAt
  tutorialPausedAt = null
  // Wacht tot de camera terug is voor het huis opzij schuift
  window.setTimeout(() => {
    if (sofaCustomizer.hidden && furnitureCustomizer.hidden && shopPanel.hidden && intro.hidden) showIntro(step)
  }, 500)
}

function closeTutorial() {
  tutorialPausedAt = null
  if (intro.hidden) return
  hideIntro()
}

introNext.addEventListener('click', () => {
  if (tutorialStep === tutorialSteps.length - 1) closeTutorial()
  else showTutorialStep(tutorialStep + 1)
})
introPrevious.addEventListener('click', () => showTutorialStep(tutorialStep - 1))
intro.querySelector('.intro-skip').addEventListener('click', closeTutorial)
introAction.addEventListener('click', () => {
  const action = tutorialSteps[tutorialStep].action?.[1]
  pauseTutorial()
  // Wacht tot het huis terug op zijn plek staat voor we het paneel openen
  window.setTimeout(() => {
    action?.()
    // Lukte het openen niet (bv. op de bovenverdieping)? Ga dan gewoon verder.
    if (sofaCustomizer.hidden && furnitureCustomizer.hidden && shopPanel.hidden) resumeTutorial()
  }, 450)
})
tutorialToggle.addEventListener('click', openTutorial)
// Terug naar het hele huis: panelen sluiten en de camera terugzetten (handig als je te ver ingezoomd bent)
document.querySelector('.view-reset').addEventListener('click', () => {
  closeSofaCustomizer()
  closeFurnitureCustomizer()
  room?.resetView()
})
document.addEventListener('keydown', event => {
  if (intro.hidden) return
  if (event.key === 'Escape') closeTutorial()
  else if (event.key === 'ArrowRight') introNext.click()
  else if (event.key === 'ArrowLeft' && !introPrevious.disabled) introPrevious.click()
})

// De tutorial start bij elke keer laden (ook na een refresh)
openTutorial()
