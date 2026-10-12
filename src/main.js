import './room-view.css'
import { createLivingRoom } from './living-room.js'

const shopItems = {
  food: [
    ['Appel', '€ 0,50', '#D97A50'],
    ['Brood', '€ 2,20', '#C7955D'],
    ['Melk', '€ 1,35', '#D8E5E0'],
    ['Kaas', '€ 3,40', '#E4BE52'],
    ['Tomaat', '€ 0,60', '#C85E4E'],
    ['Koekjes', '€ 2,10', '#A87958'],
  ],
  furniture: [
    ['Poef', '€ 49,00', '#778856'],
    ['Lamp', '€ 32,50', '#F0781C'],
    ['Stoel', '€ 65,00', '#946851'],
    ['Plant', '€ 12,00', '#54794D'],
    ['Sofa', '€ 399,00', '#B0D4D2'],
    ['Salontafel', '€ 89,00', '#502E1C'],
  ],
}

document.querySelector('#app').innerHTML = `
  <div id="room-scene" role="img" aria-label="Kamer 1: The Living Room"></div>
  <div class="coin-display" role="group" aria-label="Munten verdiend met studeren" title="Een munt per studieminuut">
    <svg viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true">
      <path class="coin-edge" d="M11 1h10v2h4v3h3v4h2v12h-2v4h-3v3h-4v2H11v-2H7v-3H4v-4H2V10h2V6h3V3h4z"/>
      <path class="coin-face" d="M12 4h8v2h4v3h2v4h1v6h-1v4h-2v3h-4v2h-8v-2H8v-3H6v-4H5v-6h1V9h2V6h4z"/>
      <path class="coin-shine" d="M12 6h7v2h-5v2h-2v5h-2V9h2z"/>
      <text class="coin-symbol" x="17" y="22" text-anchor="middle">€</text>
    </svg>
    <output class="coin-balance" id="coin-balance" aria-label="Munten">0</output>
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
    </div>
    <p class="shop-selection" aria-live="polite">Kies een categorie</p>
  </section>
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
  </section>
  <section class="stats-panel" id="stats-panel" role="dialog" aria-labelledby="stats-title" hidden>
    <header class="stats-heading">
      <div class="stats-title-group">
        <h2 id="stats-title">Timertijd per dag</h2>
        <span class="stats-demo-badge" hidden>Voorbeelddata</span>
      </div>
      <button class="stats-close" type="button" aria-label="Statistieken sluiten" title="Sluiten">×</button>
    </header>
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
  <div class="timer-alert" id="timer-alert" role="status" aria-live="assertive" hidden>
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5M9 2h6"/></svg>
    <span>Timer afgelopen</span>
  </div>
  <div class="hunger-status" role="group" aria-label="Hongerstatus en bediening">
    <svg viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><defs><clipPath id="heart-clip-1"><path d="M12 24h-2v-2H8v-2H4v-2H2v-4H0v-4h2V6h2V4h6v2h4V4h6v2h2v4h2v4h-2v4h-2v2h-4v2h-2v2z"/></clipPath></defs><path class="heart-empty" d="M12 24h-2v-2H8v-2H4v-2H2v-4H0v-4h2V6h2V4h6v2h4V4h6v2h2v4h2v4h-2v4h-2v2h-4v2h-2v2z"/><rect class="heart-fill" data-heart-fill="0" x="0" y="0" width="24" height="24" clip-path="url(#heart-clip-1)"/><path class="heart-outline" d="M12 24h-2v-2H8v-2H4v-2H2v-4H0v-4h2V6h2V4h6v2h4V4h6v2h2v4h2v4h-2v4h-2v2h-4v2h-2v2z"/></svg>
    <svg viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><defs><clipPath id="heart-clip-2"><path d="M12 24h-2v-2H8v-2H4v-2H2v-4H0v-4h2V6h2V4h6v2h4V4h6v2h2v4h2v4h-2v4h-2v2h-4v2h-2v2z"/></clipPath></defs><path class="heart-empty" d="M12 24h-2v-2H8v-2H4v-2H2v-4H0v-4h2V6h2V4h6v2h4V4h6v2h2v4h2v4h-2v4h-2v2h-4v2h-2v2z"/><rect class="heart-fill" data-heart-fill="1" x="0" y="0" width="24" height="24" clip-path="url(#heart-clip-2)"/><path class="heart-outline" d="M12 24h-2v-2H8v-2H4v-2H2v-4H0v-4h2V6h2V4h6v2h4V4h6v2h2v4h2v4h-2v4h-2v2h-4v2h-2v2z"/></svg>
    <svg viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><defs><clipPath id="heart-clip-3"><path d="M12 24h-2v-2H8v-2H4v-2H2v-4H0v-4h2V6h2V4h6v2h4V4h6v2h2v4h2v4h-2v4h-2v2h-4v2h-2v2z"/></clipPath></defs><path class="heart-empty" d="M12 24h-2v-2H8v-2H4v-2H2v-4H0v-4h2V6h2V4h6v2h4V4h6v2h2v4h2v4h-2v4h-2v2h-4v2h-2v2z"/><rect class="heart-fill" data-heart-fill="2" x="0" y="0" width="24" height="24" clip-path="url(#heart-clip-3)"/><path class="heart-outline" d="M12 24h-2v-2H8v-2H4v-2H2v-4H0v-4h2V6h2V4h6v2h4V4h6v2h2v4h2v4h-2v4h-2v2h-4v2h-2v2z"/></svg>
    <button class="timer-toggle" type="button" aria-label="Timer instellen" aria-expanded="false" aria-controls="timer-panel" title="Timer">
      <svg viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><path class="timer-pixel-clock" d="M8 0h8v2h-2v2h4v2h2v2h2v10h-2v2h-2v2H6v-2H4v-2H2V8h2V6h2V4h4V2H8zm2 8v6h2v2h2v-2h-2V8z"/></svg>
      <output class="timer-badge" id="timer-badge" hidden>25:00</output>
    </button>
    <button class="stats-toggle" type="button" aria-label="Dagelijkse timertijd openen" aria-expanded="false" aria-controls="stats-panel" title="Statistieken">
      <svg viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true">
        <path class="stats-pixel-bars" d="M5 17h6v8H5zm9-8h6v16h-6zm9 3h6v13h-6z"/>
        <path class="stats-pixel-bar-light" d="M6 18h2v6H6zm9-7h2v14h-2zm9 2h2v11h-2z"/>
      </svg>
    </button>
    <button class="shop-toggle" type="button" aria-label="Winkel openen" aria-expanded="false" aria-controls="shop-panel" title="Winkel">
      <svg viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true">
        <path class="shop-pixel-cart-frame" d="M2 3h6v4h4v4h19v4h-2v4h-2v4h-2v4H12v-4h12v-2H13v-4h11v-2H12v-4H9V9H6V7H2z"/>
        <path class="shop-pixel-cart-basket" d="M14 13h13v1h-1v2h-1v2h-1v2h-9v-2h10v-2h-9v-2h10v-1H14z"/>
        <path class="shop-pixel-cart-wheel" d="M14 25h4v4h-4zm10 0h4v4h-4z"/>
      </svg>
      <span class="shop-count" hidden>0</span>
    </button>
    <button class="night-toggle" type="button" aria-label="Schakel nachtmodus in" aria-pressed="false" title="Schakel nachtmodus in">
      <svg class="moon-icon" viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true">
        <path d="M16 1h-5v1H9v2H7v2H5v3H4v5h1v3h2v2h2v2h4v1h5v-2h-1v-1h-2v-1h-2v-2h-2v-2h-1v-2h-1v-4h2V7h2V5h2V4h3V2h-1z"/>
      </svg>
      <svg class="sun-icon" viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><path d="M9 1h6v3H9zM9 20h6v3H9zM1 9h3v6H1zm19 0h3v6h-3zM4 4h3v3H4zm13 13h3v3h-3zM17 4h3v3h-3zM4 17h3v3H4zM8 8h8v8H8z"/></svg>
    </button>
  </div>
  <aside class="feed-menu" id="feed-menu" role="dialog" aria-labelledby="feed-title" hidden>
    <header class="feed-menu-heading">
      <h2 id="feed-title">Geef eten</h2>
      <button class="feed-menu-close" type="button" aria-label="Voermenu sluiten" title="Sluiten">×</button>
    </header>
    <p class="feed-empty">De koelkast is leeg.</p>
    <div class="feed-products" role="list"></div>
  </aside>`

const feedMenu = document.querySelector('#feed-menu')
const feedProducts = document.querySelector('.feed-products')
const feedEmpty = document.querySelector('.feed-empty')
const characterHotspot = document.querySelector('.character-hotspot')
const hungerStatus = document.querySelector('.hunger-status')
const heartFills = [...hungerStatus.querySelectorAll('[data-heart-fill]')]
const statsToggle = document.querySelector('.stats-toggle')
let foodItems = []
let nextFoodId = 1
let displayedFood = null

function updateHungerStatus({ food }) {
  if (food === displayedFood) return
  displayedFood = food
  const filledHearts = Math.max(0, ((food - 10) / 90) * heartFills.length)

  heartFills.forEach((heart, index) => {
    const fill = Math.min(1, Math.max(0, filledHearts - index))
    const fillHeight = fill * 24
    heart.setAttribute('y', String(24 - fillHeight))
    heart.setAttribute('height', String(fillHeight))
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
    button.innerHTML = `<span class="feed-product-icon" style="--product-color:${item.color}" aria-hidden="true"></span><span class="feed-product-name">${item.name}</span><span class="feed-product-action">Geef</span>`
    return button
  }))
}

function openFeedMenu({ clientX, clientY, foods }) {
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
  room = createLivingRoom(document.querySelector('#room-scene'), updateHungerStatus, openFeedMenu, updateCharacterHotspot)
} catch (error) {
  console.error(error)
  document.querySelector('#room-scene').innerHTML = '<p class="room-error">This room needs WebGL. Try a browser with hardware acceleration enabled.</p>'
}

characterHotspot.addEventListener('click', () => {
  const bounds = characterHotspot.getBoundingClientRect()
  openFeedMenu({
    clientX: bounds.left + bounds.width / 2,
    clientY: bounds.top + bounds.height / 2,
    foods: room?.getFoodItems() ?? [],
  })
})

const nightToggle = document.querySelector('.night-toggle')
nightToggle.addEventListener('click', () => {
  const isNight = nightToggle.getAttribute('aria-pressed') !== 'true'
  nightToggle.setAttribute('aria-pressed', String(isNight))
  nightToggle.setAttribute('aria-label', isNight ? 'Schakel dagmodus in' : 'Schakel nachtmodus in')
  nightToggle.title = isNight ? 'Schakel dagmodus in' : 'Schakel nachtmodus in'
  nightToggle.classList.toggle('is-night', isNight)
  document.body.classList.toggle('is-night', isNight)
  room?.setNightMode(isNight)
})

const shopToggle = document.querySelector('.shop-toggle')
const shopPanel = document.querySelector('.shop-panel')
const shopClose = document.querySelector('.shop-close')
const shopSelection = document.querySelector('.shop-selection')
const shopCategories = document.querySelector('.shop-categories')
const shopCatalogView = document.querySelector('.shop-catalog')
const shopProducts = document.querySelector('.shop-products')
const shopCount = document.querySelector('.shop-count')
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
const statsPanel = document.querySelector('#stats-panel')
const statsClose = document.querySelector('.stats-close')
const statsEmpty = document.querySelector('.stats-empty')
const statsDemoBadge = document.querySelector('.stats-demo-badge')
const statsWeekPrevious = document.querySelector('.stats-week-previous')
const statsWeekNext = document.querySelector('.stats-week-next')
const statsWeekLabel = document.querySelector('.stats-week-label')
const statsWeekTotal = document.querySelector('.stats-week-total-value')
const statsChart = document.querySelector('.stats-chart')
let cartCount = 0
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
  room?.setWorking(Boolean(timerInterval))
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

function setShopOpen(isOpen) {
  shopPanel.hidden = !isOpen
  shopToggle.setAttribute('aria-expanded', String(isOpen))
  shopToggle.setAttribute('aria-label', isOpen ? 'Winkel sluiten' : 'Winkel openen')
  if (isOpen) {
    if (!statsPanel.hidden) setStatsOpen(false)
    timerPanel.hidden = true
    timerToggle.setAttribute('aria-expanded', 'false')
    const toggleBounds = shopToggle.getBoundingClientRect()
    const panelBounds = shopPanel.getBoundingClientRect()
    const left = Math.max(12, Math.min(toggleBounds.left, innerWidth - panelBounds.width - 12))
    const aboveTop = toggleBounds.top - panelBounds.height - 12
    const top = aboveTop >= 12
      ? aboveTop
      : Math.min(toggleBounds.bottom + 12, innerHeight - panelBounds.height - 12)
    shopPanel.style.left = `${left}px`
    shopPanel.style.top = `${Math.max(12, top)}px`
    const focusTarget = shopCategories.hidden ? shopClose : shopPanel.querySelector('.shop-category')
    focusTarget.focus()
  }
  else shopToggle.focus()
}

function setStatsOpen(isOpen) {
  statsPanel.hidden = !isOpen
  statsToggle.setAttribute('aria-expanded', String(isOpen))
  statsToggle.setAttribute('aria-label', isOpen ? 'Dagelijkse timertijd sluiten' : 'Dagelijkse timertijd openen')
  if (isOpen) {
    if (!shopPanel.hidden) setShopOpen(false)
    timerPanel.hidden = true
    timerToggle.setAttribute('aria-expanded', 'false')
    renderTimerStats()
    statsClose.focus()
  } else {
    statsToggle.focus()
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

shopToggle.addEventListener('click', () => setShopOpen(shopPanel.hidden))
shopClose.addEventListener('click', () => setShopOpen(false))
statsToggle.addEventListener('click', () => setStatsOpen(statsPanel.hidden))
statsClose.addEventListener('click', () => setStatsOpen(false))
statsWeekPrevious.addEventListener('click', () => moveStatsWeek(-1))
statsWeekNext.addEventListener('click', () => moveStatsWeek(1))
timerToggle.addEventListener('click', () => {
  const isOpen = timerPanel.hidden
  if (isOpen) {
    setShopOpen(false)
    if (!statsPanel.hidden) setStatsOpen(false)
    timerPanel.hidden = false
    const toggleBounds = timerToggle.getBoundingClientRect()
    const panelBounds = timerPanel.getBoundingClientRect()
    const left = Math.max(12, Math.min(toggleBounds.left, innerWidth - panelBounds.width - 12))
    const aboveTop = toggleBounds.top - panelBounds.height - 12
    const top = aboveTop >= 12
      ? aboveTop
      : Math.min(toggleBounds.bottom + 12, innerHeight - panelBounds.height - 12)
    timerPanel.style.left = `${left}px`
    timerPanel.style.top = `${Math.max(12, top)}px`
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
  syncTimerDisplay()
})
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
    timerInterval = setInterval(() => {
      const currentTime = Date.now()
      remainingSeconds = Math.max(0, Math.ceil((timerEndAt - currentTime) / 1000))
      const now = Math.min(currentTime, timerEndAt)
      recordTimerUsage(now, remainingSeconds === 0)
      if (remainingSeconds === 0) {
        clearInterval(timerInterval)
        timerInterval = null
        timerEndAt = null
        trackingStartedAt = null
        timerAlert.hidden = false
      }
      syncTimerDisplay()
      if (!statsPanel.hidden) renderTimerStats()
    }, 250)
  }
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
    shopCategories.hidden = true
    shopCatalogView.hidden = false
    shopCatalogView.querySelector('.shop-category-title').textContent = categoryLabel
    shopProducts.replaceChildren(...shopItems[categoryName].map(([name, price, color]) => {
      const item = document.createElement('article')
      item.className = 'shop-product'
      item.innerHTML = `<span class="shop-product-art" style="--product-color:${color}" aria-hidden="true"></span><span class="shop-product-name">${name}</span><span class="shop-product-price">${price}</span><button class="add-to-cart" type="button" aria-label="Voeg ${name} toe aan winkelwagen" title="Toevoegen">+</button>`
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
        cartCount += 1
        shopCount.textContent = String(cartCount)
        shopCount.hidden = false
        event.currentTarget.classList.add('is-added')
        event.currentTarget.textContent = '✓'
        shopSelection.textContent = categoryName === 'food' ? `${name} in de koelkast` : `${name} toegevoegd`
      })
      return item
    }))
  })
})
shopPanel.querySelector('.shop-back').addEventListener('click', () => {
  shopCatalogView.hidden = true
  shopCategories.hidden = false
  shopSelection.textContent = 'Kies een categorie'
})
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !shopPanel.hidden) setShopOpen(false)
  if (event.key === 'Escape' && !timerPanel.hidden) {
    timerPanel.hidden = true
    timerToggle.setAttribute('aria-expanded', 'false')
    timerToggle.focus()
  }
  if (event.key === 'Escape' && !statsPanel.hidden) setStatsOpen(false)
  if (event.key === 'Escape' && !timerAlert.hidden) timerAlert.hidden = true
  if (event.key === 'Escape' && !feedMenu.hidden) feedMenu.hidden = true
})

window.addEventListener('pagehide', () => {
  const now = timerEndAt === null ? Date.now() : Math.min(Date.now(), timerEndAt)
  recordTimerUsage(now, true)
})

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
