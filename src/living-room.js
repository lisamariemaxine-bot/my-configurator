import * as THREE from 'three'
import { createBedroom } from './bedroom.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { PALETTE, THEME_PALETTES, resolveColor } from './palette.js'

const FLOOR_PREVIEW_OPACITY = 0.55

export function createLivingRoom(container, onMoodUpdate = () => {}, onCharacterClick = () => {}, onCharacterPosition = () => {}, onFurnitureClick = () => {}) {
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-7, 7, 5, -5, 0.1, 80)
  const roomViewOffset = -0.6
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
  renderer.setPixelRatio(0.5)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.BasicShadowMap
  renderer.domElement.style.imageRendering = 'pixelated'
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minPolarAngle = 0.55
  controls.maxPolarAngle = 1.3
  controls.minDistance = 11
  controls.maxDistance = 22
  // Orthografische camera: zoomen gebeurt via camera.zoom, dus daar horen de grenzen
  controls.minZoom = 0.3
  controls.maxZoom = 6
  controls.target.set(0.2 + roomViewOffset, 1.25, -0.15 + roomViewOffset)

  const materials = Object.fromEntries(Object.entries(PALETTE).map(([name, color]) => [
    name,
    name === 'lampGlow'
      ? new THREE.MeshBasicMaterial({ color })
      : new THREE.MeshLambertMaterial({ color, flatShading: true }),
  ]))
  const room = new THREE.Group()
  const themeGroups = new Map()
  const themedMaterials = new Set()
  const sceneTextures = new Set()
  const accentLights = []

  function getThemeGroup(name) {
    if (!themeGroups.has(name)) {
      const group = new THREE.Group()
      room.add(group)
      themeGroups.set(name, group)
    }
    return themeGroups.get(name)
  }

  function box(width, height, depth, x, y, z, materialName, parent = room) {
    const geometry = new THREE.BoxGeometry(width, height, depth)
    const mesh = new THREE.Mesh(geometry, materials[materialName])
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData.paletteKey = materialName
    const unit = new THREE.Group()
    unit.add(mesh)
    parent.add(unit)
    return mesh
  }

  const createDetailMesh = (...args) => detailMesh(...args)
  function detailMesh(geometry, color, x, y, z, parent) {
    const mesh = new THREE.Mesh(geometry, materials[color])
    mesh.position.set(x, y, z)
    mesh.userData.paletteKey = color
    mesh.castShadow = true
    mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }

  function rim(radius, tube, x, y, z, color, parent) {
    const mesh = detailMesh(new THREE.TorusGeometry(radius, tube, 6, 32), color, x, y, z, parent)
    mesh.rotation.x = Math.PI / 2
    return mesh
  }

  // Ovaal blad met de punt onderaan op (0, 0, 0), zodat het echt uit de aarde of een steel groeit
  function leafBlade(parent, width, length, thickness, color) {
    const geometry = new THREE.SphereGeometry(0.5, 8, 6)
    geometry.scale(width, length, thickness)
    geometry.translate(0, length / 2, 0)
    return detailMesh(geometry, color, 0, 0, 0, parent)
  }

  // Plant in een ronde pot: de aarde zit binnen de rand en alles groeit vanuit die aarde.
  // style: 'snake' (rechtopstaande bladeren), 'cactus' of 'trailing' (ranken over de rand, richting trailDirection)
  function createPottedPlant(parent, x, y, z, { scale = 1, pot = 'terracotta', style = 'snake', trailDirection = new THREE.Vector3(0, 0, 1) } = {}) {
    const plant = new THREE.Group()
    plant.position.set(x, y, z)
    plant.scale.setScalar(scale)
    parent.add(plant)
    const radius = 0.15
    const height = 0.24
    detailMesh(new THREE.CylinderGeometry(radius, radius * 0.74, height, 16), pot, 0, height / 2, 0, plant)
    rim(radius - 0.004, 0.016, 0, height - 0.004, 0, pot, plant)
    const soilY = height - 0.03
    detailMesh(new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, 0.02, 16), 'darkWood', 0, soilY - 0.01, 0, plant)

    const up = new THREE.Vector3(0, 1, 0)
    function grow(angle, tilt, offset = 0.035) {
      const stem = new THREE.Group()
      stem.position.set(Math.cos(angle) * offset, soilY, Math.sin(angle) * offset)
      stem.quaternion.setFromUnitVectors(up, new THREE.Vector3(Math.cos(angle) * Math.sin(tilt), Math.cos(tilt), Math.sin(angle) * Math.sin(tilt)))
      plant.add(stem)
      return stem
    }

    if (style === 'snake') {
      for (let index = 0; index < 7; index++) {
        const angle = index * 2.4
        const blade = grow(angle, index === 0 ? 0.04 : 0.14 + (index % 3) * 0.1)
        const leaf = leafBlade(blade, 0.07 + (index % 2) * 0.012, 0.3 + ((index * 5) % 4) * 0.06, 0.024, index % 2 ? 'olive' : 'plantGreen')
        leaf.rotation.y = -angle
      }
    } else if (style === 'cactus') {
      detailMesh(new THREE.CapsuleGeometry(0.065, 0.24, 4, 10), 'olive', 0, soilY + 0.17, 0, plant)
      for (const side of [-1, 1]) {
        const armY = soilY + (side < 0 ? 0.15 : 0.2)
        const elbow = detailMesh(new THREE.CapsuleGeometry(0.034, 0.06, 4, 8), 'olive', side * 0.085, armY, 0, plant)
        elbow.rotation.z = Math.PI / 2
        detailMesh(new THREE.CapsuleGeometry(0.036, side < 0 ? 0.08 : 0.11, 4, 8), 'plantGreen', side * 0.13, armY + (side < 0 ? 0.06 : 0.075), 0, plant)
      }
      for (let spine = 0; spine < 8; spine++) {
        const angle = spine * 0.8
        detailMesh(new THREE.SphereGeometry(0.009, 4, 3), 'cream',
          Math.cos(angle) * 0.066, soilY + 0.08 + spine * 0.035, Math.sin(angle) * 0.066, plant).castShadow = false
      }
      detailMesh(new THREE.SphereGeometry(0.03, 6, 4), 'terracotta', 0.015, soilY + 0.355, 0, plant)
    } else {
      for (let index = 0; index < 4; index++) {
        const leaf = leafBlade(grow(index * 1.6, 0.5), 0.07, 0.11, 0.022, index % 2 ? 'olive' : 'plantGreen')
        leaf.rotation.y = -index * 1.6
      }
      const out = trailDirection.clone().setY(0).normalize()
      const side = new THREE.Vector3(-out.z, 0, out.x)
      for (const [offset, length] of [[-0.07, 0.62], [0.03, 0.84], [0.1, 0.5]]) {
        const start = side.clone().multiplyScalar(offset).setY(soilY)
        const lip = start.clone().addScaledVector(out, radius + 0.03).setY(height + 0.03)
        const curve = new THREE.CatmullRomCurve3([
          start,
          lip,
          lip.clone().addScaledVector(out, 0.07).setY(height - 0.12),
          lip.clone().addScaledVector(out, 0.1).addScaledVector(side, offset * 0.6).setY(height - length * 0.55),
          lip.clone().addScaledVector(out, 0.12).addScaledVector(side, -offset * 0.4).setY(height - length),
        ])
        detailMesh(new THREE.TubeGeometry(curve, 20, 0.012, 4, false), 'plantGreen', 0, 0, 0, plant)
        for (let index = 2; index <= 11; index++) {
          const point = curve.getPoint(index / 12)
          const holder = new THREE.Group()
          holder.position.copy(point)
          holder.rotation.set(0, Math.atan2(out.x, out.z), (index % 2 ? 1 : -1) * 2.3)
          plant.add(holder)
          leafBlade(holder, 0.075, 0.1, 0.02, index % 2 ? 'olive' : 'plantGreen')
        }
      }
    }
    return plant
  }

  // Rij boeken met de rug naar de kamer (-x). Dunne, hoge boeken met bladzijden bovenaan,
  // wisselende hoogtes, soms een liggend stapeltje en een boek dat schuin tegen de rest leunt.
  function createBookRow(parent, { frontX, baseY, fromZ, toZ, maxHeight, depth = 0.22, seed = 1, colors, stackAt = null, lean = true }) {
    let state = seed * 7919
    const random = () => (state = (state * 9301 + 49297) % 233280) / 233280
    const palette = colors ?? ['terracotta', 'blue', 'tan', 'olive', 'mustard', 'brown', 'sky']
    const centerX = frontX + depth / 2
    // Boeken niet laten 'verfijnen' tot bladeren of potten (zie refineRoomObjects)
    const detailMesh = (...args) => {
      const mesh = createDetailMesh(...args)
      mesh.userData.keepShape = true
      return mesh
    }
    function upright(z, thickness, height, color, tilt = 0) {
      const book = new THREE.Group()
      book.position.set(centerX, baseY, z)
      book.rotation.x = tilt
      parent.add(book)
      detailMesh(new THREE.BoxGeometry(depth, height, thickness), color, 0, height / 2, 0, book)
      detailMesh(new THREE.BoxGeometry(depth * 0.94, 0.01, thickness * 0.78), 'cream', 0.006, height + 0.001, 0, book).castShadow = false
      for (const band of random() > 0.4 ? [0.14, 0.86] : [0.8]) {
        detailMesh(new THREE.BoxGeometry(0.006, 0.014, thickness * 0.82), random() > 0.5 ? 'cream' : 'rugGold',
          -depth / 2 - 0.002, height * band, 0, book).castShadow = false
      }
    }
    let z = fromZ
    let index = 0
    let lastHeight = maxHeight
    while (z < toZ) {
      if (stackAt !== null && index === stackAt) {
        const length = Math.min(depth * 1.6, maxHeight * 1.1)
        if (z + length > toZ) break
        let y = baseY
        for (let layer = 0; layer < 3; layer++) {
          const thickness = 0.04 + random() * 0.025
          const width = length - layer * 0.03
          const flat = detailMesh(new THREE.BoxGeometry(depth * (0.95 - layer * 0.06), thickness, width), palette[(index + layer * 2) % palette.length],
            centerX, y + thickness / 2, z + length / 2 + (layer % 2 ? 0.012 : -0.008), parent)
          flat.rotation.y = (layer - 1) * 0.06
          detailMesh(new THREE.BoxGeometry(depth * 0.9, thickness * 0.72, 0.006), 'cream', centerX + 0.006, y + thickness / 2, z + length / 2 + width / 2 + 0.002, parent).castShadow = false
          y += thickness
        }
        z += length + 0.04
        index++
        continue
      }
      const thickness = 0.045 + random() * 0.045
      const height = maxHeight * (0.72 + random() * 0.28)
      if (z + thickness > toZ) break
      const remaining = toZ - z - thickness
      if (lean && index > 2 && remaining < 0.2 && remaining > 0.1) {
        // Laatste boek leunt met zijn bovenkant tegen het vorige boek
        const tilt = Math.min(0.42, Math.asin(Math.min(0.9, (remaining * 0.9) / height)))
        upright(z + thickness / 2 + Math.sin(tilt) * Math.min(height, lastHeight) * 0.55, thickness, height, palette[index % palette.length], -tilt)
        break
      }
      upright(z + thickness / 2, thickness, height, palette[(index * 3 + seed) % palette.length])
      lastHeight = height
      z += thickness + (random() > 0.75 ? 0.012 : 0.002)
      index++
    }
  }

  function createTableLamp(parent, x, y, z) {
    box(0.2, 0.04, 0.2, x, y + 0.02, z, 'darkWood', parent)
    box(0.055, 0.42, 0.055, x, y + 0.24, z, 'darkWood', parent)
    detailMesh(new THREE.CylinderGeometry(0.14, 0.23, 0.24, 16, 1, true), 'tan', x, y + 0.55, z, parent)
    rim(0.23, 0.014, x, y + 0.43, z, 'tan', parent)
    rim(0.14, 0.012, x, y + 0.67, z, 'tan', parent)
    box(0.2, 0.1, 0.2, x, y + 0.43, z, 'lampGlow', parent)
    const light = new THREE.PointLight(PALETTE.lampGlow, 1.5, 3, 2)
    light.position.set(x, y + 0.5, z)
    parent.add(light)
    accentLights.push(light)
  }

  // Drie bureausets (bureau + bijpassende stoel). Het mannetje zit op elk model op dezelfde plek:
  // zitting bovenaan op 0.89 bij (-3.3, -2.42) en bladhoogte 1.19, met vrije beenruimte eronder.
  function createDeskArea() {
    const desk = getThemeGroup('desk')
    desk.position.set(-6.7, 0, 0.6)
    desk.rotation.y = Math.PI
    const seatX = -3.3
    const seatZ = -2.42

    // Gedeeld op elk bureau: scherm, toetsenbord, muis en lamp
    box(0.96, 0.64, 0.08, -3.22, 1.59, -3.72, 'darkWood', desk)
    box(0.82, 0.5, 0.025, -3.22, 1.59, -3.65, 'darkGray', desk)
    box(0.1, 0.36, 0.1, -3.22, 1.19, -3.58, 'darkWood', desk)
    box(0.58, 0.06, 0.22, -3.22, 1.2, -3.14, 'darkGray', desk)
    for (let row = 0; row < 3; row++) for (let key = 0; key < 8; key++) {
      box(0.045, 0.012, 0.04, -3.45 + key * 0.065, 1.238, -3.21 + row * 0.06, 'cream', desk)
    }
    detailMesh(new THREE.SphereGeometry(0.065, 12, 8), 'darkGray', -2.76, 1.21, -3.13, desk).scale.set(0.8, 0.4, 1.2)
    box(0.64, 0.035, 0.008, -3.22, 1.74, -3.632, 'blue', desk)
    for (let line = 0; line < 4; line++) box(0.26 + (line % 2) * 0.18, 0.018, 0.008, -3.29, 1.63 - line * 0.06, -3.632, 'crtGreen', desk)
    createTableLamp(desk, -4.05, 1.19, -3.45)

    // --- Set 1: modern (lichte bureaukast met lades, stoel in dezelfde kleur) ---
    const modern = modelGroup('desk', 'modern')
    box(2.32, 0.14, 0.78, -3.35, 1.04, -3.45, 'deskBody', modern)
    box(2.1, 0.08, 0.6, -3.35, 1.15, -3.45, 'deskBody', modern)
    for (const x of [-4.27, -2.43]) for (const z of [-3.72, -3.18]) box(0.12, 0.96, 0.12, x, 0.52, z, 'deskBody', modern)
    box(0.54, 0.66, 0.68, -4.08, 0.68, -3.46, 'deskBody', modern)
    box(0.4, 0.24, 0.035, -4.08, 0.84, -3.08, 'deskBody', modern)
    box(0.4, 0.24, 0.035, -4.08, 0.53, -3.08, 'deskBody', modern)
    for (const y of [0.84, 0.53]) box(0.16, 0.025, 0.035, -4.08, y, -3.045, 'darkWood', modern)
    box(0.86, 0.14, 0.86, seatX, 0.73, seatZ, 'deskBody', modern)
    box(0.72, 0.1, 0.72, seatX, 0.84, seatZ, 'deskChair', modern)
    for (const x of [-3.57, -3.03]) for (const z of [-2.68, -2.16]) box(0.1, 0.65, 0.1, x, 0.35, z, 'deskBody', modern)
    box(0.86, 0.66, 0.08, seatX, 1.2, -1.97, 'deskBody', modern)
    box(0.76, 0.54, 0.06, seatX, 1.2, -2.03, 'deskChair', modern)

    // --- Set 2: gaming (zwart bureau met ledstrip, racestoel op wieltjes) ---
    const gaming = modelGroup('desk', 'gaming')
    box(2.4, 0.1, 0.82, -3.35, 1.14, -3.45, 'deskGaming', gaming)
    for (const x of [-4.42, -2.28]) {
      box(0.1, 1.04, 0.1, x, 0.55, -3.45, 'deskGaming', gaming)
      box(0.14, 0.06, 0.8, x, 0.03, -3.45, 'deskGaming', gaming)
    }
    box(2.1, 0.05, 0.06, -3.35, 0.4, -3.75, 'deskGaming', gaming)
    const ledStrip = box(2.36, 0.025, 0.02, -3.35, 1.1, -3.035, 'deskAccent', gaming)
    ledStrip.material = new THREE.MeshBasicMaterial({ color: PALETTE.deskAccent })
    box(1.3, 0.008, 0.5, -3.25, 1.194, -3.22, 'darkGray', gaming)
    for (let spoke = 0; spoke < 5; spoke++) {
      const angle = spoke * Math.PI * 2 / 5
      const arm = box(0.06, 0.05, 0.36, seatX + Math.sin(angle) * 0.18, 0.09, seatZ + Math.cos(angle) * 0.18, 'deskGaming', gaming)
      arm.rotation.y = angle
      detailMesh(new THREE.SphereGeometry(0.045, 8, 6), 'darkGray', seatX + Math.sin(angle) * 0.36, 0.045, seatZ + Math.cos(angle) * 0.36, gaming)
    }
    detailMesh(new THREE.CylinderGeometry(0.04, 0.05, 0.62, 10), 'deskGaming', seatX, 0.42, seatZ, gaming)
    box(0.74, 0.14, 0.72, seatX, 0.82, seatZ, 'deskGamingChair', gaming)
    for (const side of [-1, 1]) {
      box(0.1, 0.1, 0.7, seatX + side * 0.36, 0.92, seatZ, 'deskGaming', gaming)
      box(0.1, 0.92, 0.16, seatX + side * 0.36, 1.44, -2.0, 'deskGaming', gaming)
      box(0.05, 0.24, 0.05, seatX + side * 0.45, 0.98, -2.36, 'deskGaming', gaming)
      box(0.09, 0.04, 0.32, seatX + side * 0.45, 1.11, -2.38, 'deskGaming', gaming)
    }
    box(0.64, 1.06, 0.14, seatX, 1.46, -2.0, 'deskGamingChair', gaming)
    box(0.12, 0.92, 0.012, seatX, 1.42, -2.074, 'deskGaming', gaming)
    box(0.34, 0.16, 0.08, seatX, 1.8, -2.1, 'deskGaming', gaming)

    // --- Set 3: vintage (houten schrijfbureau met gedraaide poten, houten stoel met spijlen) ---
    const vintage = modelGroup('desk', 'vintage')
    box(2.3, 0.1, 0.8, -3.35, 1.14, -3.45, 'deskVintage', vintage)
    box(0.7, 0.14, 0.7, -4.05, 1.02, -3.45, 'deskVintage', vintage)
    box(0.62, 0.14, 0.7, -2.55, 1.02, -3.45, 'deskVintage', vintage)
    for (const drawerX of [-4.05, -2.55]) {
      box(0.5, 0.09, 0.02, drawerX, 1.02, -3.095, 'darkWood', vintage)
      detailMesh(new THREE.SphereGeometry(0.02, 8, 6), 'buckle', drawerX, 1.02, -3.08, vintage)
    }
    const turnedLeg = new THREE.LatheGeometry([
      [0.03, 0], [0.05, 0.05], [0.035, 0.22], [0.06, 0.45], [0.035, 0.66], [0.05, 0.9], [0.05, 0.97],
    ].map(([r, y]) => new THREE.Vector2(r, y)), 10)
    for (const x of [-4.36, -2.3]) for (const z of [-3.78, -3.12]) detailMesh(turnedLeg, 'deskVintage', x, 0, z, vintage)
    box(0.42, 0.26, 0.18, -2.4, 1.32, -3.76, 'deskVintage', vintage)
    for (const slotX of [-2.52, -2.4, -2.28]) box(0.02, 0.2, 0.14, slotX, 1.32, -3.73, 'darkWood', vintage)
    box(0.7, 0.08, 0.66, seatX, 0.8, seatZ, 'deskVintage', vintage)
    box(0.62, 0.06, 0.58, seatX, 0.86, seatZ, 'deskVintageChair', vintage)
    for (const legX of [-0.28, 0.28]) for (const legZ of [-0.26, 0.26]) {
      detailMesh(new THREE.CylinderGeometry(0.035, 0.025, 0.76, 8), 'deskVintage', seatX + legX, 0.38, seatZ + legZ, vintage)
    }
    for (const side of [-1, 1]) box(0.06, 0.82, 0.06, seatX + side * 0.3, 1.22, -2.14, 'deskVintage', vintage)
    box(0.68, 0.1, 0.07, seatX, 1.6, -2.14, 'deskVintage', vintage)
    for (const spindle of [-0.17, -0.06, 0.06, 0.17]) {
      detailMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.7, 6), 'deskVintage', seatX + spindle, 1.2, -2.14, vintage)
    }

    setFurnitureModel('desk', 'modern')
  }

  function createParquetFloor() {
    const floor = getThemeGroup('floor')
    box(10, 0.16, 9, 0, -0.08, 0, 'parquetDark', floor)
    const planks = ['parquet', 'parquetLight', 'parquet', 'parquetDark', 'parquet', 'parquetLight']
    for (let row = 0; row < 20; row++) {
      const z = -4.24 + row * 0.45
      const offset = row % 2 ? -0.58 : 0
      for (let column = 0; column < 9; column++) {
        const x = -4.35 + offset + column * 1.24
        if (x < -4.85 || x > 4.85) continue
        box(1.22, 0.028, 0.44, x, 0.018, z, planks[(row + column) % planks.length], floor)
      }
    }
  }

  function createRoomShell() {
    createParquetFloor()
    const walls = getThemeGroup('walls')
    // Only the back and right walls exist; the front and left remain open.
    box(10, 5.2, 0.16, 0, 2.6, -4.45, 'wallpaperBase', walls).userData.wallSide = 'back'
    box(0.16, 5.2, 9, 4.92, 2.6, 0, 'wallpaperBase', walls).userData.wallSide = 'right'

    const stripeGeometry = new THREE.PlaneGeometry(0.25, 5.2)
    for (const side of ['back', 'right']) {
      const length = side === 'back' ? 10 : 9
      for (let offset = 0.25; offset < length; offset += 0.5) {
        const stripe = new THREE.Mesh(stripeGeometry, materials.wallpaperStripe)
        stripe.userData.paletteKey = 'wallpaperStripe'
        stripe.userData.wallSide = side
        stripe.receiveShadow = true
        if (side === 'back') stripe.position.set(-5 + offset, 2.6, -4.36)
        else {
          stripe.position.set(4.83, 2.6, -4.5 + offset)
          stripe.rotation.y = -Math.PI / 2
        }
        walls.add(stripe)
      }
    }
  }

  function createWindow() {
    const window = getThemeGroup('window')
    const x = -2.65
    const y = 3.08
    const z = -4.32
    box(2.55, 1.95, 0.13, x, y, z, 'darkWood', window)
    const sky = box(2.28, 1.68, 0.035, x, y, z + 0.09, 'sky', window)
    sky.material = sky.material.clone()
    themedMaterials.add(sky.material)
    box(0.44, 0.34, 0.02, x + 0.64, y + 0.48, z + 0.13, 'lampGlow', window)
    box(0.52, 0.16, 0.02, x - 0.58, y + 0.22, z + 0.13, 'cream', window)
    box(0.3, 0.22, 0.02, x - 0.78, y + 0.1, z + 0.13, 'cream', window)
    box(0.38, 0.14, 0.02, x - 0.3, y + 0.12, z + 0.13, 'cream', window)
    box(0.46, 0.15, 0.02, x + 0.58, y - 0.32, z + 0.13, 'cream', window)
    box(0.24, 0.18, 0.02, x + 0.38, y - 0.42, z + 0.13, 'cream', window)
    box(0.1, 1.58, 0.04, x, y, z + 0.15, 'darkWood', window)
    box(2.2, 0.1, 0.04, x, y, z + 0.15, 'darkWood', window)
    box(0.32, 2.12, 0.12, x - 1.25, y, z + 0.18, 'pendantOrange', window)
    box(0.32, 2.12, 0.12, x + 1.25, y, z + 0.18, 'pendantOrange', window)
    box(2.82, 0.13, 0.16, x, y + 1.08, z + 0.18, 'darkWood', window)

    const hangingPlant = getThemeGroup('curtainPlant')
    hangingPlant.position.set(x - 1.25, y + 1.08 + 0.065, z + 0.18)
    box(0.34, 0.3, 0.34, 0, 0.15, 0, 'cream', hangingPlant)
    box(0.38, 0.06, 0.38, 0, 0.29, 0, 'cream', hangingPlant)
    box(0.3, 0.025, 0.3, 0, 0.325, 0, 'darkWood', hangingPlant)

    for (const [offset, length] of [[-0.17, 0.92], [0, 1.18], [0.17, 0.72]]) {
      const points = [
        new THREE.Vector3(0, 0.34, 0),
        new THREE.Vector3(0 + offset, 0.41, 0.2),
        new THREE.Vector3(0 + offset, 0.19, 0.38),
        new THREE.Vector3(0 + offset + 0.04, 0.19 - length * 0.5, 0.41),
        new THREE.Vector3(0 + offset - 0.03, 0.19 - length, 0.43),
      ]
      const curve = new THREE.CatmullRomCurve3(points)
      const vine = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.018, 4, false), materials.plantGreen)
      vine.userData.paletteKey = 'plantGreen'
      vine.castShadow = true
      hangingPlant.add(vine)
      for (let index = 1; index <= 9; index++) {
        const point = curve.getPoint(index / 10)
        const side = index % 2 ? -1 : 1
        const leaf = box(0.13, 0.2, 0.055, point.x + side * 0.055, point.y - 0.035, point.z + 0.025,
          index % 2 ? 'olive' : 'plantGreen', hangingPlant)
        leaf.rotation.z = side * 0.5
      }
    }

    for (const side of [-1, 1]) for (let fold = 0; fold < 4; fold++) {
      const pleat = detailMesh(new THREE.CylinderGeometry(0.04, 0.045, 2.08, 8), 'pendantOrange', x + side * 1.25 - 0.12 + fold * 0.08, y, z + 0.25, window)
      pleat.scale.z = 0.8
    }
    box(2.82, 0.09, 0.3, x, y - 1.02, z + 0.17, 'darkWood', window)
    const nightDetails = new THREE.Group()
    window.add(nightDetails)
    nightDetails.visible = false
    const moon = new THREE.Mesh(new THREE.CircleGeometry(0.2, 8), materials.lampGlow)
    moon.position.set(x + 0.7, y + 0.48, z + 0.125)
    nightDetails.add(moon)
    for (const [starX, starY, size] of [
      [-0.72, 0.55, 0.06], [-0.25, 0.56, 0.045], [0.08, 0.38, 0.05],
      [0.9, 0.2, 0.045], [-0.85, -0.35, 0.05], [0.16, -0.52, 0.06],
    ]) box(size, size, 0.02, x + starX, y + starY, z + 0.125, 'lampGlow', nightDetails)

    return isNight => {
      sky.material.color.set(isNight ? PALETTE.nightSky : PALETTE.sky)
      nightDetails.visible = isNight
    }
  }

  // Meubels met meerdere modellen: elk model is een groepje in de themagroep, er is er telkens één zichtbaar.
  // De oplichtende rand (een kopie) krijgt dezelfde userData mee en wisselt dus mee.
  const furnitureModels = new Map()
  function modelGroup(item, name) {
    const group = new THREE.Group()
    group.userData.modelOf = item
    group.userData.modelName = name
    getThemeGroup(item).add(group)
    if (!furnitureModels.has(item)) furnitureModels.set(item, new Set())
    furnitureModels.get(item).add(name)
    return group
  }
  function setFurnitureModel(item, name) {
    if (!furnitureModels.get(item)?.has(name)) return false
    room.traverse(object => {
      if (object.userData.modelOf === item) object.visible = object.userData.modelName === name
    })
    return true
  }

  // Drie sofamodellen in één themagroep; telkens is er maar één zichtbaar.
  // Ze gebruiken dezelfde kleursleutels, zodat de kleurkiezers op elk model werken.
  function createSectionalSofa() {
    const sofa = getThemeGroup('sofa')
    const adjustableCushions = []
    const z = -0.15
    const model = name => modelGroup('sofa', name)
    function softCushion(width, height, depth, radius, color, parent) {
      const mesh = new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 4, radius), materials[color])
      mesh.userData.paletteKey = color
      mesh.castShadow = true
      mesh.receiveShadow = true
      parent.add(mesh)
      return mesh
    }
    // Zit- en rugkussens die van vorm kunnen wisselen (rond/strak)
    function shapedCushion(parent, width, height, depth, radius, color, x, y, cushionZ) {
      const mesh = softCushion(width, height, depth, radius, color, parent)
      mesh.position.set(x, y, cushionZ)
      mesh.userData.sofaCushionIndex = adjustableCushions.length
      adjustableCushions.push({ mesh, width, height, depth, radius })
      return mesh
    }
    function throwPillow(parent, x, y, cushionZ, color, seamColor, tilt, lean = -0.18) {
      const pillow = new THREE.Group()
      pillow.position.set(x, y, cushionZ)
      pillow.rotation.z = lean
      pillow.rotation.x = tilt
      parent.add(pillow)
      const cushion = softCushion(0.26, 0.55, 0.55, 0.12, color, pillow)
      const positions = cushion.geometry.attributes.position
      for (let index = 0; index < positions.count; index++) {
        const px = positions.getX(index)
        const py = positions.getY(index)
        const pz = positions.getZ(index)
        const puff = Math.cos(py / 0.275 * Math.PI / 2) * Math.cos(pz / 0.275 * Math.PI / 2)
        positions.setX(index, px + Math.sign(px) * 0.045 * puff)
      }
      positions.needsUpdate = true
      cushion.geometry.computeVertexNormals()

      // A sewn edge around the middle makes the soft square read as a fabric pillow.
      const seamPoints = []
      for (let step = 0; step < 64; step++) {
        const angle = step / 64 * Math.PI * 2
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        seamPoints.push(new THREE.Vector3(0,
          0.272 * Math.sign(sin) * Math.sqrt(Math.abs(sin)),
          0.272 * Math.sign(cos) * Math.sqrt(Math.abs(cos))))
      }
      const seam = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seamPoints, true), 64, 0.009, 4, true),
        materials[seamColor],
      )
      seam.userData.paletteKey = seamColor
      // Kiest iemand een eigen kussenkleur, dan volgt de naad die kleur (iets donkerder)
      seam.userData.followsPaletteKey = color
      pillow.add(seam)
    }

    // --- Model 1: modern (de oorspronkelijke sofa) ---
    const modern = model('modern')
    box(1.28, 0.3, 3.45, 4.02, 0.3, z, 'darkWood', modern)
    box(1.18, 0.34, 3.3, 3.96, 0.62, z, 'blue', modern)
    box(0.34, 0.82, 3.3, 4.54, 1.12, z, 'blue', modern)
    box(1.16, 0.54, 0.28, 4.02, 0.91, z - 1.55, 'sky', modern)
    box(1.16, 0.54, 0.28, 4.02, 0.91, z + 1.55, 'sky', modern)
    for (const cushionZ of [z - 1.02, z, z + 1.02]) {
      shapedCushion(modern, 1.02, 0.2, 0.94, 0.08, 'sofaSeatCushion', 3.88, 0.87, cushionZ)
      shapedCushion(modern, 0.28, 0.62, 0.96, 0.12, 'sofaBackCushion', 4.32, 1.35, cushionZ)
    }
    throwPillow(modern, 4.04, 1.23, z - 0.65, 'cushionYellow', 'rugGold', -0.12)
    throwPillow(modern, 4.04, 1.23, z + 0.62, 'olive', 'plantGreen', 0.1)
    for (const legZ of [z - 1.38, z + 1.38]) box(0.1, 0.28, 0.1, 3.55, 0.15, legZ, 'darkWood', modern)

    // --- Model 2: chesterfield (opgerolde armen, knoopjes in de rug, bolle pootjes) ---
    const chesterfield = model('chesterfield')
    for (const footX of [3.48, 4.52]) for (const side of [-1, 1]) {
      detailMesh(new THREE.SphereGeometry(0.09, 10, 8), 'darkWood', footX, 0.09, z + side * 1.56, chesterfield)
    }
    box(1.24, 0.58, 3.4, 4.0, 0.46, z, 'blue', chesterfield)
    box(0.34, 0.72, 3.4, 4.5, 1.08, z, 'blue', chesterfield)
    const backRoll = detailMesh(new THREE.CylinderGeometry(0.19, 0.19, 3.44, 18), 'blue', 4.5, 1.42, z, chesterfield)
    backRoll.rotation.x = Math.PI / 2
    for (const side of [-1, 1]) {
      box(1.24, 0.62, 0.34, 4.0, 1.0, z + side * 1.53, 'sky', chesterfield)
      const roll = detailMesh(new THREE.CylinderGeometry(0.21, 0.21, 1.3, 18), 'sky', 3.98, 1.3, z + side * 1.6, chesterfield)
      roll.rotation.z = Math.PI / 2
      const scroll = detailMesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 18), 'blue', 3.32, 1.3, z + side * 1.6, chesterfield)
      scroll.rotation.z = Math.PI / 2
      detailMesh(new THREE.SphereGeometry(0.025, 8, 6), 'darkWood', 3.3, 1.3, z + side * 1.6, chesterfield)
    }
    // Capitonnage: ruitpatroon van knoopjes op de rugleuning
    for (let row = 0; row < 3; row++) for (let column = 0; column < 9; column++) {
      if ((row + column) % 2) continue
      detailMesh(new THREE.SphereGeometry(0.026, 8, 6), 'darkWood', 4.32, 1.0 + row * 0.15, z - 1.2 + column * 0.3, chesterfield).castShadow = false
    }
    for (const cushionZ of [z - 0.9, z, z + 0.9]) {
      shapedCushion(chesterfield, 1.02, 0.22, 0.88, 0.08, 'sofaSeatCushion', 3.9, 0.86, cushionZ)
    }
    // Twee rolkussens tegen de armleuningen
    for (const [side, color] of [[-1, 'cushionYellow'], [1, 'olive']]) {
      const bolster = detailMesh(new THREE.CylinderGeometry(0.13, 0.13, 0.62, 16), color, 3.98, 1.1, z + side * 1.2, chesterfield)
      bolster.rotation.z = Math.PI / 2
      for (const end of [-1, 1]) {
        const cap = rim(0.115, 0.014, 3.98 + end * 0.31, 1.1, z + side * 1.2, color === 'olive' ? 'plantGreen' : 'rugGold', chesterfield)
        cap.rotation.set(0, Math.PI / 2, 0)
        cap.userData.followsPaletteKey = color
      }
    }

    // --- Model 3: retro (houten frame, schuine pootjes, twee dikke kussens) ---
    const retro = model('retro')
    box(1.14, 0.08, 3.34, 3.98, 0.42, z, 'darkWood', retro)
    for (const [legX, tiltX] of [[3.5, 1], [4.46, -1]]) for (const side of [-1, 1]) {
      const leg = detailMesh(new THREE.CylinderGeometry(0.035, 0.018, 0.44, 8), 'darkWood', legX - tiltX * 0.03, 0.2, z + side * 1.58, retro)
      leg.rotation.set(side * 0.16, 0, tiltX * 0.16)
    }
    box(1.1, 0.26, 3.24, 3.98, 0.59, z, 'blue', retro)
    box(0.1, 0.56, 3.24, 4.5, 0.92, z, 'darkWood', retro)
    for (const side of [-1, 1]) {
      const cushionZ = z + side * 0.8
      shapedCushion(retro, 1.02, 0.25, 1.56, 0.1, 'sofaSeatCushion', 3.92, 0.845, cushionZ)
      shapedCushion(retro, 0.22, 0.56, 1.52, 0.12, 'sofaBackCushion', 4.36, 1.18, cushionZ).rotation.z = -0.16
      // Houten armleuning op twee staanders, met een gestoffeerd zijpaneel
      for (const postX of [3.48, 4.44]) box(0.06, 0.42, 0.06, postX, 0.66, z + side * 1.64, 'darkWood', retro)
      box(1.06, 0.05, 0.13, 3.96, 0.9, z + side * 1.64, 'darkWood', retro)
      box(0.92, 0.24, 0.06, 3.98, 0.64, z + side * 1.6, 'sky', retro)
    }
    throwPillow(retro, 4.12, 1.14, z - 1.15, 'cushionYellow', 'rugGold', -0.1, -0.28)
    throwPillow(retro, 4.12, 1.14, z + 1.18, 'olive', 'plantGreen', 0.12, -0.28)

    let activeModel = 'modern'
    function setModel(name) {
      if (!setFurnitureModel('sofa', name)) return false
      activeModel = name
      return true
    }
    setModel('modern')

    function setCushionShape(shape) {
      if (shape !== 'rounded' && shape !== 'square') return false
      adjustableCushions.forEach(({ mesh, width, height, depth, radius }, index) => {
        mesh.geometry.dispose()
        const geometry = shape === 'rounded'
          ? new RoundedBoxGeometry(width, height, depth, 4, radius)
          : new THREE.BoxGeometry(width, height, depth)
        room.traverse(object => {
          if (object.isMesh && object.userData.sofaCushionIndex === index) object.geometry = geometry
        })
      })
      return true
    }
    return { setCushionShape, setModel, getModel: () => activeModel }
  }

  function createPouf() {
    const pouf = getThemeGroup('pouf')
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 9, 6),
      materials.olive,
    )
    mesh.userData.paletteKey = 'olive'
    mesh.position.set(2.05, 0.55, -2.85)
    mesh.scale.set(0.95, 0.76, 1)
    mesh.castShadow = true
    mesh.receiveShadow = true
    pouf.add(mesh)
    rim(0.64, 0.013, 2.05, 0.5, -2.85, 'mustard', pouf)
    detailMesh(new THREE.SphereGeometry(0.06, 10, 6), 'mustard', 2.05, 0.96, -2.85, pouf).scale.y = 0.35
  }

  function createRug() {
    const rug = getThemeGroup('rug')
    // Move toward the right of the room view while staying inside the walls.
    rug.position.z = 0.65
    const x = 2.55
    const z = -0.8
    box(4.5, 0.07, 6.4, x, 0.07, z, 'rugRed', rug)
    box(4.28, 0.018, 6.18, x, 0.116, z, 'rugCoral', rug)
    box(4.0, 0.018, 5.9, x, 0.13, z, 'rugRed', rug)

    for (const side of [-1, 1]) {
      box(3.92, 0.025, 0.045, x, 0.15, z + side * 2.78, 'rugIvory', rug)
      box(3.92, 0.025, 0.045, x, 0.15, z + side * 2.68, 'rugGold', rug)
      box(0.045, 0.025, 5.45, x + side * 1.88, 0.15, z, 'rugIvory', rug)
      box(0.045, 0.025, 5.45, x + side * 1.78, 0.15, z, 'rugGold', rug)
    }

    for (const side of [-1, 1]) for (let thread = 0; thread < 27; thread++) {
      box(0.025, 0.015, 0.18, x - 2.1 + thread * 0.16, 0.06, z + side * 3.26, 'rugIvory', rug)
    }
    const medallion = box(1.18, 0.025, 1.72, x, 0.16, z, 'rugGold', rug)
    medallion.rotation.y = Math.PI / 4
    const medallionCenter = box(0.68, 0.03, 1.0, x, 0.18, z, 'rugIvory', rug)
    medallionCenter.rotation.y = Math.PI / 4
    const centerMark = box(0.3, 0.035, 0.48, x, 0.2, z, 'rugCoral', rug)
    centerMark.rotation.y = Math.PI / 4

  }

  function createSleepingCat() {
    const cat = getThemeGroup('sleepingCat')
    cat.position.set(1.65, 0.145, 1.85)
    cat.rotation.y = -0.45

    const roundedPart = (scale, position, material) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), materials[material])
      mesh.scale.set(...scale)
      mesh.position.set(...position)
      mesh.castShadow = true
      mesh.receiveShadow = true
      cat.add(mesh)
      return mesh
    }

    const breathingBody = new THREE.Group()
    cat.add(breathingBody)
    breathingBody.add(roundedPart([0.58, 0.28, 0.4], [0.05, 0.28, 0], 'catOrange'))
    roundedPart([0.2, 0.08, 0.14], [-0.27, 0.09, 0.33], 'catCream')
    roundedPart([0.18, 0.08, 0.13], [0.02, 0.09, 0.39], 'catCream')
    roundedPart([0.29, 0.23, 0.25], [-0.33, 0.27, 0.24], 'catOrange')

    for (const earX of [-0.52, -0.17]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.23, 3), materials.catOrange)
      ear.position.set(earX, 0.5, 0.21)
      ear.rotation.y = Math.PI / 3
      ear.castShadow = true
      cat.add(ear)
      const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.13, 3), materials.catCream)
      innerEar.position.set(earX, 0.51, 0.255)
      innerEar.rotation.y = Math.PI / 3
      cat.add(innerEar)
    }

    roundedPart([0.14, 0.08, 0.06], [-0.33, 0.21, 0.46], 'catCream')
    box(0.045, 0.03, 0.025, -0.33, 0.245, 0.515, 'catStripe', cat)
    for (const eyeX of [-0.45, -0.22]) {
      const eye = box(0.09, 0.018, 0.025, eyeX, 0.32, 0.46, 'darkWood', cat)
      eye.rotation.z = eyeX < -0.33 ? -0.15 : 0.15
    }
    for (const stripeX of [-0.12, 0.09, 0.3]) {
      const stripe = box(0.065, 0.025, 0.27, stripeX, 0.55 - Math.abs(stripeX) * 0.15, -0.02, 'catStripe', cat)
      stripe.rotation.x = -0.1
      breathingBody.add(stripe.parent)
    }

    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.48, 0.2, -0.12),
      new THREE.Vector3(0.6, 0.12, 0.23),
      new THREE.Vector3(0.36, 0.1, 0.49),
      new THREE.Vector3(0.03, 0.1, 0.54),
      new THREE.Vector3(-0.14, 0.12, 0.47),
    ])
    const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 20, 0.085, 8, false), materials.catOrange)
    tail.castShadow = true
    tail.receiveShadow = true
    cat.add(tail)
    roundedPart([0.09, 0.085, 0.09], [-0.14, 0.12, 0.47], 'catCream')

    for (const side of [-1, 1]) for (let line = 0; line < 2; line++) {
      const whisker = box(0.13, 0.009, 0.012, -0.33 + side * 0.18, 0.22 + line * 0.045, 0.49, 'catCream', cat)
      whisker.rotation.z = side * (line ? 0.18 : -0.18)
    }
    const sleepCanvas = document.createElement('canvas')
    sleepCanvas.width = 96
    sleepCanvas.height = 96
    const context = sleepCanvas.getContext('2d')
    context.font = 'bold 56px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.lineWidth = 6
    context.strokeStyle = PALETTE.catCream
    context.strokeText('z', 48, 48)
    context.fillStyle = PALETTE.darkWood
    context.fillText('z', 48, 48)
    const sleepTexture = new THREE.CanvasTexture(sleepCanvas)
    sleepTexture.colorSpace = THREE.SRGBColorSpace
    sleepTexture.magFilter = THREE.NearestFilter
    sceneTextures.add(sleepTexture)
    const sleepMaterial = new THREE.SpriteMaterial({ map: sleepTexture, depthWrite: false })
    themedMaterials.add(sleepMaterial)
    const sleepLabels = Array.from({ length: 4 }, (_, index) => {
      const label = new THREE.Sprite(sleepMaterial)
      label.position.set(-0.33, 0.85 + index * 0.24, 0.24)
      label.scale.setScalar(0.32)
      cat.add(label)
      return label
    })

    return time => {
      const breath = Math.sin(time * Math.PI * 2 / 3.8)
      breathingBody.scale.y = 1 + breath * 0.09
      breathingBody.scale.z = 1 + breath * 0.025
      sleepLabels.forEach((label, index) => {
        label.position.x = -0.33 + Math.sin(time * 1.4 + index * 0.45) * 0.035
        label.position.y = 0.85 + index * 0.24 + Math.sin(time * 1.4) * 0.04
      })
    }
  }

  function createCoffeeTable() {
    const table = getThemeGroup('coffeeTable')
    const x = 2.05
    const z = -0.15
    const makeCylinder = (radiusTop, radiusBottom, height, y, materialName, segments = 12) => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
        materials[materialName],
      )
      mesh.userData.paletteKey = materialName
      mesh.position.set(x, y, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      table.add(mesh)
    }

    makeCylinder(0.76, 0.76, 0.12, 0.7, 'darkWood')
    makeCylinder(0.69, 0.69, 0.045, 0.783, 'brown')
    rim(0.71, 0.018, x, 0.79, z, 'darkWood', table)
    makeCylinder(0.15, 0.22, 0.5, 0.38, 'darkWood')
    makeCylinder(0.42, 0.42, 0.08, 0.08, 'darkWood')

    createPottedPlant(table, x, 0.806, z, { scale: 1.1, pot: 'terracotta', style: 'cactus' })
  }

  function createKitchen() {
    getThemeGroup('kitchen')
    // Model 1: klassiek (de oorspronkelijke keuken met koelkast waar eten in kan)
    const kitchen = modelGroup('kitchen', 'classic')
    const counterZ = -3.92
    const cabinetCenters = [-3.5, -2.5, -1.5]

    cabinetCenters.forEach(x => {
      box(0.94, 0.72, 0.64, x, 0.42, counterZ, 'kitchenFront', kitchen)
      box(0.86, 0.54, 0.035, x, 0.43, -3.555, 'kitchenFront', kitchen)
      box(0.2, 0.035, 0.05, x + 0.19, 0.6, -3.515, 'kitchenHandle', kitchen)
      for (const side of [-1, 1]) box(0.025, 0.42, 0.015, x + side * 0.36, 0.43, -3.53, 'kitchenHandle', kitchen)
      for (const y of [0.22, 0.64]) box(0.74, 0.025, 0.015, x, y, -3.53, 'kitchenHandle', kitchen)
    })
    box(3.05, 0.14, 0.82, -2.5, 0.86, counterZ, 'kitchenTop', kitchen)

    box(0.72, 0.035, 0.5, -2.55, 0.95, -3.92, 'cream', kitchen)
    box(0.6, 0.012, 0.38, -2.55, 0.974, -3.92, 'darkWood', kitchen)
    detailMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 12), 'cream', -2.55, 0.986, -3.92, kitchen)
    box(0.055, 0.27, 0.055, -2.55, 1.1, -4.16, 'kitchenHandle', kitchen)
    box(0.28, 0.055, 0.055, -2.42, 1.22, -4.16, 'kitchenHandle', kitchen)

    box(0.76, 0.045, 0.62, -1.5, 0.96, counterZ, 'kitchenTop', kitchen)
    for (const x of [-1.7, -1.3]) for (const z of [-4.08, -3.76]) {
      const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.035, 8), materials.cream)
      burner.userData.paletteKey = 'cream'
      burner.position.set(x, 0.985, z)
      burner.castShadow = true
      kitchen.add(burner)
      rim(0.08, 0.012, x, 1.008, z, 'darkWood', kitchen)
    }
    const kitchenLamp = new THREE.Group()
    kitchen.add(kitchenLamp)
    createTableLamp(kitchenLamp, -3.5, 0.93, counterZ)
    kitchenLamp.traverse(object => {
      if (!object.isMesh) return
      const key = object.userData.paletteKey === 'darkWood' ? 'darkWood' : 'cream'
      object.material = materials[key]
      object.userData.paletteKey = key
    })

    box(0.08, 1.9, 0.78, -4.74, 1.0, -3.91, 'kitchenTop', kitchen)
    box(0.08, 1.9, 0.78, -4.06, 1.0, -3.91, 'kitchenTop', kitchen)
    box(0.6, 1.9, 0.08, -4.4, 1.0, -4.26, 'kitchenTop', kitchen)
    box(0.6, 0.08, 0.7, -4.4, 0.09, -3.87, 'kitchenTop', kitchen)
    box(0.6, 0.08, 0.7, -4.4, 1.91, -3.87, 'kitchenTop', kitchen)
    box(0.58, 0.035, 0.62, -4.4, 0.42, -3.9, 'cream', kitchen)
    box(0.58, 0.035, 0.62, -4.4, 1.0, -3.9, 'cream', kitchen)
    box(0.58, 0.035, 0.62, -4.4, 1.58, -3.9, 'cream', kitchen)

    const fridgeDoor = new THREE.Group()
    fridgeDoor.position.set(-4.76, 1.0, -3.51)
    kitchen.add(fridgeDoor)
    box(0.76, 1.9, 0.075, 0.38, 0, 0.015, 'kitchenFront', fridgeDoor)
    box(0.055, 0.34, 0.055, 0.67, 0, 0.07, 'kitchenHandle', fridgeDoor)
    box(0.68, 0.018, 0.012, 0.38, 0.42, 0.06, 'kitchenHandle', fridgeDoor)
    box(0.055, 0.17, 0.055, 0.67, 0.62, 0.07, 'kitchenHandle', fridgeDoor)

    const fridgeContents = new THREE.Group()
    kitchen.add(fridgeContents)
    const foodItems = []
    const foodSlots = [
      [-4.61, 0.62], [-4.4, 0.62], [-4.19, 0.62],
      [-4.61, 1.2], [-4.4, 1.2], [-4.19, 1.2],
    ]

    function storeFoodItem(product) {
      if (foodItems.length >= foodSlots.length) return false
      const [x, y] = foodSlots[foodItems.length]
      const material = new THREE.MeshLambertMaterial({ color: product.color, flatShading: true })
      const geometry = ['Appel', 'Tomaat'].includes(product.name)
        ? new THREE.SphereGeometry(0.095, 7, 5)
        : new THREE.BoxGeometry(0.15, 0.19, 0.14)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x, y, -3.72)
      mesh.castShadow = true
      mesh.receiveShadow = true
      fridgeContents.add(mesh)
      fridgeDoor.rotation.y = -1.15
      foodItems.push({ id: product.id, name: product.name, color: product.color, mesh, material })
      return true
    }

    function takeFoodItem(id) {
      const index = foodItems.findIndex(item => String(item.id) === String(id))
      if (index < 0) return null
      const [item] = foodItems.splice(index, 1)
      fridgeContents.remove(item.mesh)
      item.mesh.geometry.dispose()
      item.material.dispose()
      foodItems.forEach((storedItem, slotIndex) => {
        const [slotX, slotY] = foodSlots[slotIndex]
        storedItem.mesh.position.set(slotX, slotY, -3.72)
      })
      if (foodItems.length === 0) fridgeDoor.rotation.y = 0
      return { id: item.id, name: item.name }
    }

    createSleekKitchen()
    createRetroKitchen()
    setFurnitureModel('kitchen', 'classic')

    return {
      storeFoodItem,
      takeFoodItem,
      getFoodCount: () => foodItems.length,
      getFoodItems: () => foodItems.map(({ id, name, color }) => ({ id, name, color })),
    }
  }

  // Model 2: strak (greeploze donkere fronten, dun licht werkblad, inductieplaat, messing grepen)
  function createSleekKitchen() {
    const sleek = modelGroup('kitchen', 'sleek')
    const z = -3.93
    for (const x of [-3.5, -2.5, -1.5]) {
      box(0.98, 0.76, 0.62, x, 0.44, z, 'kitchenSleek', sleek)
      box(0.6, 0.025, 0.03, x, 0.74, -3.605, 'kitchenSleekHandle', sleek)
    }
    box(2.95, 0.06, 0.55, -2.5, 0.03, -3.96, 'darkGray', sleek)
    box(3.08, 0.05, 0.7, -2.5, 0.845, -3.92, 'kitchenSleekTop', sleek)
    box(0.56, 0.012, 0.38, -2.55, 0.872, -3.94, 'darkGray', sleek)
    detailMesh(new THREE.CylinderGeometry(0.018, 0.022, 0.42, 10), 'kitchenSleekHandle', -2.55, 1.08, -4.14, sleek)
    box(0.03, 0.03, 0.22, -2.55, 1.28, -4.04, 'kitchenSleekHandle', sleek)
    box(0.62, 0.012, 0.5, -1.5, 0.877, -3.92, 'darkGray', sleek)
    for (const x of [-1.66, -1.34]) for (const zz of [-4.04, -3.8]) rim(0.085, 0.006, x, 0.885, zz, 'kitchenSleekTop', sleek)
    box(0.72, 1.98, 0.66, -4.4, 0.99, -3.92, 'kitchenSleek', sleek)
    box(0.7, 0.012, 0.012, -4.4, 1.32, -3.585, 'darkGray', sleek)
    box(0.03, 0.9, 0.035, -4.1, 1.05, -3.57, 'kitchenSleekHandle', sleek)
    createPottedPlant(sleek, -3.55, 0.87, -3.98, { scale: 0.8, pot: 'kitchenSleekTop', style: 'snake' })
  }

  // Model 3: retro (mintgroene kastjes, rode accenten, geblokte tegelwand, ronde koelkast)
  function createRetroKitchen() {
    const retro = modelGroup('kitchen', 'retro')
    const z = -3.92
    for (const x of [-3.5, -2.5]) {
      box(0.94, 0.72, 0.64, x, 0.42, z, 'kitchenRetro', retro)
      box(0.78, 0.5, 0.03, x, 0.44, -3.585, 'kitchenRetroTop', retro)
      box(0.16, 0.035, 0.05, x, 0.62, -3.56, 'chrome', retro)
    }
    box(2.06, 0.03, 0.02, -3.0, 0.8, -3.59, 'kitchenRetroAccent', retro)
    box(2.08, 0.1, 0.78, -3.0, 0.86, z, 'kitchenRetroTop', retro)
    box(2.08, 0.04, 0.02, -3.0, 0.86, -3.52, 'kitchenRetroAccent', retro)
    box(0.6, 0.03, 0.4, -2.55, 0.92, -3.94, 'chrome', retro)
    box(0.5, 0.02, 0.3, -2.55, 0.935, -3.94, 'darkGray', retro)
    detailMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.26, 8), 'chrome', -2.55, 1.04, -4.16, retro)
    box(0.04, 0.04, 0.18, -2.55, 1.16, -4.08, 'chrome', retro)
    for (const side of [-1, 1]) detailMesh(new THREE.SphereGeometry(0.035, 8, 6), 'kitchenRetroAccent', -2.55 + side * 0.1, 0.98, -4.16, retro)
    // Fornuis met ovenraam en knoppen
    box(0.94, 0.86, 0.66, -1.5, 0.43, z, 'kitchenRetroTop', retro)
    box(0.6, 0.34, 0.02, -1.5, 0.4, -3.585, 'darkGray', retro)
    box(0.94, 0.04, 0.02, -1.5, 0.7, -3.585, 'kitchenRetroAccent', retro)
    for (let knob = 0; knob < 4; knob++) {
      const dial = detailMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), 'chrome', -1.77 + knob * 0.18, 0.78, -3.585, retro)
      dial.rotation.x = Math.PI / 2
    }
    for (const x of [-1.7, -1.3]) for (const zz of [-4.08, -3.78]) rim(0.08, 0.016, x, 0.875, zz, 'darkGray', retro)
    box(0.94, 0.3, 0.06, -1.5, 1.02, -4.22, 'kitchenRetroTop', retro)
    // Geblokte tegelwand achter het aanrecht (onder het raam)
    for (let row = 0; row < 3; row++) for (let column = 0; column < 15; column++) {
      box(0.2, 0.15, 0.02, -3.92 + column * 0.2, 0.99 + row * 0.15, -4.33, (row + column) % 2 ? 'kitchenRetroAccent' : 'kitchenRetroTop', retro)
    }
    // Ronde retrokoelkast
    const fridge = new THREE.Mesh(new RoundedBoxGeometry(0.76, 1.84, 0.7, 6, 0.18), materials.kitchenRetro)
    fridge.userData.paletteKey = 'kitchenRetro'
    fridge.position.set(-4.4, 1.0, -3.9)
    fridge.castShadow = true
    fridge.receiveShadow = true
    retro.add(fridge)
    box(0.72, 0.015, 0.015, -4.4, 1.36, -3.548, 'chrome', retro)
    box(0.05, 0.3, 0.06, -4.12, 1.12, -3.53, 'chrome', retro)
    box(0.05, 0.16, 0.06, -4.12, 1.6, -3.53, 'chrome', retro)
    box(0.3, 0.05, 0.015, -4.4, 1.7, -3.548, 'kitchenRetroAccent', retro)
    for (const side of [-1, 1]) detailMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 8), 'chrome', -4.4 + side * 0.26, 0.04, -3.75, retro)
  }

  function createDiningChair(x, z, rotation, upholstery) {
    const chair = new THREE.Group()
    chair.position.set(x, 0, z)
    chair.rotation.y = rotation
    getThemeGroup('dining').add(chair)
    box(0.66, 0.12, 0.66, 0, 0.49, 0, 'darkWood', chair)
    box(0.56, 0.06, 0.56, 0, 0.58, 0, upholstery, chair)
    for (const legX of [-0.24, 0.24]) for (const legZ of [-0.24, 0.24]) {
      box(0.09, 0.46, 0.09, legX, 0.24, legZ, 'darkWood', chair)
    }
    box(0.66, 0.64, 0.11, 0, 0.91, -0.28, 'darkWood', chair)
    box(0.5, 0.45, 0.06, 0, 0.94, -0.19, upholstery, chair)
    for (const side of [-1, 1]) box(0.045, 0.055, 0.48, side * 0.24, 0.22, 0, 'darkWood', chair)
    for (const buttonX of [-0.13, 0.13]) detailMesh(new THREE.SphereGeometry(0.018, 8, 6), 'darkWood', buttonX, 0.97, -0.15, chair)
  }

  function createDiningTable() {
    const dining = getThemeGroup('diningTable')
    const x = -2.35
    const z = -0.9
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.14, 32), materials.darkWood)
    top.userData.paletteKey = 'darkWood'
    top.position.set(x, 0.78, z)
    top.castShadow = true
    top.receiveShadow = true
    dining.add(top)
    rim(0.758, 0.015, x, 0.85, z, 'brown', dining)
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.24, 0.58, 8), materials.darkWood)
    pedestal.userData.paletteKey = 'darkWood'
    pedestal.position.set(x, 0.43, z)
    pedestal.castShadow = true
    dining.add(pedestal)
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 10), materials.darkWood)
    base.userData.paletteKey = 'darkWood'
    base.position.set(x, 0.08, z)
    base.castShadow = true
    dining.add(base)

    createPottedPlant(dining, x, 0.85, z, { scale: 0.95, pot: 'cream', style: 'snake' })

    createDiningChair(x, z - 1.08, 0, 'cream')
    createDiningChair(x, z + 1.08, Math.PI, 'cream')
  }

  function createSideTableLamp() {
    const table = getThemeGroup('sideTable')
    const x = 0.02
    const z = -2.63
    box(0.78, 0.12, 0.68, x, 0.83, z, 'darkWood', table)
    box(0.62, 0.08, 0.52, x, 0.93, z, 'brown', table)
    for (const legX of [-0.26, 0.26]) for (const legZ of [-0.22, 0.22]) box(0.09, 0.74, 0.09, x + legX, 0.41, z + legZ, 'darkWood', table)
    box(0.24, 0.08, 0.24, x, 1.01, z, 'darkWood', table)
    box(0.09, 0.5, 0.09, x, 1.28, z, 'darkWood', table)
    box(0.52, 0.08, 0.52, x, 1.56, z, 'darkWood', table)
    box(0.42, 0.3, 0.42, x, 1.4, z, 'tan', table)
    box(0.24, 0.1, 0.24, x, 1.21, z, 'lampGlow', table)
  }

  function createTVArea() {
    const tv = getThemeGroup('tv')
    const x = 0.15
    const z = -0.15
    box(0.86, 0.36, 2.35, x, 0.32, z, 'darkWood', tv)
    box(0.92, 0.1, 2.48, x, 0.55, z, 'brown', tv)
    box(0.11, 0.24, 0.12, x, 0.7, z - 0.88, 'darkWood', tv)
    box(0.11, 0.24, 0.12, x, 0.7, z + 0.88, 'darkWood', tv)
    box(0.34, 1.12, 1.88, x, 1.34, z, 'darkWood', tv)
    // Keep the visible back panel clear of the casing surface to prevent z-fighting.
    box(0.025, 0.94, 1.62, x - 0.18, 1.34, z, 'brown', tv)
    for (let vent = 0; vent < 8; vent++) box(0.012, 0.025, 0.7, x - 0.198, 1.15 + vent * 0.055, z, 'darkWood', tv)
    for (const screwY of [0.94, 1.74]) for (const screwZ of [-0.7, 0.7]) {
      detailMesh(new THREE.SphereGeometry(0.018, 8, 6), 'darkGray', x - 0.2, screwY, z + screwZ, tv)
    }
    for (const drawerZ of [-0.59, 0.59]) {
      box(0.015, 0.25, 1.02, x - 0.44, 0.32, z + drawerZ, 'brown', tv)
      box(0.025, 0.035, 0.23, x - 0.46, 0.34, z + drawerZ, 'tan', tv)
    }

    for (const side of [1]) {
      const screenFaceX = x + side * 0.18
      box(0.025, 0.91, 1.54, screenFaceX, 1.34, z, 'darkGray', tv)
      const screen = new THREE.Mesh(new THREE.SphereGeometry(0.68, 10, 7), materials.crtGreen)
      screen.position.set(x + side * 0.205, 1.34, z)
      screen.scale.set(0.055, 0.35, 0.7)
      screen.castShadow = true
      tv.add(screen)

      box(0.025, 0.78, 0.2, screenFaceX, 1.34, z - 0.78, 'brown', tv)
      for (let line = 0; line < 4; line++) {
        box(0.035, 0.025, 0.13, x + side * 0.19, 1.08 + line * 0.045, z - 0.78, 'darkGray', tv)
      }
      for (const knobY of [1.52, 1.36]) {
        const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.045, 8), materials.mustard)
        knob.rotation.z = Math.PI / 2
        knob.position.set(x + side * 0.22, knobY, z - 0.78)
        tv.add(knob)
      }
    }

    for (const side of [-1, 1]) {
      const antenna = box(0.035, 0.48, 0.035, x + 0.02, 2.04, z + side * 0.25, 'darkGray', tv)
      antenna.rotation.x = side * 0.48
      box(0.09, 0.06, 0.09, x + 0.02, 2.28, z + side * 0.25, 'darkGray', tv)
    }
  }

  function createCeilingLamp() {
    const lighting = getThemeGroup('lighting')
    const x = 0.6
    const z = 0.18
    box(0.32, 0.08, 0.32, x, 5.13, z, 'darkGray', lighting)
    box(0.055, 1.2, 0.055, x, 4.53, z, 'darkGray', lighting)
    box(0.22, 0.18, 0.22, x, 3.87, z, 'terracotta', lighting)

    const shadeGeometry = new THREE.SphereGeometry(0.62, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)
    const shade = new THREE.Mesh(shadeGeometry, materials.pendantOrange)
    shade.position.set(x, 3.18, z)
    shade.castShadow = true
    shade.receiveShadow = true
    lighting.add(shade)
    rim(0.62, 0.025, x, 3.18, z, 'pendantOrange', lighting)
    detailMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 12), 'darkGray', x, 3.84, z, lighting)

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 4), materials.lampGlow.clone())
    bulb.position.set(x, 3.08, z)
    themedMaterials.add(bulb.material)
    lighting.add(bulb)
    lighting.traverse(object => {
      if (object.isMesh) object.castShadow = false
    })
    return bulb
  }

  function createPlant(x, z, scale = 1, potColor = 'terracotta', leafStyle = 'round', parent = getThemeGroup('plants')) {
    const plant = new THREE.Group()
    plant.position.set(x, 0, z)
    parent.add(plant)
    box(0.46 * scale, 0.34 * scale, 0.46 * scale, 0, 0.17 * scale, 0, potColor, plant)
    box(0.34 * scale, 0.07 * scale, 0.34 * scale, 0, 0.38 * scale, 0, 'darkWood', plant)
    const leafPositions = leafStyle === 'tall'
      ? [[0, 0.92, 0], [-0.22, 0.7, 0.04], [0.22, 0.7, -0.04], [-0.14, 1.18, 0], [0.14, 1.18, 0]]
      : [[0, 0.72, 0], [-0.25, 0.58, 0], [0.25, 0.58, 0], [0, 0.98, -0.12], [0, 0.98, 0.12], [-0.17, 1.18, 0], [0.17, 1.18, 0]]
    leafPositions.forEach(([leafX, leafY, leafZ], index) => {
      const leafSize = (index % 3 === 0 ? 0.3 : 0.24) * scale
      box(leafSize, leafSize * 1.35, leafSize * 0.28, leafX * scale, leafY * scale, leafZ * scale,
        index % 3 === 0 ? 'olive' : 'plantGreen', plant)
    })
  }

  function createBookshelf() {
    const shelf = getThemeGroup('bookshelf')
    box(0.38, 3.55, 2.9, 4.55, 1.8, -2.65, 'darkWood', shelf)
    for (const y of [0.46, 1.28, 2.1, 2.92, 3.54]) box(0.68, 0.12, 3.08, 4.43, y, -2.65, 'brown', shelf)
    const bookRows = [
      [[0.18, 0.34, 'blue'], [0.28, 0.49, 'terracotta'], [0.22, 0.39, 'tan'], [0.34, 0.53, 'olive'], [0.19, 0.31, 'mustard'], [0.3, 0.45, 'brown']],
      [[0.27, 0.46, 'mustard'], [0.2, 0.32, 'olive'], [0.32, 0.54, 'blue'], [0.18, 0.4, 'brown'], [0.29, 0.35, 'terracotta'], [0.24, 0.5, 'tan']],
      [[0.22, 0.52, 'terracotta'], [0.31, 0.36, 'blue'], [0.18, 0.44, 'mustard'], [0.27, 0.3, 'tan'], [0.34, 0.49, 'brown'], [0.2, 0.39, 'olive']],
      [[0.3, 0.38, 'olive'], [0.19, 0.51, 'tan'], [0.28, 0.33, 'brown'], [0.22, 0.47, 'mustard'], [0.32, 0.41, 'blue'], [0.18, 0.55, 'terracotta']],
    ]
    for (let level = 0; level < 4; level++) {
      const baseY = 0.78 + level * 0.82
      let z = -4.08
      for (const [width, height, color] of bookRows[level]) {
        const safeHeight = Math.min(height, level === 3 ? 0.21 : 0.42)
        box(0.12 + width * 0.08, safeHeight, width, 4.18, baseY + safeHeight / 2, z + width / 2, color, shelf)
        z += width + 0.05
      }
      box(0.26, 0.2, 0.28, 4.2, baseY + 0.12, -2.0, level % 2 ? 'mustard' : 'terracotta', shelf)
    }
    createPlant(4.1, -1.34, 0.5, 'terracotta', 'round')
  }

  function createFloatingShelves() {
    const decor = getThemeGroup('wallDecor')
    for (const [x, y, length] of [[1.0, 3.45, 2.55], [2.5, 2.78, 1.65]]) {
      box(length, 0.13, 0.34, x, y, -4.1, 'darkWood', decor)
      box(length - 0.18, 0.06, 0.22, x, y + 0.1, -3.91, 'brown', decor)
    }
    box(0.18, 0.48, 0.2, 0.1, 3.78, -3.9, 'tan', decor)
    box(0.18, 0.34, 0.2, 0.36, 3.71, -3.9, 'blue', decor)
    box(0.23, 0.21, 0.26, 1.55, 3.67, -3.91, 'terracotta', decor)
    box(0.24, 0.24, 0.22, 2.76, 3.04, -3.92, 'mustard', decor)
    // Hangplant staat óp de plank; de ranken vallen over de voorkant naar beneden
    createPottedPlant(decor, 1.98, 3.58, -3.95, { style: 'trailing', trailDirection: new THREE.Vector3(0, 0, 1) })

    box(1.12, 0.025, 0.025, 1.05, 3.38, -3.9, 'darkWood', decor)
    for (let index = 0; index < 5; index++) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), materials.lampGlow)
      bulb.position.set(0.58 + index * 0.23, 3.31 + (index % 2) * 0.025, -3.89)
      bulb.castShadow = true
      decor.add(bulb)
    }
    const stringGlow = new THREE.PointLight(PALETTE.lampGlow, 1.4, 2.2, 2)
    stringGlow.position.set(1.05, 3.34, -3.7)
    decor.add(stringGlow)
  }

  function createRightWallShelves() {
    const decor = getThemeGroup('wallShelves')
    const x = 4.55
    const shelfRows = [
      { y: 2.62, bookBase: 2.7, colors: ['terracotta', 'blue', 'tan', 'olive', 'mustard', 'brown'] },
      { y: 3.48, bookBase: 3.56, colors: ['blue', 'mustard', 'terracotta', 'brown', 'olive', 'tan'] },
    ]

    for (const row of shelfRows) {
      box(0.34, 0.11, 2.45, x, row.y, 0, 'darkWood', decor)
      box(0.28, 0.05, 2.29, x - 0.01, row.y + 0.08, 0, 'brown', decor)
    }
    const shelfTop = row => row.y + 0.105
    createBookRow(decor, { frontX: x - 0.14, baseY: shelfTop(shelfRows[0]), fromZ: -1.1, toZ: 0.55, maxHeight: 0.58, seed: 3, colors: shelfRows[0].colors, stackAt: 9 })
    createBookRow(decor, { frontX: x - 0.14, baseY: shelfTop(shelfRows[1]), fromZ: -1.1, toZ: 0.4, maxHeight: 0.5, seed: 8, colors: shelfRows[1].colors, stackAt: 0 })
    createPottedPlant(decor, x - 0.02, shelfTop(shelfRows[1]), 0.82, { scale: 0.95, style: 'cactus' })
    createPottedPlant(decor, x - 0.02, shelfTop(shelfRows[0]), 0.9, { scale: 0.8, style: 'snake' })
  }

  function createLowBookcase() {
    const shelf = getThemeGroup('bookshelf')
    const x = 4.5
    const z = 2.36
    box(0.56, 0.08, 1.55, x, 0.12, z, 'darkWood', shelf)
    box(0.56, 0.08, 1.55, x, 0.48, z, 'brown', shelf)
    box(0.56, 0.08, 1.55, x, 0.84, z, 'darkWood', shelf)
    box(0.08, 0.78, 1.55, x + 0.24, 0.47, z, 'brown', shelf)
    for (const sideX of [-0.24, 0.24]) {
      for (const sideZ of [-0.72, 0.72]) box(0.08, 0.78, 0.08, x + sideX, 0.47, z + sideZ, 'darkWood', shelf)
    }

    // Boeken passen onder de plank erboven (vrije hoogte ± 0.27)
    createBookRow(shelf, { frontX: x - 0.18, baseY: 0.16, fromZ: z - 0.66, toZ: z + 0.66, maxHeight: 0.255, depth: 0.2, seed: 5, stackAt: 6 })
    createBookRow(shelf, { frontX: x - 0.18, baseY: 0.52, fromZ: z - 0.66, toZ: z + 0.3, maxHeight: 0.25, depth: 0.2, seed: 11 })
    createPottedPlant(shelf, x - 0.06, 0.88, z + 0.47, { scale: 0.85, style: 'snake' })
    createTableLamp(shelf, x, 0.88, z - 0.5)
  }

  function createStaircase() {
    const stairs = getThemeGroup('stairs')
    const startX = 0.18
    const z = 3.82
    const stepCount = 19
    const stepRun = (3.68 - startX) / (stepCount - 1)
    const stepThickness = 0.075
    const stepRise = (5.2 - stepThickness / 2) / stepCount
    const width = 1.12
    const treadDepth = 0.32
    const railZ = z + width / 2 - 0.025
    const railHeight = step => Math.min(5.18, (step + 1) * stepRise + 0.55)

    // The last tread meets a full landing beside the right wall.
    for (let step = 0; step < stepCount; step++) {
      const x = startX + step * stepRun
      const y = (step + 1) * stepRise
      box(treadDepth, stepThickness, width, x, y, z, 'tan', stairs)
      box(0.025, 0.012, width - 0.04, x - treadDepth / 2 + 0.025, y + stepThickness / 2 + 0.006, z, 'darkWood', stairs)
      const postHeight = railHeight(step) - y
      if ((step % 2 === 0 || step === stepCount - 2) && postHeight > 0.1) {
        box(0.035, postHeight, 0.035, x, y + postHeight / 2, railZ, 'darkWood', stairs)
      }
    }

    function beam(from, to, thickness, color) {
      const direction = new THREE.Vector3().subVectors(to, from)
      const center = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5)
      const mesh = detailMesh(new THREE.CylinderGeometry(thickness, thickness, direction.length(), 8),
        color, center.x, center.y, center.z, stairs)
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
    }
    const endX = startX + (stepCount - 1) * stepRun
    for (const side of [-1, 1]) {
      beam(new THREE.Vector3(startX - 0.12, 0.08, z + side * (width / 2 - 0.1)),
        new THREE.Vector3(endX + 0.12, 5.1, z + side * (width / 2 - 0.1)), 0.045, 'darkWood')
    }
    for (let step = 0; step < stepCount - 1; step++) {
      beam(new THREE.Vector3(startX + step * stepRun, railHeight(step), railZ),
        new THREE.Vector3(startX + (step + 1) * stepRun, railHeight(step + 1), railZ), 0.02, 'darkWood')
    }
  }

  let bedroomFurniture = null
  function createUpperFloor() {
    const upstairs = getThemeGroup('upperFloor')
    // The front-right opening leaves the entire staircase clear.
    box(10, 0.16, 7.7, 0, 5.12, -0.65, 'parquetLight', upstairs)
    box(5, 0.16, 1.3, -2.5, 5.12, 3.85, 'parquetLight', upstairs)
    box(10, 3.2, 0.16, 0, 6.8, -4.45, 'bedroomPinkBase', upstairs).userData.upperWall = 'back'
    box(0.16, 3.2, 9, 4.92, 6.8, 0, 'bedroomPinkBase', upstairs).userData.upperWall = 'right'
    box(9.84, 0.12, 0.045, -0.08, 5.26, -4.34, 'cream', upstairs)
    box(0.045, 0.12, 7.55, 4.81, 5.26, -0.6, 'cream', upstairs)
    // A one-metre landing lets you step off and turn into the bedroom.
    const landing = box(1, 0.16, 1.2, 4.34, 5.12, 3.8, 'parquetLight', upstairs)
    landing.name = 'stair-landing'
    for (let post = 0; post < 6; post++) {
      box(0.035, 0.7, 0.035, 0.18 + post * 0.55, 5.55, 3.16, 'darkWood', upstairs)
    }
    box(3.1, 0.045, 0.045, 1.65, 5.91, 3.16, 'darkWood', upstairs)
    for (const x of [3.2, 3.75]) {
      box(0.035, 0.7, 0.035, x, 5.55, 3.16, 'darkWood', upstairs)
    }
    box(0.55, 0.045, 0.045, 3.475, 5.91, 3.16, 'darkWood', upstairs)
    for (const x of [3.86, 4.32, 4.78]) {
      box(0.035, 0.7, 0.035, x, 5.55, 4.38, 'darkWood', upstairs)
    }
    box(0.98, 0.045, 0.045, 4.32, 5.91, 4.38, 'darkWood', upstairs)
    // Reling langs de linkerrand van het trapgat (boven het begin van de trap), anders kan je er zo af
    for (const z of [3.6, 4.02, 4.44]) box(0.035, 0.7, 0.035, 0.04, 5.55, z, 'darkWood', upstairs)
    box(0.035, 0.7, 0.035, 0.04, 5.55, 3.16, 'darkWood', upstairs)
    box(0.045, 0.045, 1.33, 0.04, 5.91, 3.8, 'darkWood', upstairs)
    box(0.18, 0.045, 0.045, 0.11, 5.91, 3.16, 'darkWood', upstairs)
    bedroomFurniture = createBedroom(upstairs, materials)
  }

  function createWallArt() {
    const decor = getThemeGroup('wallDecor')
    const art = [
      [-0.25, 3.18, 'terracotta', 'mustard'],
      [0.68, 3.18, 'blue', 'plantGreen'],
      [1.62, 3.18, 'tan', 'terracotta'],
    ]
    art.forEach(([x, y, background, detail]) => {
      box(0.74, 0.67, 0.1, x, y, -4.25, 'darkWood', decor)
      box(0.56, 0.49, 0.025, x, y, -4.17, background, decor)
      box(0.24, 0.13, 0.02, x - 0.09, y - 0.09, -4.14, detail, decor)
      box(0.12, 0.26, 0.02, x + 0.12, y + 0.02, -4.14, detail, decor)
    })
  }

  function createTVPlants() {
    createPlant(-4.22, -0.1, 0.72, 'terracotta', 'tall')
    createPlant(3.0, 2.5, 0.88, 'terracotta', 'tall')
    createPlant(3.86, 1.6, 1.02, 'tan', 'round')
  }

  function createAnimatedMan() {
    const root = new THREE.Group()
    room.add(root)
    const showerPixelation = new THREE.Group()
    themeGroups.get('upperFloor').add(showerPixelation)
    const pixelColors = [materials.darkGray, materials.blue, materials.sky, materials.white, materials.cream]
    const pixelRowWidths = [3, 3, 5, 5, 5, 7, 7, 7, 7, 7, 7, 5, 5, 5, 3, 3, 3, 3]
    for (let row = 0; row < pixelRowWidths.length; row++) {
      const width = pixelRowWidths[row]
      for (let column = 0; column < width; column++) {
        if (row < 4 && width === 5 && column === 2) continue
        const size = 0.105 + ((row * 3 + column * 5) % 4) * 0.012
        const pixel = new THREE.Mesh(new THREE.BoxGeometry(size, size, 0.14),
          pixelColors[(row * 7 + column * 11) % pixelColors.length])
        pixel.position.set((column - (width - 1) / 2) * 0.14, -1.19 + row * 0.14, 0)
        pixel.castShadow = false
        pixel.receiveShadow = false
        showerPixelation.add(pixel)
      }
    }
    const upperBody = new THREE.Group()
    root.add(upperBody)
    const characterMaterial = Object.fromEntries([
      'skin', 'skinShade', 'curlyHair', 'hairLight', 'shirt', 'shirtDark', 'tee', 'pants', 'denim', 'denimLight',
      'belt', 'buckle', 'shoes', 'white', 'lace', 'eye', 'mouth', 'cheek', 'darkGray',
    ].map(name => [name, materials[name]]))

    function addBox(parent, width, height, depth, x, y, z, materialName) {
      const radius = Math.min(0.045, Math.min(width, height, depth) * 0.2)
      const mesh = new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 2, radius), characterMaterial[materialName])
      mesh.position.set(x, y, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      parent.add(mesh)
      return mesh
    }

    function addBall(parent, radius, x, y, z, materialName, scale = [1, 1, 1]) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 8, 6), characterMaterial[materialName])
      mesh.position.set(x, y, z)
      mesh.scale.set(...scale)
      mesh.castShadow = true
      parent.add(mesh)
      return mesh
    }

    // Krul in twee tinten: donkere basis met een lichter toplaagje voor diepte
    function addCurl(parent, x, y, z, size = 0.09, light = false) {
      addBall(parent, size, x, y, z, light ? 'hairLight' : 'curlyHair')
    }

    // --- Romp: open overhemd over een T-shirt, riem en jeans ---
    addBox(upperBody, 0.5, 0.56, 0.3, 0, 1.16, -0.01, 'shirt')
    addBox(upperBody, 0.15, 0.5, 0.02, 0, 1.17, 0.145, 'tee')
    for (const side of [-1, 1]) {
      // Omgeslagen kraag en de rand van het open hemd
      const lapel = addBox(upperBody, 0.09, 0.16, 0.03, side * 0.085, 1.38, 0.145, 'shirtDark')
      lapel.rotation.z = side * 0.35
      addBox(upperBody, 0.025, 0.42, 0.02, side * 0.085, 1.12, 0.152, 'shirtDark')
    }
    addBox(upperBody, 0.1, 0.09, 0.02, -0.16, 1.27, 0.152, 'shirtDark')
    addBox(upperBody, 0.1, 0.02, 0.022, -0.16, 1.31, 0.155, 'shirt')
    addBox(upperBody, 0.51, 0.04, 0.31, 0, 0.9, -0.01, 'shirtDark')
    addBox(upperBody, 0.42, 0.06, 0.29, 0, 0.87, 0, 'belt')
    addBox(upperBody, 0.07, 0.05, 0.02, 0, 0.87, 0.148, 'buckle')
    addBox(upperBody, 0.4, 0.17, 0.28, 0, 0.77, 0, 'denim')
    addBox(upperBody, 0.16, 0.2, 0.16, 0, 1.51, 0, 'skin')

    // --- Hoofd ---
    const head = new THREE.Group()
    head.position.set(0, 1.79, 0)
    upperBody.add(head)
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), characterMaterial.skin)
    face.castShadow = true
    head.add(face)
    for (const side of [-1, 1]) {
      addBall(head, 0.04, side * 0.2, -0.01, 0, 'skin', [0.6, 1, 0.9])
      // Ogen met een lichtpuntje, wenkbrauwen en blosjes
      addBox(head, 0.038, 0.05, 0.025, side * 0.068, 0.015, 0.177, 'eye')
      addBox(head, 0.012, 0.012, 0.01, side * 0.068 + 0.01, 0.028, 0.19, 'white')
      const brow = addBox(head, 0.075, 0.018, 0.02, side * 0.072, 0.082, 0.165, 'curlyHair')
      brow.rotation.z = side * -0.12
      addBall(head, 0.034, side * 0.11, -0.045, 0.155, 'cheek', [1, 0.7, 0.35])
    }
    addBox(head, 0.032, 0.045, 0.03, 0, -0.02, 0.192, 'skinShade')
    const smile = addBox(head, 0.075, 0.02, 0.02, 0, -0.08, 0.178, 'mouth')
    smile.scale.y = 0.9
    for (const side of [-1, 1]) {
      const corner = addBox(head, 0.02, 0.02, 0.02, side * 0.042, -0.072, 0.175, 'mouth')
      corner.rotation.z = side * 0.6
    }

    // --- Haar: volle schouderlange krullen, pony hoog zodat het gezicht vrij blijft ---
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.235, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.58), characterMaterial.curlyHair)
    hairCap.position.set(0, 0.035, -0.02)
    hairCap.rotation.x = -0.75 // voorkant hoger: haarlijn boven de wenkbrauwen, achteraan lager
    hairCap.castShadow = true
    head.add(hairCap)
    for (const [x, y, z, size, light] of [
      // pony en kruin
      [-0.15, 0.17, 0.1, 0.08, true], [-0.06, 0.2, 0.13, 0.08], [0.04, 0.21, 0.13, 0.085, true], [0.13, 0.18, 0.1, 0.08],
      [-0.1, 0.27, 0.02, 0.1], [0.02, 0.29, 0.0, 0.1, true], [0.13, 0.26, 0.02, 0.095], [-0.18, 0.2, 0.0, 0.09, true], [0.2, 0.18, 0.0, 0.09],
      [-0.06, 0.28, -0.12, 0.1, true], [0.08, 0.27, -0.13, 0.1],
      // achterkant
      [-0.15, 0.13, -0.17, 0.1], [0, 0.15, -0.21, 0.11, true], [0.15, 0.13, -0.17, 0.1],
      [-0.17, -0.03, -0.17, 0.1, true], [0, -0.02, -0.23, 0.11], [0.17, -0.03, -0.17, 0.1, true],
      [-0.16, -0.2, -0.14, 0.1], [0, -0.2, -0.2, 0.11, true], [0.16, -0.2, -0.14, 0.1],
      [-0.14, -0.37, -0.1, 0.095, true], [0, -0.38, -0.15, 0.1], [0.14, -0.37, -0.1, 0.095, true],
      [-0.1, -0.5, -0.1, 0.085], [0.05, -0.51, -0.12, 0.085, true], [0.13, -0.49, -0.08, 0.08],
    ]) addCurl(head, x, y, z, size, light)
    for (const side of [-1, 1]) {
      // Krullen langs het gezicht tot op de schouders
      for (const [index, y] of [0.08, -0.07, -0.22, -0.37, -0.5].entries()) {
        addCurl(head, side * (0.205 + index * 0.012), y, 0.03 - index * 0.012, 0.085, index % 2 === 0)
        addCurl(head, side * (0.15 + index * 0.014), y - 0.06, -0.07, 0.08, index % 2 === 1)
      }
    }

    // --- Armen: mouwen met omgerolde manchet ---
    const arms = []
    const remote = new THREE.Group()
    for (const side of [-1, 1]) {
      const arm = new THREE.Group()
      arm.position.set(side * 0.29, 1.4, 0)
      upperBody.add(arm)
      addBox(arm, 0.17, 0.3, 0.17, 0, -0.15, 0, 'shirt')
      addBox(arm, 0.18, 0.07, 0.18, 0, -0.31, 0.005, 'shirtDark')
      addBox(arm, 0.12, 0.26, 0.12, 0, -0.45, 0.02, 'skin')
      addBox(arm, 0.13, 0.12, 0.13, 0, -0.6, 0.04, 'skin')
      addBox(arm, 0.04, 0.07, 0.05, side * -0.06, -0.58, 0.08, 'skin')
      arms.push(arm)
      if (side === 1) {
        addBox(arm, 0.06, 0.14, 0.04, 0, -0.55, 0.15, 'darkGray')
        remote.userData.mesh = arm.children[arm.children.length - 1]
        remote.userData.mesh.name = 'remote'
      }
    }

    // --- Benen: jeans met omslag en sneakers met witte zool en veters ---
    const legs = []
    const shoes = []
    for (const side of [-1, 1]) {
      const thigh = new THREE.Group()
      thigh.position.x = side * 0.16
      root.add(thigh)
      addBox(thigh, 0.18, 0.42, 0.18, 0, -0.21, 0, 'denim')
      addBox(thigh, 0.005, 0.36, 0.01, side * 0.09, -0.21, 0, 'denimLight')
      const knee = new THREE.Group()
      knee.position.y = -0.42
      thigh.add(knee)
      addBox(knee, 0.16, 0.36, 0.16, 0, -0.18, 0, 'denim')
      addBox(knee, 0.175, 0.06, 0.175, 0, -0.33, 0, 'denimLight')
      addBox(knee, 0.19, 0.1, 0.28, 0, -0.42, 0.06, 'shoes')
      addBox(knee, 0.17, 0.05, 0.08, 0, -0.43, 0.19, 'white')
      for (let lace = 0; lace < 3; lace++) addBox(knee, 0.09, 0.012, 0.02, 0, -0.365, 0.11 + lace * 0.035, 'lace')
      shoes.push(addBox(knee, 0.21, 0.04, 0.31, 0, -0.47, 0.06, 'white'))
      legs.push({ thigh, knee })
    }

    let foodLevel = 78
    let previousUpdateTime = null

    const chairSeat = [-3.4, 3.02]
    const sofaSeat = [3.55, -0.15]
    const route = [
      [-3.4, 2.35], [-4.4, 1.55], [0.97, 1.55], [0.97, -3.9],
      [3, -3.9], [3, -2.25],
    ]
    const stairFlight = [
      [0.18, 0, 3.82], [0.8, 0.9, 3.82], [1.5, 1.9, 3.82],
      [2.25, 3, 3.82], [3, 4.1, 3.82], [3.68, 5.2, 3.82],
    ]
    const walkToStairs = [[-3.4, 0, 3.02], [-3.4, 0, 2.25], [0.18, 0, 2.25], [0.18, 0, 3.82]]
    const walkUpstairs = [...stairFlight, [4.34, 5.2, 3.82], [4.34, 5.2, 2.8]]
    const walkToShower = [[4.34, 5.2, 2.8], [3.35, 5.2, 2.8], [3.35, 5.2, -1.9], [3.9, 5.2, -2.4], [3.9, 5.2, -3.35]]
    const walkToMirror = [[3.9, 5.2, -3.35], [3.9, 5.2, -2.4], [3.35, 5.2, -1.9], [3.35, 5.2, -0.75]]
    const walkToBed = [[3.35, 5.2, -0.75], [1.5, 5.2, -0.75], [1.5, 5.2, -0.2], [-0.9, 5.2, -0.2]]
    const walkToLanding = [[-0.9, 5.2, -0.2], [1.2, 5.2, -0.2], [1.2, 5.2, 2.7], [4.34, 5.2, 2.7], [4.34, 5.2, 3.82]]
    const walkDownstairs = [[4.34, 5.2, 3.82], ...[...stairFlight].reverse()]
    const walkToChair = [...walkToStairs].reverse()
    const smoothStep = amount => {
      const value = THREE.MathUtils.clamp(amount, 0, 1)
      return value * value * (3 - 2 * value)
    }
    const headingBetween = (from, to) => Math.atan2(to[0] - from[0], to[1] - from[1])
    const headingBetween3D = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2])
    const shortestAngle = (from, to, amount) => from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * amount

    function getWalkPose(progress, returning) {
      const points = returning ? [...route].reverse() : route
      const lengths = points.slice(1).map((point, index) =>
        Math.hypot(point[0] - points[index][0], point[1] - points[index][1]))
      const totalLength = lengths.reduce((total, length) => total + length, 0)
      let distance = THREE.MathUtils.clamp(progress, 0, 1) * totalLength
      let segment = 0
      while (segment < lengths.length - 1 && distance > lengths[segment]) {
        distance -= lengths[segment]
        segment++
      }
      const local = distance / lengths[segment]
      const from = points[segment]
      const to = points[segment + 1]
      let yaw = headingBetween(from, to)
      if (segment < points.length - 2 && local > 0.65) {
        const nextYaw = headingBetween(to, points[segment + 2])
        yaw = shortestAngle(yaw, nextYaw, smoothStep((local - 0.65) / 0.35))
      }
      return {
        x: THREE.MathUtils.lerp(from[0], to[0], local),
        z: THREE.MathUtils.lerp(from[1], to[1], local),
        yaw,
      }
    }

    function getPathPose(points, progress) {
      const lengths = points.slice(1).map((point, index) =>
        Math.hypot(point[0] - points[index][0], point[1] - points[index][1], point[2] - points[index][2]))
      const totalLength = lengths.reduce((total, length) => total + length, 0)
      let distance = THREE.MathUtils.clamp(progress, 0, 1) * totalLength
      let segment = 0
      while (segment < lengths.length - 1 && distance > lengths[segment]) {
        distance -= lengths[segment]
        segment++
      }
      const local = distance / lengths[segment]
      const from = points[segment]
      const to = points[segment + 1]
      let yaw = headingBetween3D(from, to)
      if (segment < points.length - 2 && local > 0.65) {
        yaw = shortestAngle(yaw, headingBetween3D(to, points[segment + 2]), smoothStep((local - 0.65) / 0.35))
      }
      return {
        x: THREE.MathUtils.lerp(from[0], to[0], local),
        y: THREE.MathUtils.lerp(from[1], to[1], local),
        z: THREE.MathUtils.lerp(from[2], to[2], local),
        yaw,
      }
    }

    function update(time, working = false) {
      if (previousUpdateTime !== null) foodLevel = Math.max(10, foodLevel - (time - previousUpdateTime) * 0.07)
      previousUpdateTime = time
      const phase = working ? 0 : time % 86
      let x
      let z
      let yaw
      let sit
      let seatHeight
      let floorY = 0
      let lyingAngle = 0
      let action
      let entertainment

      if (phase < 7) {
        x = chairSeat[0]; z = chairSeat[1]; yaw = 0; sit = 1; seatHeight = 0.89; action = 'computer'
        entertainment = 68 - phase * 2
      } else if (phase < 14.5) {
        const progress = (phase - 7) / 7.5
        const standUp = smoothStep(progress / 0.08)
        const walkProgress = THREE.MathUtils.clamp((progress - 0.08) / 0.92, 0, 1)
        const pose = getWalkPose(walkProgress, false)
        sit = 1 - standUp
        x = THREE.MathUtils.lerp(chairSeat[0], pose.x, standUp)
        z = THREE.MathUtils.lerp(chairSeat[1], pose.z, standUp)
        yaw = shortestAngle(0, pose.yaw, standUp)
        seatHeight = 0.89 * sit
        action = standUp < 1 ? 'computer' : 'walk'
        entertainment = 54 + progress * 6
      } else if (phase < 23) {
        const sitDown = smoothStep((phase - 14.5) / 1.4)
        x = THREE.MathUtils.lerp(route[route.length - 1][0], sofaSeat[0], sitDown)
        z = THREE.MathUtils.lerp(route[route.length - 1][1], sofaSeat[1], sitDown)
        yaw = shortestAngle(headingBetween(route[route.length - 2], route[route.length - 1]), -Math.PI / 2, sitDown)
        sit = sitDown
        seatHeight = 0.97 * sitDown
        action = 'television'
        entertainment = 60 + ((phase - 14.5) / 8.5) * 38
      } else if (phase < 31) {
        const progress = (phase - 23) / 8
        const standUp = smoothStep(progress / 0.12)
        const walkProgress = THREE.MathUtils.clamp((progress - 0.12) / 0.78, 0, 1)
        const chairSit = smoothStep((progress - 0.9) / 0.1)
        const pose = getWalkPose(walkProgress, true)
        sit = Math.max(1 - standUp, chairSit)
        x = THREE.MathUtils.lerp(sofaSeat[0], pose.x, standUp)
        z = THREE.MathUtils.lerp(sofaSeat[1], pose.z, standUp)
        yaw = shortestAngle(-Math.PI / 2, pose.yaw, standUp)
        x = THREE.MathUtils.lerp(x, chairSeat[0], chairSit)
        z = THREE.MathUtils.lerp(z, chairSeat[1], chairSit)
        yaw = shortestAngle(yaw, 0, chairSit)
        seatHeight = THREE.MathUtils.lerp(0.97, 0.89, walkProgress) * sit
        action = standUp < 1 ? 'television' : chairSit > 0 ? 'computer' : 'walk'
        entertainment = 98 - progress * 30
      } else if (phase < 35) {
        const progress = (phase - 31) / 4
        const standUp = smoothStep(progress / 0.18)
        const pose = getPathPose(walkToStairs, progress)
        x = pose.x; z = pose.z; floorY = pose.y; yaw = shortestAngle(0, pose.yaw, standUp)
        sit = 1 - standUp; seatHeight = THREE.MathUtils.lerp(0.89, 0.58, standUp)
        action = standUp < 1 ? 'computer' : 'walk'
        entertainment = 58
      } else if (phase < 41) {
        const pose = getPathPose(walkUpstairs, (phase - 35) / 6)
        x = pose.x; z = pose.z; floorY = pose.y; yaw = pose.yaw
        sit = 0; seatHeight = 0; action = 'walk'; entertainment = 62
      } else if (phase < 44) {
        const pose = getPathPose(walkToShower, (phase - 41) / 3)
        x = pose.x; z = pose.z; floorY = pose.y; yaw = pose.yaw
        sit = 0; seatHeight = 0; action = 'walk'; entertainment = 64
      } else if (phase < 50) {
        x = 3.9; z = -3.35; floorY = 5.34; yaw = 0
        sit = 0; seatHeight = 0.58; action = 'shower'; entertainment = 68
      } else if (phase < 53) {
        const pose = getPathPose(walkToMirror, (phase - 50) / 3)
        x = pose.x; z = pose.z; floorY = pose.y; yaw = pose.yaw
        sit = 0; seatHeight = 0; action = 'walk'; entertainment = 70
      } else if (phase < 58) {
        x = 3.35; z = -0.75; floorY = 5.2; yaw = Math.PI / 2
        sit = 0; seatHeight = 0.58; action = 'makeup'; entertainment = 78
      } else if (phase < 60.5) {
        const pose = getPathPose(walkToBed, (phase - 58) / 2.5)
        x = pose.x; z = pose.z; floorY = pose.y; yaw = pose.yaw
        sit = 0; seatHeight = 0; action = 'walk'; entertainment = 78
      } else if (phase < 61.5) {
        const progress = smoothStep(phase - 60.5)
        x = -0.9; z = THREE.MathUtils.lerp(-0.2, -1.85, progress); floorY = 5.2; yaw = 0
        sit = 0; seatHeight = THREE.MathUtils.lerp(0.58, 0.8, progress)
        lyingAngle = -Math.PI / 2 * progress
        action = 'sleep'; entertainment = 82
      } else if (phase < 69) {
        x = -0.9; z = -1.85; floorY = 5.2; yaw = 0
        sit = 0; seatHeight = 0.8; action = 'sleep'; lyingAngle = -Math.PI / 2
        entertainment = 86
      } else if (phase < 70) {
        const wake = smoothStep(phase - 69)
        x = -0.9; z = THREE.MathUtils.lerp(-1.85, -0.2, wake); floorY = 5.2; yaw = 0
        sit = 0; seatHeight = THREE.MathUtils.lerp(0.8, 0.58, wake)
        lyingAngle = THREE.MathUtils.lerp(-Math.PI / 2, 0, wake)
        action = wake < 1 ? 'sleep' : 'walk'; entertainment = 82
      } else if (phase < 74) {
        const pose = getPathPose(walkToLanding, (phase - 70) / 4)
        x = pose.x; z = pose.z; floorY = pose.y; yaw = pose.yaw
        sit = 0; seatHeight = 0; action = 'walk'; entertainment = 72
      } else if (phase < 80) {
        const pose = getPathPose(walkDownstairs, (phase - 74) / 6)
        x = pose.x; z = pose.z; floorY = pose.y; yaw = pose.yaw
        sit = 0; seatHeight = 0; action = 'walk'; entertainment = 68
      } else if (phase < 85) {
        const pose = getPathPose(walkToChair, (phase - 80) / 5)
        x = pose.x; z = pose.z; floorY = pose.y; yaw = pose.yaw
        sit = 0; seatHeight = 0; action = 'walk'; entertainment = 64
      } else {
        const sitDown = smoothStep(phase - 85)
        x = chairSeat[0]; z = chairSeat[1]; yaw = 0
        sit = sitDown; seatHeight = THREE.MathUtils.lerp(0.58, 0.89, sitDown)
        action = 'computer'; entertainment = 64
      }

      root.position.set(x, floorY + seatHeight, z)
      root.rotation.set(lyingAngle, yaw, 0)
      root.visible = action !== 'shower' && activeFloor === (floorY >= 2.6 ? 1 : 0)
      showerPixelation.visible = action === 'shower'
      showerPixelation.position.set(x, root.position.y + 1.08, z + 0.82)
      showerPixelation.rotation.y = Math.atan2(camera.position.x - x, camera.position.z - (z + 0.82))
      upperBody.position.y = action === 'sleep' ? 0 : -0.7 * sit + Math.abs(Math.sin(time * 9)) * 0.035 * (1 - sit)
      arms.forEach((arm, index) => {
        const swing = Math.sin(time * 8 + index * Math.PI) * 0.42 * (1 - sit)
        const typing = Math.sin(time * 15 + index * 1.7) * 0.07
        arm.rotation.x = action === 'computer' ? -0.9 + typing
          : action === 'television' ? 0.18
            : action === 'makeup' ? (index === 0 ? -1.05 + Math.sin(time * 5) * 0.1 : -0.35)
              : action === 'sleep' ? 0 : swing
        arm.rotation.z = action === 'makeup' ? (index === 0 ? -0.12 : 0.12) : 0
      })
      remote.userData.mesh.visible = action === 'television'
      legs.forEach(({ thigh, knee }, index) => {
        const stride = action === 'walk' ? Math.sin(time * 8 + index * Math.PI) * 0.38 : 0
        thigh.position.y = 0.78 * (1 - sit)
        thigh.rotation.x = -Math.PI / 2 * sit + stride
        const seatedKneeBend = action === 'computer' ? 0.4 : action === 'television' ? 0.05 : 0
        knee.rotation.x = (Math.PI / 2 + seatedKneeBend) * sit + Math.max(0, stride) * 0.45
      })
      if (action === 'walk' && sit < 0.02) {
        root.updateMatrixWorld(true)
        let lowestShoeY = Infinity
        for (const shoe of shoes) {
          lowestShoeY = Math.min(lowestShoeY, new THREE.Box3().setFromObject(shoe).min.y)
        }
        root.position.y += floorY + 0.032 - lowestShoeY
      }

      const food = Math.round(foodLevel)
      const happy = Math.round((food + entertainment) / 2)
      onMoodUpdate({ happy, food, entertainment: Math.round(entertainment), foodCount: kitchen.getFoodCount() })
    }

    function feed() {
      foodLevel = Math.min(100, foodLevel + 28)
    }

    return { root, update, feed }
  }

  function refineRoomObjects() {
    const structuralGroups = new Set(['floor', 'walls', 'rug', 'upperFloor'])
    const oldGeometries = new Set()
    for (const [name, group] of themeGroups) {
      if (structuralGroups.has(name)) continue
      const objects = []
      group.traverse(object => { if (object.isMesh && object.geometry.type === 'BoxGeometry') objects.push(object) })
      for (const object of objects) {
        if (object.userData.keepShape) continue
        const { width, height, depth } = object.geometry.parameters
        const key = object.userData.paletteKey
        const isLeaf = ['olive', 'plantGreen'].includes(key) && width <= 0.35 && height <= 0.5 && depth <= 0.09 && width > 0.09
        const isPot = ['terracotta', 'cream'].includes(key) && width >= 0.24 && width <= 0.46 && height >= 0.2 && height <= 0.34 && Math.abs(width - depth) < 0.06
        if (isLeaf) {
          oldGeometries.add(object.geometry)
          object.geometry = new THREE.SphereGeometry(0.5, 10, 6)
          object.geometry.scale(width, height, depth)
          const vein = detailMesh(new THREE.CylinderGeometry(0.005, 0.005, height * 0.7, 5), 'plantGreen', 0, 0, depth * 0.48, object)
          vein.castShadow = false
        } else if (key === 'darkWood' && width >= 0.19 && width <= 0.35 && height <= 0.07 && Math.abs(width - depth) < 0.025 && object.position.x === 0 && object.position.z === 0) {
          oldGeometries.add(object.geometry)
          object.geometry = new THREE.CylinderGeometry(width / 2, width / 2, height, 16)
        } else if (isPot) {
          oldGeometries.add(object.geometry)
          object.geometry = new THREE.CylinderGeometry(width / 2, width * 0.36, height, 16)
          rim(width / 2, 0.014, 0, height / 2, 0, key, object)
        } else if (Math.min(width, height, depth) >= 0.055 && Math.max(width, height, depth) < 3.6) {
          oldGeometries.add(object.geometry)
          object.geometry = new RoundedBoxGeometry(width, height, depth, 2, Math.min(0.045, Math.min(width, height, depth) * 0.22))
        }
      }
    }
    oldGeometries.forEach(geometry => geometry.dispose())
  }

  createRoomShell()
  createRug()
  const updateSleepingCat = createSleepingCat()
  const setWindowNight = createWindow()
  const kitchen = createKitchen()
  createDiningTable()
  createDeskArea()
  createTVArea()
  const sofaControls = createSectionalSofa()
  createPouf()
  createCoffeeTable()
  createLowBookcase()
  createStaircase()
  createUpperFloor()
  createFloatingShelves()
  createRightWallShelves()
  const man = createAnimatedMan()
  const ceilingBulb = createCeilingLamp()
  refineRoomObjects()
  // Slaapkamermeubels (bed, douche, make-uptafel) zitten in de bovenverdieping-groep, zodat ze mee
  // vervagen met de verdiepingen. Hier maken we ze aanpasbaar zoals de meubels beneden.
  for (const [item, group] of Object.entries(bedroomFurniture?.groups ?? {})) {
    themeGroups.set(item, group)
    for (const child of group.children) {
      if (!child.userData.modelOf) continue
      if (!furnitureModels.has(item)) furnitureModels.set(item, new Set())
      furnitureModels.get(item).add(child.userData.modelName)
    }
  }
  setFurnitureModel('bed', 'cozy')
  setFurnitureModel('shower', 'glass')
  setFurnitureModel('dresser', 'classic')

  let activeFloor = 0
  let displayedFloorHeight = 0
  let floorTransition = null
  let cameraTransition = null
  let sofaReturnView = null
  let showOtherFloor = true
  let upperFloorOpacity = 0
  const wallFades = { back: [], right: [], stairs: [], upperFloor: [] }
  const wallFadeState = { back: 1, right: 1, stairs: 1, upperFloor: 1 }
  const wallFadeNormals = { back: new THREE.Vector3(0, 0, 1), right: new THREE.Vector3(-1, 0, 0), stairs: new THREE.Vector3(0, 0, -1), upperFloor: new THREE.Vector3(0, -1, 0) }
  const wallFadePosition = new THREE.Vector3()
  const viewDirection = new THREE.Vector3()
  function getUpperFloorOpacity(floor = activeFloor) {
    if (floor === 1) return 1
    if (sofaReturnView) return 0
    return showOtherFloor ? FLOOR_PREVIEW_OPACITY : 0
  }

  scene.add(room)
  scene.updateMatrixWorld(true)
  ;['walls', 'window', 'wallDecor', 'bookshelf', 'stairs', 'upperFloor'].forEach(groupName => {
    themeGroups.get(groupName)?.traverse(object => {
      if (!object.isMesh) return
      object.getWorldPosition(wallFadePosition)
      let side = null
      if (groupName === 'upperFloor') side = 'upperFloor'
      else if (groupName === 'stairs') side = 'stairs'
      else if (groupName === 'walls') side = object.userData.wallSide ?? (wallFadePosition.z < -4 ? 'back' : 'right')
      else if (wallFadePosition.y > 1.6 && wallFadePosition.z < -3.7) side = 'back'
      else if (wallFadePosition.y > 1.6 && wallFadePosition.x > 4.2) side = 'right'
      if (!side) return
      object.material = object.material.clone()
      themedMaterials.add(object.material)
      wallFades[side].push(object)
    })
  })

  const lowerFloorMeshes = []
  const fadingMeshes = new Set(Object.values(wallFades).flat())
  for (const child of room.children) {
    if (child === themeGroups.get('upperFloor') || child === man.root) continue
    child.traverse(object => {
      if ((!object.isMesh && !object.isSprite) || fadingMeshes.has(object)) return
      object.material = object.material.clone()
      themedMaterials.add(object.material)
      lowerFloorMeshes.push({
        object,
        opacity: object.material.opacity,
        transparent: object.material.transparent,
        depthWrite: object.material.depthWrite,
        castShadow: object.castShadow,
      })
    })
  }

  const hoverTargets = ['sofa', 'kitchen', 'desk', 'bed', 'shower', 'dresser'].map(name => ({
    name,
    group: themeGroups.get(name),
    highlights: [],
  }))
  const hoverOutlineMaterial = new THREE.MeshBasicMaterial({
    color: PALETTE.white, side: THREE.BackSide, transparent: true, opacity: 0.92,
    depthWrite: false, toneMapped: false,
  })
  themedMaterials.add(hoverOutlineMaterial)
  function createHoverHighlight(target) {
    const highlight = target.group.clone(true)
    highlight.name = `${target.name}-hover-outline`
    highlight.traverse(object => {
      if (object.isLight) {
        object.visible = false
        return
      }
      if (!object.isMesh) return
      if (target.name === 'walls' && object.geometry.type === 'PlaneGeometry' && object.userData.wallSide) {
        object.visible = false
        return
      }
      object.material = hoverOutlineMaterial
      object.scale.multiplyScalar(1.035)
      object.userData = { ...object.userData, hoverHighlight: true }
      object.castShadow = false
      object.receiveShadow = false
      object.renderOrder = 2
    })
    highlight.visible = false
    // Naast het origineel hangen (ook binnen de bovenverdieping), zodat de rand op de juiste plek staat
    ;(target.group.parent ?? room).add(highlight)
    target.highlights.push(highlight)
  }
  for (const target of hoverTargets) createHoverHighlight(target)

  function updateWallFade() {
    const floorBlend = THREE.MathUtils.clamp(displayedFloorHeight / 5.2, 0, 1)
    const previewOpacity = showOtherFloor ? FLOOR_PREVIEW_OPACITY : 0
    const lowerFloorOpacity = THREE.MathUtils.lerp(1, previewOpacity, floorBlend)
    for (const original of lowerFloorMeshes) {
      const { object } = original
      const opacity = original.opacity * lowerFloorOpacity
      const transparent = floorBlend > 0 || original.transparent
      if (object.material.transparent !== transparent) object.material.needsUpdate = true
      object.material.opacity = opacity
      object.material.transparent = transparent
      object.material.depthWrite = opacity > 0.5 && original.depthWrite
      object.castShadow = opacity > 0.5 && original.castShadow
    }
    viewDirection.copy(controls.target).sub(camera.position).normalize()
    for (const side of Object.keys(wallFades)) {
      const facing = side === 'stairs'
        ? Math.max(viewDirection.dot(wallFadeNormals.stairs), viewDirection.dot(wallFadeNormals.right))
        : viewDirection.dot(wallFadeNormals[side])
      const t = THREE.MathUtils.clamp((facing - 0.05) / (side === 'upperFloor' ? 0.18 : 0.3), 0, 1)
      const upstairsSelected = side === 'upperFloor'
      const opacity = upstairsSelected ? 1 : 1 - t * t * (3 - 2 * t) * 0.9
      wallFadeState[side] = opacity
      for (const mesh of wallFades[side]) {
        let selectedFloorOpacity = opacity
        if (side === 'upperFloor' && mesh.userData.upperWall) {
          const wallFacing = viewDirection.dot(wallFadeNormals[mesh.userData.upperWall])
          const fade = THREE.MathUtils.clamp((wallFacing - 0.05) / 0.3, 0, 1)
          selectedFloorOpacity = 1 - fade * fade * (3 - 2 * fade) * 0.9
        }
        const meshOpacity = side === 'upperFloor'
          ? THREE.MathUtils.lerp(upperFloorOpacity, selectedFloorOpacity, floorBlend) * (mesh.userData.surfaceOpacity ?? 1)
          : THREE.MathUtils.lerp(selectedFloorOpacity, previewOpacity, floorBlend)
        const material = mesh.material
        const wasTransparent = material.transparent
        mesh.visible = meshOpacity > 0.005
        material.opacity = meshOpacity
        material.transparent = meshOpacity < 0.999
        material.depthWrite = meshOpacity > 0.5
        if (wasTransparent !== material.transparent) material.needsUpdate = true
        mesh.castShadow = meshOpacity > 0.5 && !mesh.userData.noShadow
      }
    }
  }
  const ambientLight = new THREE.HemisphereLight(PALETTE.cream, PALETTE.darkWood, 1.7)
  scene.add(ambientLight)
  const sunset = new THREE.DirectionalLight('#F0A85C', 2.3)
  sunset.position.set(-5, 7, 2)
  sunset.castShadow = true
  sunset.shadow.mapSize.set(1024, 1024)
  Object.assign(sunset.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 })
  scene.add(sunset)
  const lampLight = new THREE.PointLight(PALETTE.lampGlow, 14, 12, 1.4)
  lampLight.position.set(0.6, 3.08, 0.18)
  lampLight.castShadow = true
  lampLight.shadow.mapSize.set(512, 512)
  scene.add(lampLight)
  const sideLampLight = new THREE.PointLight(PALETTE.lampGlow, 4, 4.5, 1.6)
  sideLampLight.position.set(0.02, 1.2, -2.63)
  scene.add(sideLampLight)
  const bedroomLight = new THREE.PointLight(PALETTE.lampGlow, 3, 11, 1.4)
  bedroomLight.position.set(0.5, 7.8, -0.6)
  scene.add(bedroomLight)
  const bedroomAccentLights = [
    [-2.92, 6.42, -2.55, 2.4, 4.5],
    [4.16, 6.95, 1.72, 3.4, 5.5],
    [4.14, 6.66, 0.68, 1.6, 3.5],
  ].map(([x, y, z, intensity, distance]) => {
    const light = new THREE.PointLight('#FFC58A', 0, distance, 1.5)
    light.position.set(x, y, z)
    light.userData.nightIntensity = intensity
    scene.add(light)
    return light
  })

  const render = () => {
    if (!floorTransition && !cameraTransition) {
      upperFloorOpacity = getUpperFloorOpacity()
    }
    updateWallFade()
    themeGroups.get('upperFloor').visible = upperFloorOpacity > 0.001
    renderer.render(scene, camera)
  }
  function handleCameraMotion() {
    render()
  }
  controls.addEventListener('change', handleCameraMotion)
  const characterRaycaster = new THREE.Raycaster()
  const characterPointer = new THREE.Vector2()
  function updateFurnitureHover(event) {
    const name = pickFurniture(event)
    const hoveredTarget = name ? hoverTargets.find(target => target.name === name) : null
    setFurnitureGlow(hoveredTarget ?? tutorialGlowTarget ?? null)
  }
  function setFurnitureGlow(target) {
    const targets = Array.isArray(target) ? target : [target]
    hoverTargets.forEach(item => item.highlights.forEach(highlight => {
      highlight.visible = targets.includes(item)
    }))
  }
  function clearFurnitureHover() {
    setFurnitureGlow(tutorialGlowTarget)
  }
  let tutorialGlowTarget = null
  function highlightFurniture(name) {
    const names = Array.isArray(name) ? name : [name]
    tutorialGlowTarget = hoverTargets.filter(target => names.includes(target.name))
    setFurnitureGlow(tutorialGlowTarget)
    render()
  }
  renderer.domElement.addEventListener('pointermove', updateFurnitureHover)
  renderer.domElement.addEventListener('pointerleave', clearFurnitureHover)
  // Klik op een aanpasbaar meubel opent zijn aanpaspaneel: beneden sofa, bureau en keuken, boven bed,
  // douche en make-uptafel. We kijken naar het eerste zichtbare ding onder de muis (dus een klik op de tv
  // opent niets), en enkel meubels van de verdieping waar je bent tellen. Slepen telt niet als klik.
  const customizableFurniture = ['sofa', 'desk', 'kitchen', 'bed', 'shower', 'dresser']
  const furnitureFloor = { bed: 1, shower: 1, dresser: 1 }
  const pointerDownAt = { x: 0, y: 0 }
  renderer.domElement.addEventListener('pointerdown', event => {
    pointerDownAt.x = event.clientX
    pointerDownAt.y = event.clientY
  })
  function isShown(object) {
    for (let node = object; node; node = node.parent) if (!node.visible) return false
    const opacity = object.material?.opacity ?? 1
    return opacity > 0.6
  }
  function pickFurniture(event) {
    const bounds = renderer.domElement.getBoundingClientRect()
    characterPointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
    characterPointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    characterRaycaster.setFromCamera(characterPointer, camera)
    const hit = characterRaycaster.intersectObject(room, true)
      .find(({ object }) => object.isMesh && !object.userData.hoverHighlight && isShown(object))
    for (let node = hit?.object; node; node = node.parent) {
      const name = customizableFurniture.find(item => themeGroups.get(item) === node)
      if (name) return (furnitureFloor[name] ?? 0) === activeFloor ? name : null
    }
    return null
  }
  function handleFurnitureClick(event) {
    if (Math.hypot(event.clientX - pointerDownAt.x, event.clientY - pointerDownAt.y) > 6) return
    const name = pickFurniture(event)
    if (!name) return
    clearFurnitureHover()
    onFurnitureClick(name)
  }
  renderer.domElement.addEventListener('click', handleFurnitureClick)
  function handleCharacterClick(event) {
    if (!man.root.visible) return
    const bounds = renderer.domElement.getBoundingClientRect()
    characterPointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
    characterPointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    characterRaycaster.setFromCamera(characterPointer, camera)
    if (characterRaycaster.intersectObject(man.root, true).length > 0) {
      onCharacterClick({ clientX: event.clientX, clientY: event.clientY, foods: kitchen.getFoodItems() })
    }
  }
  renderer.domElement.addEventListener('click', handleCharacterClick)
  let animationFrame
  const characterScreenPosition = new THREE.Vector3()
  function animate(timestamp) {
    const deltaSeconds = lastFrameTime === null ? 0 : Math.min(0.1, (timestamp - lastFrameTime) / 1000)
    lastFrameTime = timestamp
    updateViewShift(deltaSeconds)
    if (!floorTransition && !cameraTransition) updateSmoothZoom(deltaSeconds)
    updateSleepingCat(timestamp / 1000)
    man.update(timestamp / 1000, true)
    if (floorTransition) updateFloorTransition(timestamp)
    else if (cameraTransition) updateCameraTransition(timestamp)
    else controls.update()
    man.root.getWorldPosition(characterScreenPosition)
    characterScreenPosition.y += 1.05
    characterScreenPosition.project(camera)
    const canvasBounds = renderer.domElement.getBoundingClientRect()
    const onScreen = characterScreenPosition.z >= -1 && characterScreenPosition.z <= 1
      && characterScreenPosition.x >= -1 && characterScreenPosition.x <= 1
      && characterScreenPosition.y >= -1 && characterScreenPosition.y <= 1
    onCharacterPosition({
      x: canvasBounds.left + (characterScreenPosition.x + 1) * canvasBounds.width / 2,
      y: canvasBounds.top + (1 - characterScreenPosition.y) * canvasBounds.height / 2,
      visible: onScreen && man.root.visible && activeFloor === (man.root.position.y >= 2.6 ? 1 : 0),
    })
    render()
    animationFrame = window.requestAnimationFrame(animate)
  }
  animationFrame = window.requestAnimationFrame(animate)
  function resize() {
    const { width, height } = container.getBoundingClientRect()
    const aspect = width / height
    const viewHeight = Math.max(22, 18 / aspect)
    camera.left = -viewHeight * aspect / 2
    camera.right = viewHeight * aspect / 2
    camera.top = viewHeight / 2
    camera.bottom = -viewHeight / 2
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    if (!cameraTransition && !floorTransition && !sofaReturnView) centerRoomInView()
    render()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(container)

  function measureRoomInView() {
    camera.updateMatrixWorld(true)
    const minY = activeFloor === 0 ? 0 : 5.2
    const bounds = new THREE.Box3(
      new THREE.Vector3(-5, minY, -4.5),
      new THREE.Vector3(5, 8.5, 4.5),
    )
    const corner = new THREE.Vector3()
    const projectedBounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }

    for (const x of [bounds.min.x, bounds.max.x]) {
      for (const y of [bounds.min.y, bounds.max.y]) {
        for (const z of [bounds.min.z, bounds.max.z]) {
          corner.set(x, y, z).project(camera)
          projectedBounds.minX = Math.min(projectedBounds.minX, corner.x)
          projectedBounds.maxX = Math.max(projectedBounds.maxX, corner.x)
          projectedBounds.minY = Math.min(projectedBounds.minY, corner.y)
          projectedBounds.maxY = Math.max(projectedBounds.maxY, corner.y)
        }
      }
    }
    return projectedBounds
  }

  // Tutorial-layout: het beeld verschuiven/verkleinen via de camera (setViewOffset) in plaats van het
  // canvas met CSS te transformeren. Zo vult het canvas altijd het hele scherm en wordt het huis bij
  // inzoomen nooit afgesneden door de rand van een verkleind canvas.
  const viewShift = { x: 0, y: 0, scale: 1 }
  const viewShiftTarget = { x: 0, y: 0, scale: 1 }
  let lastFrameTime = null
  function applyViewShift() {
    const { width, height } = container.getBoundingClientRect()
    if (!width || !height) return
    if (viewShift.x === 0 && viewShift.y === 0 && viewShift.scale === 1) {
      if (camera.view?.enabled) camera.clearViewOffset()
      return
    }
    const viewWidth = width / viewShift.scale
    const viewHeight = height / viewShift.scale
    camera.setViewOffset(width, height,
      (width - viewWidth) / 2 - viewShift.x * width,
      (height - viewHeight) / 2 - viewShift.y * height,
      viewWidth, viewHeight)
  }
  function updateViewShift(deltaSeconds) {
    const ease = 1 - Math.exp(-deltaSeconds * 6)
    let moving = false
    for (const key of ['x', 'y', 'scale']) {
      const difference = viewShiftTarget[key] - viewShift[key]
      if (Math.abs(difference) < 0.0005) viewShift[key] = viewShiftTarget[key]
      else {
        viewShift[key] += difference * ease
        moving = true
      }
    }
    if (moving || camera.view?.enabled) applyViewShift()
  }
  function setViewShift({ x = 0, y = 0, scale = 1 } = {}, instant = false) {
    Object.assign(viewShiftTarget, { x, y, scale })
    if (instant) {
      Object.assign(viewShift, viewShiftTarget)
      applyViewShift()
      render()
    }
  }

  // Vloeiend zoomen: het muiswiel zet een doelzoom, en de camera glijdt er elke frame naartoe
  // (OrbitControls springt per scrollstap). Knijpen op touch blijft via OrbitControls lopen.
  let zoomTarget = null
  container.addEventListener('wheel', event => {
    event.preventDefault()
    event.stopPropagation()
    if (!controls.enabled) return
    const base = zoomTarget ?? camera.zoom
    const step = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
    const factor = Math.exp(-step * (event.ctrlKey ? 0.01 : 0.0018))
    zoomTarget = THREE.MathUtils.clamp(base * factor, controls.minZoom, controls.maxZoom)
  }, { capture: true, passive: false })
  function updateSmoothZoom(deltaSeconds) {
    if (zoomTarget === null) return
    const difference = zoomTarget - camera.zoom
    if (Math.abs(difference) < 0.0005) {
      camera.zoom = zoomTarget
      zoomTarget = null
    } else camera.zoom += difference * (1 - Math.exp(-deltaSeconds * 10))
    camera.updateProjectionMatrix()
  }
  function zoomTo(zoom) {
    zoomTarget = THREE.MathUtils.clamp(zoom, controls.minZoom, controls.maxZoom)
  }

  function centerRoomInView() {
    // Meten zonder tutorialverschuiving, daarna die verschuiving terugzetten
    if (camera.view?.enabled) camera.clearViewOffset()
    scene.updateMatrixWorld(true)
    // Zoom zo dat de kamer altijd in beeld past, ongeacht schermgrootte
    let projectedBounds = measureRoomInView()
    const roomSize = Math.max(projectedBounds.maxX - projectedBounds.minX, projectedBounds.maxY - projectedBounds.minY)
    if (roomSize > 0) {
      camera.zoom *= (2 * 0.8) / roomSize
      camera.updateProjectionMatrix()
      projectedBounds = measureRoomInView()
    }

    const horizontalOffset = (projectedBounds.minX + projectedBounds.maxX) / 2
      * (camera.right - camera.left) / (2 * camera.zoom)
    const verticalOffset = (projectedBounds.minY + projectedBounds.maxY) / 2
      * (camera.top - camera.bottom) / (2 * camera.zoom)
    const offset = new THREE.Vector3()
      .setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(horizontalOffset)
      .add(new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).multiplyScalar(verticalOffset))
    camera.position.add(offset)
    controls.target.add(offset)
    controls.update()
    applyViewShift()
  }

  function resetView() {
    zoomTarget = null
    floorTransition = null
    cameraTransition = null
    sofaReturnView = null
    displayedFloorHeight = activeFloor * 5.2
    controls.enabled = true
    controls.enableDamping = false
    camera.position.set(-12 + roomViewOffset, 11 + cameraHeightFor(activeFloor * 5.2), 12 + roomViewOffset)
    camera.zoom = 1
    camera.updateProjectionMatrix()
    controls.target.set(0.2 + roomViewOffset, 1.25 + cameraHeightFor(activeFloor * 5.2), -0.15 + roomViewOffset)
    controls.update()
    centerRoomInView()
    controls.enableDamping = true
    render()
  }

  // Op de bovenverdieping kijkt de camera iets lager dan 5.2 hoger, zodat het gebouw hoger
  // op het scherm staat en de bovenkamer niet zo laag in beeld zakt.
  const UPPER_FLOOR_CAMERA_DROP = 1.1
  const cameraHeightFor = floorHeight => floorHeight - UPPER_FLOOR_CAMERA_DROP * (floorHeight / 5.2)

  let upstairsGlowTimer = null
  function flashUpstairsFurniture() {
    window.clearTimeout(upstairsGlowTimer)
    setFurnitureGlow(hoverTargets.filter(target => (furnitureFloor[target.name] ?? 0) === 1))
    upstairsGlowTimer = window.setTimeout(() => setFurnitureGlow(tutorialGlowTarget ?? null), 1400)
  }

  function setFloor(floor) {
    window.clearTimeout(upstairsGlowTimer)
    if ((floor !== 0 && floor !== 1) || floor === activeFloor) return
    setFurnitureGlow(null)
    cameraTransition = null
    sofaReturnView = null
    controls.enableDamping = false
    controls.update()
    activeFloor = floor
    for (const child of room.children) {
      child.visible = true
    }
    const targetHeight = floor * 5.2
    const offset = new THREE.Vector3(0, cameraHeightFor(targetHeight) - cameraHeightFor(displayedFloorHeight), 0)
    floorTransition = {
      startedAt: performance.now(),
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : floor === 0 ? 1300 : 700,
      fromOpacity: upperFloorOpacity,
      toOpacity: getUpperFloorOpacity(floor),
      fromHeight: displayedFloorHeight,
      toHeight: targetHeight,
      fromPosition: camera.position.clone(),
      toPosition: camera.position.clone().add(offset),
      fromTarget: controls.target.clone(),
      toTarget: controls.target.clone().add(offset),
    }
    controls.enabled = false
    controls.enableDamping = false
    render()
  }

  function updateFloorTransition(timestamp) {
    const transition = floorTransition
    if (!transition) return
    const progress = transition.duration === 0 ? 1
      : THREE.MathUtils.clamp((timestamp - transition.startedAt) / transition.duration, 0, 1)
    const eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10)
    camera.position.lerpVectors(transition.fromPosition, transition.toPosition, eased)
    controls.target.lerpVectors(transition.fromTarget, transition.toTarget, eased)
    displayedFloorHeight = THREE.MathUtils.lerp(transition.fromHeight, transition.toHeight, eased)
    upperFloorOpacity = THREE.MathUtils.lerp(transition.fromOpacity, transition.toOpacity, eased)
    controls.update()
    if (progress === 1) {
      floorTransition = null
      controls.enabled = true
      controls.enableDamping = true
      if (displayedFloorHeight === 0) upperFloorOpacity = getUpperFloorOpacity(0)
      // Boven aangekomen: laat even zien welke meubels je hier kan aanpassen
      if (activeFloor === 1) flashUpstairsFurniture()
    }
  }

  function transitionCamera(position, target, zoom, upperOpacity, duration = 750) {
    zoomTarget = null
    cameraTransition = {
      startedAt: performance.now(),
      duration,
      fromPosition: camera.position.clone(),
      toPosition: position.clone(),
      fromTarget: controls.target.clone(),
      toTarget: target.clone(),
      fromZoom: camera.zoom,
      toZoom: zoom,
      fromOpacity: upperFloorOpacity,
      toOpacity: upperOpacity,
    }
    controls.enabled = false
    controls.enableDamping = false
  }

  function updateCameraTransition(timestamp) {
    const transition = cameraTransition
    if (!transition) return
    const progress = THREE.MathUtils.clamp((timestamp - transition.startedAt) / transition.duration, 0, 1)
    const eased = progress * progress * (3 - 2 * progress)
    camera.position.lerpVectors(transition.fromPosition, transition.toPosition, eased)
    controls.target.lerpVectors(transition.fromTarget, transition.toTarget, eased)
    camera.zoom = THREE.MathUtils.lerp(transition.fromZoom, transition.toZoom, eased)
    upperFloorOpacity = THREE.MathUtils.lerp(transition.fromOpacity, transition.toOpacity, eased)
    camera.updateProjectionMatrix()
    controls.update()
    if (progress === 1) {
      cameraTransition = null
      controls.enabled = true
      controls.enableDamping = true
      controls.update()
    }
  }

  function setOtherFloorVisible(visible) {
    showOtherFloor = Boolean(visible)
    const targetOpacity = getUpperFloorOpacity()
    if (floorTransition) floorTransition.toOpacity = getUpperFloorOpacity(activeFloor)
    if (cameraTransition) cameraTransition.toOpacity = targetOpacity
    if (!floorTransition && !cameraTransition) upperFloorOpacity = targetOpacity
    render()
  }

  function focusFurniture(name = 'sofa') {
    if (!themeGroups.has(name) || activeFloor !== (furnitureFloor[name] ?? 0)) return false
    if (!sofaReturnView) {
      // Zoomt de camera nog terug van een vorig meubel? Dan is dát het terugkeerpunt,
      // niet het half ingezoomde beeld van nu (anders blijf je na het sluiten ingezoomd vastzitten).
      sofaReturnView = cameraTransition?.returnView ?? {
        position: camera.position.clone(),
        target: controls.target.clone(),
        zoom: camera.zoom,
      }
    }
    scene.updateMatrixWorld(true)
    const center = new THREE.Box3().setFromObject(themeGroups.get(name)).getCenter(new THREE.Vector3())
    center.y += 0.15
    const direction = camera.position.clone().sub(controls.target).normalize()
    transitionCamera(center.clone().addScaledVector(direction, 11.5), center, 2.8, 0)
    return true
  }

  function restoreSofaView() {
    if (!sofaReturnView) return
    const view = sofaReturnView
    sofaReturnView = null
    transitionCamera(view.position, view.target, view.zoom, getUpperFloorOpacity())
    cameraTransition.returnView = view
  }

  const themeState = new Map()


  function setTheme(item, style, custom = {}) {
    const group = themeGroups.get(item)
    if (!group || (style !== 'original' && !THEME_PALETTES[style])) return
    themeState.set(item, { style, custom })
    group.traverse(object => {
      if (!object.isMesh || !object.userData.paletteKey) return
      if (!object.userData.themeBaseColor) {
        object.material = object.material.clone()
        object.userData.themeBaseColor = object.material.color.clone()
        themedMaterials.add(object.material)
      }
      const followed = object.userData.followsPaletteKey
      if (followed && custom[followed]) object.material.color.set(custom[followed]).multiplyScalar(0.72)
      else object.material.color.set(resolveColor(object.userData.paletteKey, style, custom))
    })
    if (item === 'lighting') {
      const glow = resolveColor('lampGlow', style, custom)
      lampLight.color.set(glow)
      sideLampLight.color.set(glow)
    }
    render()
  }

  function getPreviewSource(item) {
    let source = themeGroups.get(item)
    if (source?.children.length) return source
    source = new THREE.Group()
    if (item === 'sideTable') {
      box(0.2, 0.04, 0.2, 0, 0.02, 0, 'darkWood', source)
      box(0.055, 0.42, 0.055, 0, 0.24, 0, 'darkWood', source)
      box(0.4, 0.18, 0.4, 0, 0.55, 0, 'tan', source)
      box(0.2, 0.1, 0.2, 0, 0.43, 0, 'lampGlow', source)
    }
    else if (item === 'plants') createPlant(0, 0, 1.3, 'terracotta', 'round', source)
    return source
  }

  function getThemeParts(item, style = 'original', custom = {}) {
    const keys = new Set()
    getPreviewSource(item).traverse(object => {
      if (object.isMesh && object.userData.paletteKey) keys.add(object.userData.paletteKey)
    })
    return [...keys].map(key => ({ key, color: resolveColor(key, style, custom), base: resolveColor(key, style, {}) }))
  }

  function setNightMode(isNight) {
    setWindowNight(isNight)
    container.classList.toggle('is-night', isNight)
    ambientLight.intensity = isNight ? 0.95 : 1.7
    sunset.intensity = isNight ? 0.65 : 2.3
    lampLight.intensity = isNight ? 6 : 14
    sideLampLight.intensity = isNight ? 2.5 : 4
    bedroomLight.intensity = isNight ? 3.2 : 3
    bedroomLight.color.set(isNight ? '#FFD3A6' : PALETTE.lampGlow)
    bedroomAccentLights.forEach(light => {
      light.intensity = isNight ? light.userData.nightIntensity : 0
    })
    accentLights.forEach(light => {
      light.intensity = isNight ? 6 : 1.5
      light.distance = isNight ? 5 : 3
    })
    ceilingBulb.material.color.set(isNight ? '#B8955A' : PALETTE.lampGlow)
    render()
  }

  function createPreview(previewContainer) {
    const previewRenderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    previewRenderer.setPixelRatio(0.5)
    previewRenderer.outputColorSpace = THREE.SRGBColorSpace
    previewRenderer.domElement.style.imageRendering = 'pixelated'
    previewContainer.appendChild(previewRenderer.domElement)
    const previewScene = new THREE.Scene()
    const previewCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50)
    previewScene.add(new THREE.AmbientLight('#FFF1DC', 1.8))
    const key = new THREE.DirectionalLight('#FFFFFF', 2.2)
    key.position.set(4, 6, 5)
    previewScene.add(key)
    const pivot = new THREE.Group()
    previewScene.add(pivot)
    let frame = 0
    let running = false

    let sizedWidth = 0
    let sizedHeight = 0
    function resizePreview() {
      const width = previewContainer.clientWidth || 200
      const height = previewContainer.clientHeight || 140
      sizedWidth = previewContainer.clientWidth
      sizedHeight = previewContainer.clientHeight
      previewRenderer.setSize(width, height, false)
      previewRenderer.domElement.style.width = '100%'
      previewRenderer.domElement.style.height = '100%'
      const aspect = width / height
      previewCamera.left = -3 * aspect
      previewCamera.right = 3 * aspect
      previewCamera.top = 3
      previewCamera.bottom = -3
      previewCamera.updateProjectionMatrix()
      fitPreview()
    }

    let fitHalfWidth = 0
    let fitHalfHeight = 0
    function fitPreview() {
      if (!fitHalfWidth) return
      pivot.scale.setScalar(Math.min(previewCamera.top / fitHalfHeight, previewCamera.right / fitHalfWidth) * 0.94)
      pivot.position.set(0, 0, 0)
    }

    function show(item, style, custom = {}) {
      const source = getPreviewSource(item)
      pivot.clear()
      pivot.scale.setScalar(1)
      pivot.rotation.set(0, 0, 0)
      room.updateMatrixWorld(true)
      const copy = source.clone(true)
      copy.traverse(object => {
        if (!object.isMesh) return
        object.material = object.material.clone()
        if (object.userData.paletteKey) object.material.color.set(resolveColor(object.userData.paletteKey, style, custom))
      })
      const holder = new THREE.Group()
      holder.add(copy)
      pivot.add(holder)
      pivot.updateMatrixWorld(true)
      const bounds = new THREE.Box3().setFromObject(holder)
      const center = bounds.getCenter(new THREE.Vector3())
      const size = bounds.getSize(new THREE.Vector3())
      holder.position.set(-center.x, -center.y, -center.z)
      const radius = Math.max(Math.hypot(size.x, size.z) / 2, 0.01)
      const elevation = Math.atan2(6, Math.hypot(7, 7))
      fitHalfWidth = radius
      fitHalfHeight = Math.max(radius * Math.sin(elevation) + (size.y / 2) * Math.cos(elevation), 0.01)
      fitPreview()
    }

    function loop(time) {
      if (!running) return
      if (previewContainer.clientWidth !== sizedWidth || previewContainer.clientHeight !== sizedHeight) resizePreview()
      pivot.rotation.y = time / 1800
      previewRenderer.render(previewScene, previewCamera)
      frame = requestAnimationFrame(loop)
    }

    previewCamera.position.set(7, 6, 7)
    previewCamera.lookAt(0, 0, 0)
    return {
      show,
      start() {
        resizePreview()
        if (running) return
        running = true
        frame = requestAnimationFrame(loop)
      },
      stop() {
        running = false
        cancelAnimationFrame(frame)
      },
      dispose() {
        running = false
        cancelAnimationFrame(frame)
        previewRenderer.dispose()
        previewRenderer.domElement.remove()
      },
    }
  }

  resize()
  resetView()

  // Intro: bij het laden groeit het gebouw vloeiend naar de standaardgrootte
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const finalZoom = camera.zoom
    camera.zoom = finalZoom * 0.35
    camera.updateProjectionMatrix()
    render()
    transitionCamera(camera.position, controls.target, finalZoom, upperFloorOpacity, 1400)
  }

  return {
    createPreview,
    highlightFurniture,
    resetView,
    focusSofa: () => focusFurniture('sofa'),
    focusFurniture,
    restoreSofaView,
    setFloor,
    setOtherFloorVisible,
    setTheme,
    getThemeParts,
    setSofaModel(name) {
      if (!sofaControls.setModel(name)) return false
      render()
      return true
    },
    setViewShift,
    zoomTo,
    // Foto van het huis: de pixelweergave 3× vergroot (scherpe pixels), met een achtergrond die
    // main.js tekent (dag/nacht en sterren). Geeft een PNG-data-URL terug.
    takeScreenshot(drawBackground = () => {}) {
      setFurnitureGlow(null)
      render()
      const source = renderer.domElement
      const photo = document.createElement('canvas')
      photo.width = source.width * 3
      photo.height = source.height * 3
      const context = photo.getContext('2d')
      context.imageSmoothingEnabled = false
      drawBackground(context, photo.width, photo.height)
      context.drawImage(source, 0, 0, photo.width, photo.height)
      setFurnitureGlow(tutorialGlowTarget ?? null)
      return photo.toDataURL('image/png')
    },
    setFurnitureModel(item, name) {
      if (!setFurnitureModel(item, name)) return false
      render()
      return true
    },
    // Voor de browsertests: waar staat een meubel op het scherm, en hoe staat de camera?
    getScreenPoint(name) {
      const group = themeGroups.get(name)
      if (!group) return null
      scene.updateMatrixWorld(true)
      const point = new THREE.Box3().setFromObject(group).getCenter(new THREE.Vector3()).project(camera)
      const bounds = renderer.domElement.getBoundingClientRect()
      return { x: bounds.left + (point.x + 1) / 2 * bounds.width, y: bounds.top + (1 - point.y) / 2 * bounds.height }
    },
    projectPoint([x, y, z]) {
      const point = new THREE.Vector3(x, y, z).project(camera)
      const bounds = renderer.domElement.getBoundingClientRect()
      return { x: bounds.left + (point.x + 1) / 2 * bounds.width, y: bounds.top + (1 - point.y) / 2 * bounds.height }
    },
    getCameraState() {
      return { position: camera.position.toArray(), zoom: camera.zoom, activeFloor }
    },
    setSofaCushionShape(shape) {
      if (!sofaControls.setCushionShape(shape)) return false
      render()
      return true
    },
    setNightMode,
    storeFoodItem(product) {
      const stored = kitchen.storeFoodItem(product)
      if (stored) man.update(performance.now() / 1000, true)
      return stored
    },
    feedCharacter(foodId) {
      const eatenFood = kitchen.takeFoodItem(foodId)
      if (!eatenFood) return null
      man.feed()
      man.update(performance.now() / 1000, true)
      return eatenFood
    },
    getFoodItems: kitchen.getFoodItems,
    dispose() {
      window.cancelAnimationFrame(animationFrame)
      observer.disconnect()
      controls.removeEventListener('change', handleCameraMotion)
      renderer.domElement.removeEventListener('pointermove', updateFurnitureHover)
      renderer.domElement.removeEventListener('pointerleave', clearFurnitureHover)
      renderer.domElement.removeEventListener('click', handleFurnitureClick)
      renderer.domElement.removeEventListener('click', handleCharacterClick)
      controls.dispose()
      const geometries = new Set()
      scene.traverse(object => { if (object.geometry) geometries.add(object.geometry) })
      geometries.forEach(geometry => geometry.dispose())
      Object.values(materials).forEach(material => material.dispose())
      themedMaterials.forEach(material => material.dispose())
      sceneTextures.forEach(texture => texture.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
