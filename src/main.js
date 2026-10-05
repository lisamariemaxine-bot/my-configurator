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
  <button class="character-hotspot" type="button" aria-label="Klik op het mannetje om eten te geven" title="Geef eten aan het mannetje" hidden></button>
  <button class="night-toggle" type="button" aria-label="Schakel nachtmodus in" aria-pressed="false" title="Schakel nachtmodus in">
    <svg class="moon-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.2 15.1A8 8 0 0 1 8.9 4.8 8.2 8.2 0 1 0 19.2 15.1Z"/></svg>
    <svg class="sun-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>
  </button>
  <button class="shop-toggle" type="button" aria-label="Winkel openen" aria-expanded="false" aria-controls="shop-panel" title="Winkel">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6"/><circle cx="10" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/></svg>
    <span class="shop-count" hidden>0</span>
  </button>
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
  <section class="mood-hud" aria-label="Gevoel van het mannetje">
    <div class="mood-meter mood-happy" role="group" aria-label="Happy score">
      <span class="mood-label">Happy</span><output id="happy-value">70%</output>
    </div>
    <div class="mood-meter mood-food" role="group" aria-label="Food">
      <span class="mood-label">Food</span><output id="food-value">78%</output>
    </div>
    <div class="mood-meter mood-entertainment" role="group" aria-label="Entertainment">
      <span class="mood-label">Fun</span><output id="entertainment-value">68%</output>
    </div>
  </section>
  <aside class="feed-menu" id="feed-menu" role="dialog" aria-labelledby="feed-title" hidden>
    <header class="feed-menu-heading">
      <h2 id="feed-title">Geef eten</h2>
      <button class="feed-menu-close" type="button" aria-label="Voermenu sluiten" title="Sluiten">×</button>
    </header>
    <p class="feed-empty">De koelkast is leeg.</p>
    <div class="feed-products" role="list"></div>
  </aside>`

const moodElements = {
  happy: document.querySelector('#happy-value'),
  food: document.querySelector('#food-value'),
  entertainment: document.querySelector('#entertainment-value'),
}

function updateMood({ happy, food, entertainment }) {
  for (const [key, value] of Object.entries({ happy, food, entertainment })) {
    const formattedValue = `${value}%`
    if (moodElements[key].textContent !== formattedValue) moodElements[key].textContent = formattedValue
  }
}

const feedMenu = document.querySelector('#feed-menu')
const feedProducts = document.querySelector('.feed-products')
const feedEmpty = document.querySelector('.feed-empty')
const characterHotspot = document.querySelector('.character-hotspot')
const moodHud = document.querySelector('.mood-hud')
let foodItems = []
let nextFoodId = 1

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
  moodHud.hidden = !visible
  characterHotspot.style.left = `${x - 40}px`
  characterHotspot.style.top = `${y - 58}px`
  const compact = innerWidth <= 560
  const horizontalExtent = compact ? 66 : 76
  const topExtent = compact ? 108 : 118
  const bottomExtent = compact ? 24 : 27
  const moodX = Math.max(horizontalExtent + 8, Math.min(x, innerWidth - horizontalExtent - 8))
  const moodY = Math.max(topExtent + 8, Math.min(y, innerHeight - bottomExtent - 8))
  moodHud.style.left = `${moodX}px`
  moodHud.style.top = `${moodY}px`
}

let room
try {
  room = createLivingRoom(document.querySelector('#room-scene'), updateMood, openFeedMenu, updateCharacterHotspot)
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
let cartCount = 0

function setShopOpen(isOpen) {
  shopPanel.hidden = !isOpen
  shopToggle.setAttribute('aria-expanded', String(isOpen))
  shopToggle.setAttribute('aria-label', isOpen ? 'Winkel sluiten' : 'Winkel openen')
  if (isOpen) {
    const focusTarget = shopCategories.hidden ? shopClose : shopPanel.querySelector('.shop-category')
    focusTarget.focus()
  }
  else shopToggle.focus()
}

shopToggle.addEventListener('click', () => setShopOpen(shopPanel.hidden))
shopClose.addEventListener('click', () => setShopOpen(false))
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
  if (event.key === 'Escape' && !feedMenu.hidden) feedMenu.hidden = true
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
