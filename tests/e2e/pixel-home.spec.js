import { expect, test } from '@playwright/test'

// Scenario's en randgevallen voor Pixel Home. Draait op desktop (1440×900) en mobiel (Pixel 7).
// De tests gebruiken window.__pixelHome (alleen beschikbaar in `npm run dev`) om te weten
// waar een meubel op het scherm staat.

const room = page => ({
  point: name => page.evaluate(item => window.__pixelHome.room.getScreenPoint(item), name),
  project: xyz => page.evaluate(point => window.__pixelHome.room.projectPoint(point), xyz),
  camera: () => page.evaluate(() => window.__pixelHome.room.getCameraState()),
})

async function openApp(page, storage = null) {
  if (storage) {
    await page.addInitScript(values => {
      if (sessionStorage.getItem('seeded')) return
      sessionStorage.setItem('seeded', '1')
      for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value)
    }, storage)
  }
  await page.goto('/')
  await expect(page.locator('#room-scene canvas')).toBeVisible()
  // polling i.p.v. de standaard 'raf': met WebGL in software komen er weinig animatieframes door
  await page.waitForFunction(() => window.__pixelHome?.room, null, { polling: 250 })
}

async function skipTutorial(page) {
  await page.locator('.intro-skip').click()
  await expect(page.locator('.intro')).toBeHidden()
  // het huis schuift via de camera terug naar het midden
  await page.waitForTimeout(1200)
}

async function clickAt(page, { x, y }) {
  await page.mouse.click(x, y)
  await page.waitForTimeout(400)
}

test.describe('laden en tutorial', () => {
  test('laadt zonder fouten en toont meteen de tutorial', async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    await openApp(page)
    await expect(page.locator('.intro-bubble')).toBeVisible()
    await expect(page.locator('#intro-title')).toHaveText('Welkom!')
    await expect(page.locator('.intro-step-count')).toHaveText('1 / 7')
    expect(errors).toEqual([])
  })

  test('door alle stappen bladeren, terug, en afsluiten', async ({ page }) => {
    await openApp(page)
    await expect(page.locator('.intro-previous')).toBeDisabled()
    for (let step = 2; step <= 7; step++) {
      await page.locator('.intro-next').click()
      await expect(page.locator('.intro-step-count')).toHaveText(`${step} / 7`)
    }
    await expect(page.locator('.intro-next')).toHaveText('Starten')
    await page.locator('.intro-previous').click()
    await expect(page.locator('.intro-step-count')).toHaveText('6 / 7')
    await page.keyboard.press('Escape')
    await expect(page.locator('.intro')).toBeHidden()
  })

  test('de tutorial komt bij elke refresh terug en het ?-knopje opent hem opnieuw', async ({ page }) => {
    await openApp(page)
    await skipTutorial(page)
    await page.locator('.tutorial-toggle').click()
    await expect(page.locator('.intro-step-count')).toHaveText('1 / 7')
    await page.reload()
    await expect(page.locator('.intro-bubble')).toBeVisible()
  })
})

test.describe('draaien en zoomen', () => {
  test('slepen draait de camera', async ({ page }) => {
    await openApp(page)
    await skipTutorial(page)
    const before = await room(page).camera()
    const box = await page.locator('#room-scene canvas').boundingBox()
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.3)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.5 + 200, box.y + box.height * 0.3, { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(600)
    const after = await room(page).camera()
    expect(after.position).not.toEqual(before.position)
  })

  test('scrollen zoomt in', async ({ page, isMobile }) => {
    test.skip(isMobile, 'muiswiel bestaat niet op mobiel (daar knijp je om te zoomen)')
    await openApp(page)
    await skipTutorial(page)
    const before = await room(page).camera()
    const box = await page.locator('#room-scene canvas').boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.wheel(0, -600)
    await page.waitForTimeout(800)
    expect((await room(page).camera()).zoom).toBeGreaterThan(before.zoom)
  })
})

test.describe('configureren', () => {
  test('sofa: model kiezen en bewaard na refresh', async ({ page }) => {
    await openApp(page)
    await skipTutorial(page)
    await clickAt(page, await room(page).point('sofa'))
    await expect(page.locator('#sofa-customizer')).toBeVisible()
    await page.locator('[data-sofa-model="chesterfield"]').click()
    await expect(page.locator('[data-sofa-model="chesterfield"]')).toHaveAttribute('aria-pressed', 'true')
    await page.locator('[data-cushion-shape="square"]').click()
    await page.locator('#sofa-body-color').fill('#cc3366')
    await page.reload()
    await skipTutorial(page)
    await clickAt(page, await room(page).point('sofa'))
    await expect(page.locator('[data-sofa-model="chesterfield"]')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('[data-cushion-shape="square"]')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('#sofa-body-color')).toHaveValue('#cc3366')
  })

  test('bureau: drie sets, kleurkiezers passen zich aan, keuze blijft bewaard', async ({ page }) => {
    await openApp(page)
    await skipTutorial(page)
    await clickAt(page, await room(page).point('desk'))
    await expect(page.locator('#furniture-customizer-title')).toHaveText('Bureau aanpassen')
    const models = page.locator('.furniture-customizer-models button')
    await expect(models).toHaveText(['Modern', 'Gaming', 'Vintage'])
    await models.filter({ hasText: 'Gaming' }).click()
    await expect(page.locator('.furniture-customizer-colors label')).toHaveText(['Kleur bureau en stoel', 'Kleur stoelbekleding', 'Kleur ledstrip'])
    await page.reload()
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('pixel-home-furniture-models')))
    expect(stored).toEqual({ desk: 'gaming' })
  })

  test('keuken: model wisselen en kleur aanpassen', async ({ page }) => {
    await openApp(page)
    await skipTutorial(page)
    await clickAt(page, await room(page).point('kitchen'))
    await expect(page.locator('#furniture-customizer-title')).toHaveText('Keuken aanpassen')
    await page.locator('.furniture-customizer-models button', { hasText: 'Retro' }).click()
    await page.locator('.furniture-customizer-colors input').first().fill('#ff8800')
    const colors = await page.evaluate(() => JSON.parse(localStorage.getItem('pixel-home-furniture-colors')))
    expect(colors.kitchen.kitchenRetro).toBe('#ff8800')
    await page.locator('.furniture-customizer-reset').click()
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pixel-home-furniture-colors')).kitchen)).toBeUndefined()
  })
})

test.describe('camera', () => {
  test('van het ene meubel naar het andere en sluiten: je zit niet vast ingezoomd', async ({ page }) => {
    await openApp(page)
    await skipTutorial(page)
    const start = await room(page).camera()
    await page.evaluate(() => window.__pixelHome.openFurniture('desk'))
    await page.waitForTimeout(300)
    await page.evaluate(() => window.__pixelHome.openFurniture('kitchen'))
    await page.waitForTimeout(1200)
    await expect(page.locator('#furniture-customizer-title')).toHaveText('Keuken aanpassen')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1500)
    const end = await room(page).camera()
    expect(end.zoom).toBeCloseTo(start.zoom, 2)
    end.position.forEach((value, index) => expect(value).toBeCloseTo(start.position[index], 1))
  })

  test('de huisjesknop brengt je terug naar het hele huis', async ({ page, isMobile }) => {
    test.skip(isMobile, 'inzoomen met het muiswiel')
    await openApp(page)
    await skipTutorial(page)
    const start = await room(page).camera()
    const box = await page.locator('#room-scene canvas').boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    for (let i = 0; i < 6; i++) await page.mouse.wheel(0, -800)
    await page.waitForTimeout(800)
    const zoomed = await room(page).camera()
    expect(zoomed.zoom).toBeGreaterThan(start.zoom)
    expect(zoomed.zoom).toBeLessThanOrEqual(6)
    await page.locator('.view-reset').click()
    await page.waitForTimeout(500)
    expect((await room(page).camera()).zoom).toBeCloseTo(start.zoom, 2)
  })
})

test.describe('randgevallen', () => {
  test('de muur is niet aanpasbaar: klikken opent niets', async ({ page }) => {
    await openApp(page)
    await skipTutorial(page)
    await clickAt(page, await room(page).project([0.5, 4.3, -4.36]))
    await expect(page.locator('#furniture-customizer')).toBeHidden()
    await expect(page.locator('#sofa-customizer')).toBeHidden()
  })

  test('klik op de tv opent niets (ook niet de muur erachter)', async ({ page }) => {
    await openApp(page)
    await skipTutorial(page)
    await clickAt(page, await room(page).point('tv'))
    await expect(page.locator('#furniture-customizer')).toBeHidden()
    await expect(page.locator('#sofa-customizer')).toBeHidden()
  })

  test('slepen over een meubel opent geen paneel', async ({ page }) => {
    await openApp(page)
    await skipTutorial(page)
    const { x, y } = await room(page).point('sofa')
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + 60, y, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(400)
    await expect(page.locator('#sofa-customizer')).toBeHidden()
  })

  test('kapotte of verouderde opslag breekt de site niet', async ({ page }) => {
    await openApp(page, {
      'pixel-home-furniture-models': '{kapot',
      'pixel-home-sofa-model': 'ruimteschip',
      'pixel-home-sofa-cushion-shape': 'driehoek',
      'pixel-home-furniture-colors': '[1,2,3]',
    })
    await skipTutorial(page)
    await clickAt(page, await room(page).point('sofa'))
    await expect(page.locator('[data-sofa-model="modern"]')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('[data-cushion-shape="rounded"]')).toHaveAttribute('aria-pressed', 'true')
  })

  test('op de bovenverdieping opent een klik geen paneel van beneden', async ({ page }) => {
    await openApp(page)
    await skipTutorial(page)
    await page.locator('.floor-arrow[data-floor="1"]').click()
    await page.waitForTimeout(1200)
    expect((await room(page).camera()).activeFloor).toBe(1)
    await clickAt(page, await room(page).point('sofa'))
    await expect(page.locator('#sofa-customizer')).toBeHidden()
  })

  test('start altijd in dagmodus, ook \'s nachts', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-08T23:30:00+01:00'))
    await openApp(page)
    await expect(page.locator('body')).not.toHaveClass(/is-night/)
    await expect(page.locator('.night-stars')).toHaveCSS('opacity', '0')
  })

  test('nachtknop toont de sterrenhemel en wisselt terug', async ({ page }) => {
    await openApp(page)
    await skipTutorial(page)
    await page.locator('.night-toggle').click()
    await expect(page.locator('body')).toHaveClass(/is-night/)
    await expect(page.locator('.night-stars i')).toHaveCount(46)
    await expect(page.locator('.night-stars')).toHaveCSS('opacity', '1')
    await page.locator('.night-toggle').click()
    await expect(page.locator('body')).not.toHaveClass(/is-night/)
  })
})

test.describe('responsive', () => {
  test('geen horizontale scroll en alles binnen beeld', async ({ page }) => {
    await openApp(page)
    const viewport = page.viewportSize()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
    const bubble = await page.locator('.intro-bubble').boundingBox()
    expect(bubble.x).toBeGreaterThanOrEqual(0)
    expect(bubble.x + bubble.width).toBeLessThanOrEqual(viewport.width)
    expect(bubble.y + bubble.height).toBeLessThanOrEqual(viewport.height)
  })

  test('tijdens de tutorial vult het canvas het hele scherm (niets wordt afgesneden bij inzoomen)', async ({ page }) => {
    await openApp(page)
    await expect(page.locator('.intro-bubble')).toBeVisible()
    const canvas = await page.locator('#room-scene canvas').boundingBox()
    const viewport = page.viewportSize()
    expect(Math.round(canvas.x)).toBe(0)
    expect(Math.round(canvas.width)).toBe(viewport.width)
    expect(Math.round(canvas.height)).toBe(viewport.height)
    const transform = await page.locator('#room-scene canvas').evaluate(element => getComputedStyle(element).transform)
    expect(transform).toBe('none')
  })

  test('het aanpaspaneel past op het scherm', async ({ page }) => {
    await openApp(page)
    await skipTutorial(page)
    await clickAt(page, await room(page).point('sofa'))
    const panel = await page.locator('#sofa-customizer').boundingBox()
    const viewport = page.viewportSize()
    expect(panel.x).toBeGreaterThanOrEqual(0)
    expect(panel.x + panel.width).toBeLessThanOrEqual(viewport.width)
    expect(panel.y + panel.height).toBeLessThanOrEqual(viewport.height)
  })
})
