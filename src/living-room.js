import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export const PALETTE = {
  cream: '#E4D2BA',
  tan: '#CC9B6F',
  mustard: '#A69060',
  olive: '#778856',
  plantGreen: '#394526',
  terracotta: '#946851',
  darkWood: '#502E1C',
  outline: '#281A0A',
  blue: '#B0D4D2',
  sky: '#94CAE2',
  darkGray: '#414242',
  brown: '#76483B',
  lampGlow: '#FFE0A3',
  skin: '#C98265',
  curlyHair: '#3B2924',
  blouse: '#D77C9E',
  shirt: '#426B83',
  pants: '#4A3B39',
  trousers: '#44637B',
  shoes: '#F2D6AA',
  eye: '#281A0A',
  nightSky: '#18243A',
  parquet: '#B88D66',
  parquetLight: '#C79F77',
  parquetDark: '#AA805C',
  cushionYellow: '#F2C84B',
  blanket: '#C86B53',
  pendantOrange: '#F0781C',
  rugRed: '#8F3835',
  rugCoral: '#B9574C',
  rugGold: '#D6A477',
  rugIvory: '#E4CFAB',
  crtGreen: '#788A73',
}

const THEME_PALETTES = {
  girly: {
    cream: '#F6C8DA', tan: '#F2AFCB', mustard: '#E8B45C', olive: '#A7B879',
    plantGreen: '#54794D', terracotta: '#D77C9E', darkWood: '#89536D', blue: '#A9D7EC',
    sky: '#A9DDF4', darkGray: '#51404F', brown: '#B67991', lampGlow: '#FFE8A3',
  },
  colorful: {
    cream: '#FFD166', tan: '#06D6A0', mustard: '#FF9F1C', olive: '#8AC926',
    plantGreen: '#198754', terracotta: '#EF476F', darkWood: '#3A3151', blue: '#118AB2',
    sky: '#90E0EF', darkGray: '#25233A', brown: '#D1495B', lampGlow: '#FFF3A0',
  },
}

export function createLivingRoom(container, onMoodUpdate = () => {}, onCharacterClick = () => {}, onCharacterPosition = () => {}) {
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-7, 7, 5, -5, 0.1, 80)
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
  controls.target.set(0.2, 1.25, -0.15)

  const materials = Object.fromEntries(Object.entries(PALETTE).map(([name, color]) => [
    name,
    name === 'lampGlow'
      ? new THREE.MeshBasicMaterial({ color })
      : new THREE.MeshLambertMaterial({ color, flatShading: true }),
  ]))
  const room = new THREE.Group()
  const themeGroups = new Map()
  const themedMaterials = new Set()
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

  function createTableLamp(parent, x, y, z) {
    box(0.2, 0.04, 0.2, x, y + 0.02, z, 'darkWood', parent)
    box(0.055, 0.42, 0.055, x, y + 0.24, z, 'darkWood', parent)
    box(0.4, 0.18, 0.4, x, y + 0.55, z, 'tan', parent)
    box(0.2, 0.1, 0.2, x, y + 0.43, z, 'lampGlow', parent)
    const light = new THREE.PointLight(PALETTE.lampGlow, 1.5, 3, 2)
    light.position.set(x, y + 0.5, z)
    parent.add(light)
    accentLights.push(light)
  }

  function createDeskArea() {
    const desk = getThemeGroup('desk')
    desk.position.set(-6.7, 0, 0.6)
    desk.rotation.y = Math.PI
    box(2.32, 0.14, 0.78, -3.35, 1.04, -3.45, 'darkWood', desk)
    box(2.1, 0.08, 0.6, -3.35, 1.15, -3.45, 'brown', desk)
    for (const x of [-4.27, -2.43]) for (const z of [-3.72, -3.18]) box(0.12, 0.96, 0.12, x, 0.52, z, 'darkWood', desk)
    box(0.54, 0.66, 0.68, -4.08, 0.68, -3.46, 'darkWood', desk)
    box(0.4, 0.24, 0.035, -4.08, 0.84, -3.08, 'tan', desk)
    box(0.4, 0.24, 0.035, -4.08, 0.53, -3.08, 'tan', desk)
    box(0.96, 0.64, 0.08, -3.22, 1.59, -3.72, 'darkWood', desk)
    box(0.82, 0.5, 0.025, -3.22, 1.59, -3.65, 'darkGray', desk)
    box(0.1, 0.36, 0.1, -3.22, 1.19, -3.58, 'darkWood', desk)
    box(0.58, 0.06, 0.22, -3.22, 1.2, -3.14, 'darkGray', desk)
    box(0.86, 0.14, 0.86, -3.3, 0.73, -2.42, 'terracotta', desk)
    box(0.72, 0.1, 0.72, -3.3, 0.84, -2.42, 'cream', desk)
    for (const x of [-3.57, -3.03]) for (const z of [-2.68, -2.16]) box(0.1, 0.65, 0.1, x, 0.35, z, 'darkWood', desk)
    box(0.82, 0.58, 0.12, -3.3, 1.2, -2.02, 'terracotta', desk)
    createTableLamp(desk, -4.05, 1.19, -3.45)
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
    box(10, 5.2, 0.16, 0, 2.6, -4.45, 'cream', walls)
    box(0.16, 5.2, 9, 4.92, 2.6, 0, 'cream', walls)
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
    box(0.32, 2.12, 0.12, x - 1.25, y, z + 0.18, 'cream', window)
    box(0.32, 2.12, 0.12, x + 1.25, y, z + 0.18, 'cream', window)
    box(2.82, 0.13, 0.16, x, y + 1.08, z + 0.18, 'darkWood', window)

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

  function createSectionalSofa() {
    const sofa = getThemeGroup('sofa')
    const z = -0.15
    box(1.28, 0.3, 3.45, 4.02, 0.3, z, 'darkWood', sofa)
    box(1.18, 0.34, 3.3, 3.96, 0.62, z, 'blue', sofa)
    box(0.34, 0.82, 3.3, 4.54, 1.12, z, 'blue', sofa)
    box(1.16, 0.54, 0.28, 4.02, 0.91, z - 1.55, 'sky', sofa)
    box(1.16, 0.54, 0.28, 4.02, 0.91, z + 1.55, 'sky', sofa)
    for (const cushionZ of [z - 1.02, z, z + 1.02]) {
      box(1.02, 0.2, 0.94, 3.88, 0.87, cushionZ, 'sky', sofa)
      box(0.28, 0.62, 0.96, 4.32, 1.35, cushionZ, 'blue', sofa)
    }
    const roundCushion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.23, 0.12, 10),
      materials.cushionYellow,
    )
    roundCushion.position.set(4.1, 1.22, z - 0.62)
    roundCushion.rotation.z = Math.PI / 2
    roundCushion.castShadow = true
    roundCushion.receiveShadow = true
    sofa.add(roundCushion)
    box(0.16, 0.44, 0.44, 4.1, 1.22, z + 0.58, 'olive', sofa)

    const blanketProfile = [
      [z - 1.73, 0.66], [z - 1.73, 1.2], [z - 1.67, 1.27], [z - 1.44, 1.27],
      [z - 1.26, 1.08], [z - 1.12, 1.07], [z - 0.95, 1.07],
    ]
    const blanketVertices = [
      ...blanketProfile.map(([blanketZ, y]) => [3.45, y, blanketZ]),
      ...blanketProfile.map(([blanketZ, y], index) => [4.12, y, blanketZ + (index > 3 ? 0.03 : 0)]),
    ]
    const blanketIndices = []
    for (let index = 0; index < blanketProfile.length - 1; index++) {
      const nextRow = index + blanketProfile.length
      blanketIndices.push(index, index + 1, nextRow, index + 1, nextRow + 1, nextRow)
    }
    const blanketGeometry = new THREE.BufferGeometry()
    blanketGeometry.setAttribute('position', new THREE.Float32BufferAttribute(blanketVertices.flat(), 3))
    blanketGeometry.setIndex(blanketIndices)
    blanketGeometry.computeVertexNormals()
    const blanketMaterial = new THREE.MeshLambertMaterial({ color: PALETTE.blanket, flatShading: true, side: THREE.DoubleSide })
    themedMaterials.add(blanketMaterial)
    const blanket = new THREE.Mesh(blanketGeometry, blanketMaterial)
    blanket.castShadow = true
    blanket.receiveShadow = false
    sofa.add(blanket)
    for (const legZ of [z - 1.38, z + 1.38]) box(0.1, 0.28, 0.1, 3.55, 0.15, legZ, 'darkWood', sofa)
  }

  function createPouf() {
    const pouf = getThemeGroup('pouf')
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 9, 6),
      materials.olive,
    )
    mesh.position.set(2.05, 0.55, -2.85)
    mesh.scale.set(0.95, 0.76, 1)
    mesh.castShadow = true
    mesh.receiveShadow = true
    pouf.add(mesh)
  }

  function createRug() {
    const rug = getThemeGroup('rug')
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

    const medallion = box(1.18, 0.025, 1.72, x, 0.16, z, 'rugGold', rug)
    medallion.rotation.y = Math.PI / 4
    const medallionCenter = box(0.68, 0.03, 1.0, x, 0.18, z, 'rugIvory', rug)
    medallionCenter.rotation.y = Math.PI / 4
    const centerMark = box(0.3, 0.035, 0.48, x, 0.2, z, 'rugCoral', rug)
    centerMark.rotation.y = Math.PI / 4

    for (const side of [-1, 1]) {
      const motif = box(0.34, 0.025, 0.52, x, 0.16, z + side * 2.0, 'rugGold', rug)
      motif.rotation.y = Math.PI / 4
      box(0.18, 0.03, 0.24, x, 0.18, z + side * 2.0, 'rugIvory', rug)
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
      mesh.position.set(x, y, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      table.add(mesh)
    }

    makeCylinder(0.76, 0.76, 0.12, 0.7, 'darkWood')
    makeCylinder(0.69, 0.69, 0.045, 0.783, 'brown')
    makeCylinder(0.15, 0.22, 0.5, 0.38, 'darkWood')
    makeCylinder(0.42, 0.42, 0.08, 0.08, 'darkWood')

    const plant = new THREE.Group()
    plant.position.set(x, 0.806, z)
    table.add(plant)
    box(0.34, 0.26, 0.34, 0, 0.13, 0, 'terracotta', plant)
    box(0.28, 0.05, 0.28, 0, 0.285, 0, 'darkWood', plant)
    box(0.08, 0.24, 0.08, 0, 0.42, 0, 'plantGreen', plant)
    box(0.16, 0.28, 0.08, -0.13, 0.47, 0.01, 'olive', plant)
    box(0.16, 0.33, 0.08, 0.13, 0.49, -0.01, 'plantGreen', plant)
    box(0.14, 0.26, 0.08, 0.02, 0.55, -0.09, 'olive', plant)
  }

  function createKitchen() {
    const kitchen = getThemeGroup('kitchen')
    const counterZ = -3.92
    const cabinetCenters = [-3.5, -2.5, -1.5]

    cabinetCenters.forEach((x, index) => {
      box(0.94, 0.72, 0.64, x, 0.42, counterZ, index === 1 ? 'brown' : 'darkWood', kitchen)
      box(0.86, 0.54, 0.035, x, 0.43, -3.555, index === 1 ? 'blue' : 'tan', kitchen)
      box(0.055, 0.08, 0.045, x + 0.25, 0.45, -3.53, 'darkWood', kitchen)
    })
    box(3.05, 0.14, 0.82, -2.5, 0.86, counterZ, 'parquetLight', kitchen)

    box(0.72, 0.035, 0.5, -2.55, 0.95, -3.92, 'darkGray', kitchen)
    box(0.055, 0.27, 0.055, -2.55, 1.1, -4.16, 'darkGray', kitchen)
    box(0.28, 0.055, 0.055, -2.42, 1.22, -4.16, 'darkGray', kitchen)

    box(0.76, 0.045, 0.62, -1.5, 0.96, counterZ, 'darkGray', kitchen)
    for (const x of [-1.7, -1.3]) for (const z of [-4.08, -3.76]) {
      const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.035, 8), materials.darkWood)
      burner.position.set(x, 0.985, z)
      burner.castShadow = true
      kitchen.add(burner)
    }
    createTableLamp(kitchen, -3.5, 0.93, counterZ)

    box(0.08, 1.9, 0.78, -4.74, 1.0, -3.91, 'darkGray', kitchen)
    box(0.08, 1.9, 0.78, -4.06, 1.0, -3.91, 'darkGray', kitchen)
    box(0.6, 1.9, 0.08, -4.4, 1.0, -4.26, 'darkGray', kitchen)
    box(0.6, 0.08, 0.7, -4.4, 0.09, -3.87, 'darkGray', kitchen)
    box(0.6, 0.08, 0.7, -4.4, 1.91, -3.87, 'darkGray', kitchen)
    box(0.58, 0.035, 0.62, -4.4, 0.42, -3.9, 'cream', kitchen)
    box(0.58, 0.035, 0.62, -4.4, 1.0, -3.9, 'cream', kitchen)
    box(0.58, 0.035, 0.62, -4.4, 1.58, -3.9, 'cream', kitchen)

    const fridgeDoor = new THREE.Group()
    fridgeDoor.position.set(-4.76, 1.0, -3.51)
    kitchen.add(fridgeDoor)
    box(0.76, 1.9, 0.075, 0.38, 0, 0.015, 'cream', fridgeDoor)
    box(0.055, 0.34, 0.055, 0.67, 0, 0.07, 'darkWood', fridgeDoor)

    const fridgeContents = new THREE.Group()
    kitchen.add(fridgeContents)
    const foodItems = []
    const foodSlots = [
      [-4.61, 0.62], [-4.4, 0.62], [-4.19, 0.62],
      [-4.61, 1.2], [-4.4, 1.2], [-4.19, 1.2],
    ]

    for (const x of [-4.4, -0.76]) {
      box(0.76, 0.82, 0.38, x, 2.7, -4.16, 'darkWood', kitchen)
      box(0.68, 0.72, 0.04, x, 2.7, -3.95, 'brown', kitchen)
      box(0.05, 0.06, 0.035, x + 0.23, 2.7, -3.92, 'parquetLight', kitchen)
    }

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

    return {
      storeFoodItem,
      takeFoodItem,
      getFoodCount: () => foodItems.length,
      getFoodItems: () => foodItems.map(({ id, name, color }) => ({ id, name, color })),
    }
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
    box(0.5, 0.45, 0.035, 0, 0.94, -0.21, upholstery, chair)
  }

  function createDiningTable() {
    const dining = getThemeGroup('dining')
    const x = -2.35
    const z = -0.9
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.14, 12), materials.darkWood)
    top.position.set(x, 0.78, z)
    top.castShadow = true
    top.receiveShadow = true
    dining.add(top)
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.24, 0.58, 8), materials.darkWood)
    pedestal.position.set(x, 0.43, z)
    pedestal.castShadow = true
    dining.add(pedestal)
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 10), materials.darkWood)
    base.position.set(x, 0.08, z)
    base.castShadow = true
    dining.add(base)

    createDiningChair(x, z - 1.08, 0, 'terracotta')
    createDiningChair(x, z + 1.08, Math.PI, 'mustard')
    createDiningChair(x - 1.08, z, Math.PI / 2, 'olive')
    createDiningChair(x + 1.08, z, -Math.PI / 2, 'blue')
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
    box(0.025, 0.94, 1.62, x - 0.18, 1.34, z, 'brown', tv)

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

    const shadeGeometry = new THREE.SphereGeometry(0.62, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2)
    const shade = new THREE.Mesh(shadeGeometry, materials.pendantOrange)
    shade.position.set(x, 3.18, z)
    shade.castShadow = true
    shade.receiveShadow = true
    lighting.add(shade)

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 4), materials.lampGlow.clone())
    bulb.position.set(x, 3.08, z)
    themedMaterials.add(bulb.material)
    lighting.add(bulb)
    return bulb
  }

  function createPlant(x, z, scale = 1, potColor = 'terracotta', leafStyle = 'round') {
    const plant = new THREE.Group()
    plant.position.set(x, 0, z)
    getThemeGroup('plants').add(plant)
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

  function createHangingPlant(x, y, z) {
    const decor = getThemeGroup('wallDecor')
    box(0.46, 0.22, 0.42, x, y, z, 'terracotta', decor)
    box(0.32, 0.06, 0.29, x, y + 0.14, z, 'darkWood', decor)
    for (let strand = 0; strand < 3; strand++) {
      const direction = strand - 1
      for (let leaf = 0; leaf < 5; leaf++) {
        const leafX = x + direction * 0.09 + (leaf % 2 ? 0.06 : -0.06)
        const leafY = y - 0.16 - leaf * 0.19
        const leafZ = z + 0.05 + direction * 0.04
        box(0.17, 0.2, 0.07, leafX, leafY, leafZ, leaf % 2 ? 'olive' : 'plantGreen', decor)
      }
    }
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
    createHangingPlant(1.98, 3.72, -3.93)

    box(0.025, 0.025, 1.02, 1.05, 3.38, -3.9, 'darkWood', decor)
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
    const decor = getThemeGroup('wallDecor')
    const x = 4.55
    const shelfRows = [
      { y: 2.62, bookBase: 2.7, colors: ['terracotta', 'blue', 'tan', 'olive', 'mustard', 'brown'] },
      { y: 3.48, bookBase: 3.56, colors: ['blue', 'mustard', 'terracotta', 'brown', 'olive', 'tan'] },
    ]

    for (const row of shelfRows) {
      box(0.34, 0.11, 2.45, x, row.y, 0, 'darkWood', decor)
      box(0.28, 0.05, 2.29, x - 0.01, row.y + 0.08, 0, 'brown', decor)
      let z = -0.98
      for (let index = 0; index < row.colors.length; index++) {
        const width = [0.18, 0.22, 0.15, 0.2, 0.17, 0.19][index]
        const height = [0.36, 0.43, 0.29, 0.39, 0.33, 0.41][index]
        box(0.16, height, width, x - 0.13, row.bookBase + height / 2, z + width / 2, row.colors[index], decor)
        z += width + 0.08
      }
    }

    const plant = new THREE.Group()
    plant.position.set(x - 0.15, 3.54, 0.91)
    decor.add(plant)
    box(0.27, 0.22, 0.3, 0, 0.11, 0, 'terracotta', plant)
    box(0.22, 0.045, 0.24, 0, 0.24, 0, 'darkWood', plant)
    box(0.09, 0.38, 0.08, 0, 0.47, 0, 'plantGreen', plant)
    box(0.12, 0.27, 0.08, -0.12, 0.42, 0.02, 'olive', plant)
    box(0.12, 0.31, 0.08, 0.11, 0.45, -0.02, 'plantGreen', plant)
    box(0.1, 0.24, 0.08, 0.01, 0.59, 0.05, 'olive', plant)
  }

  function createLowBookcase() {
    const shelf = getThemeGroup('bookshelf')
    const x = 4.5
    const z = 2.45
    box(0.56, 0.08, 1.55, x, 0.12, z, 'darkWood', shelf)
    box(0.56, 0.08, 1.55, x, 0.48, z, 'brown', shelf)
    box(0.56, 0.08, 1.55, x, 0.84, z, 'darkWood', shelf)
    box(0.08, 0.78, 1.55, x + 0.24, 0.47, z, 'brown', shelf)
    for (const sideX of [-0.24, 0.24]) {
      for (const sideZ of [-0.72, 0.72]) box(0.08, 0.78, 0.08, x + sideX, 0.47, z + sideZ, 'darkWood', shelf)
    }

    const rows = [
      { baseY: 0.17, books: [[0.18, 0.28, 'terracotta'], [0.2, 0.34, 'blue'], [0.16, 0.23, 'mustard'], [0.21, 0.3, 'olive'], [0.18, 0.27, 'brown']] },
      { baseY: 0.53, books: [[0.18, 0.27, 'blue'], [0.2, 0.31, 'tan'], [0.16, 0.24, 'terracotta'], [0.21, 0.34, 'mustard'], [0.19, 0.28, 'olive']] },
    ]
    for (const row of rows) {
      let bookZ = z - 0.62
      for (const [width, height, color] of row.books) {
        box(0.17, height, width, x - 0.13, row.baseY + height / 2, bookZ + width / 2, color, shelf)
        bookZ += width + 0.06
      }
    }

    const plant = new THREE.Group()
    plant.position.set(x - 0.12, 0.88, z + 0.47)
    shelf.add(plant)
    box(0.25, 0.2, 0.25, 0, 0.1, 0, 'terracotta', plant)
    box(0.2, 0.04, 0.2, 0, 0.22, 0, 'darkWood', plant)
    box(0.08, 0.3, 0.08, 0, 0.38, 0, 'plantGreen', plant)
    box(0.12, 0.23, 0.08, -0.1, 0.39, 0.02, 'olive', plant)
    box(0.12, 0.26, 0.08, 0.1, 0.42, -0.02, 'plantGreen', plant)
    createTableLamp(shelf, x, 0.88, z - 0.5)
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
    const upperBody = new THREE.Group()
    root.add(upperBody)
    const characterMaterial = Object.fromEntries(['skin', 'curlyHair', 'shirt', 'pants', 'shoes', 'eye'].map(name => [name, materials[name]]))

    function addBox(parent, width, height, depth, x, y, z, materialName) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), characterMaterial[materialName])
      mesh.position.set(x, y, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      parent.add(mesh)
      return mesh
    }

    function addCurl(parent, x, y, z, size = 0.09) {
      const curl = new THREE.Mesh(new THREE.SphereGeometry(size, 5, 4), characterMaterial.curlyHair)
      curl.position.set(x, y, z)
      curl.castShadow = true
      parent.add(curl)
    }

    addBox(upperBody, 0.52, 0.56, 0.32, 0, 1.16, 0, 'shirt')
    addBox(upperBody, 0.4, 0.2, 0.28, 0, 0.8, 0, 'pants')
    addBox(upperBody, 0.16, 0.2, 0.16, 0, 1.51, 0, 'skin')

    const head = new THREE.Group()
    head.position.set(0, 1.79, 0)
    upperBody.add(head)
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 5), characterMaterial.skin)
    face.castShadow = true
    head.add(face)
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.23, 6, 4), characterMaterial.curlyHair)
    hairCap.position.set(0, 0.1, -0.015)
    hairCap.castShadow = true
    head.add(hairCap)
    for (const [x, y, z, size] of [
      [-0.18, 0.12, -0.02, 0.1], [-0.1, 0.22, 0, 0.095], [0, 0.25, -0.01, 0.1], [0.11, 0.21, 0, 0.1], [0.19, 0.12, 0, 0.095],
      [-0.2, 0.02, 0.015, 0.09], [0.2, 0.02, 0.015, 0.09], [-0.17, -0.1, -0.02, 0.09], [0.17, -0.1, -0.02, 0.09],
    ]) addCurl(head, x, y, z, size)
    for (const [x, y, z, size] of [
      [-0.14, 0.18, -0.12, 0.085], [0, 0.22, -0.19, 0.09], [0.14, 0.18, -0.12, 0.085],
      [-0.17, 0.02, -0.16, 0.09], [0, 0.02, -0.22, 0.09], [0.17, 0.02, -0.16, 0.09],
      [-0.17, -0.16, -0.12, 0.09], [0, -0.18, -0.2, 0.09], [0.17, -0.16, -0.12, 0.09],
      [-0.14, -0.34, -0.08, 0.085], [0, -0.37, -0.14, 0.085], [0.14, -0.34, -0.08, 0.085],
    ]) addCurl(head, x, y, z, size)
    for (const side of [-1, 1]) {
      for (const [index, y] of [-0.16, -0.31, -0.46, -0.6].entries()) {
        addCurl(head, side * (0.17 + index * 0.012), y, 0.02, 0.095)
        addCurl(head, side * (0.12 + index * 0.015), y - 0.07, -0.055, 0.075)
      }
    }
    addBox(head, 0.035, 0.045, 0.025, -0.065, 0.015, 0.177, 'eye')
    addBox(head, 0.035, 0.045, 0.025, 0.065, 0.015, 0.177, 'eye')
    addBox(head, 0.1, 0.035, 0.025, 0, -0.045, 0.18, 'curlyHair')

    const arms = []
    const remote = new THREE.Group()
    for (const side of [-1, 1]) {
      const arm = new THREE.Group()
      arm.position.set(side * 0.29, 1.4, 0)
      upperBody.add(arm)
      addBox(arm, 0.16, 0.34, 0.16, 0, -0.17, 0, 'shirt')
      addBox(arm, 0.12, 0.28, 0.12, 0, -0.43, 0.02, 'skin')
      addBox(arm, 0.13, 0.12, 0.13, 0, -0.58, 0.04, 'skin')
      arms.push(arm)
      if (side === 1) {
        addBox(arm, 0.06, 0.14, 0.04, 0, -0.55, 0.15, 'darkGray')
        remote.userData.mesh = arm.children[arm.children.length - 1]
      }
    }

    const legs = []
    for (const side of [-1, 1]) {
      const thigh = new THREE.Group()
      thigh.position.x = side * 0.16
      root.add(thigh)
      addBox(thigh, 0.18, 0.42, 0.18, 0, -0.21, 0, 'pants')
      const knee = new THREE.Group()
      knee.position.y = -0.42
      thigh.add(knee)
      addBox(knee, 0.16, 0.42, 0.16, 0, -0.21, 0, 'pants')
      addBox(knee, 0.2, 0.12, 0.3, 0, -0.43, 0.06, 'shoes')
      legs.push({ thigh, knee })
    }

    let foodLevel = 78
    let previousUpdateTime = null

    const route = [
      [-3.4, 3.02], [-3.4, 1.5], [-4.4, 1.5], [-4.4, 0.9],
      [-1.1, 0.9], [3.15, 0.9], [3.15, -1.4], [3.55, -0.15],
    ]
    const smoothStep = amount => {
      const value = THREE.MathUtils.clamp(amount, 0, 1)
      return value * value * (3 - 2 * value)
    }
    const headingBetween = (from, to) => Math.atan2(to[0] - from[0], to[1] - from[1])
    const shortestAngle = (from, to, amount) => from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * amount

    function getWalkPose(progress, returning) {
      const points = returning ? [...route].reverse() : route
      const scaled = THREE.MathUtils.clamp(progress, 0, 1) * (points.length - 1)
      const segment = Math.min(points.length - 2, Math.floor(scaled))
      const local = scaled - segment
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

    function update(time) {
      if (previousUpdateTime !== null) foodLevel = Math.max(10, foodLevel - (time - previousUpdateTime) * 0.07)
      previousUpdateTime = time
      const phase = time % 28
      let x
      let z
      let yaw
      let sit
      let seatHeight
      let action
      let entertainment

      if (phase < 7) {
        x = route[0][0]; z = route[0][1]; yaw = 0; sit = 1; seatHeight = 0.84; action = 'computer'
        entertainment = 68 - phase * 2
      } else if (phase < 12.5) {
        const progress = (phase - 7) / 5.5
        const pose = getWalkPose(progress, false)
        sit = 1 - smoothStep(progress / 0.14)
        x = pose.x; z = pose.z; yaw = pose.yaw; seatHeight = 0.84 * (1 - sit); action = 'walk'
        entertainment = 54 + progress * 6
      } else if (phase < 21) {
        x = route[route.length - 1][0]; z = route[route.length - 1][1]; yaw = -Math.PI / 2; sit = 1; seatHeight = 0.84; action = 'television'
        entertainment = 60 + ((phase - 12.5) / 8.5) * 38
      } else {
        const progress = (phase - 21) / 7
        const pose = getWalkPose(progress, true)
        sit = smoothStep((progress - 0.86) / 0.14)
        x = pose.x; z = pose.z; yaw = pose.yaw; seatHeight = 0.84 * sit; action = 'walk'
        entertainment = 98 - progress * 30
      }

      root.position.set(x, seatHeight, z)
      root.rotation.y = yaw
      upperBody.position.y = -0.48 * sit + Math.abs(Math.sin(time * 9)) * 0.035 * (1 - sit)
      arms.forEach((arm, index) => {
        const swing = Math.sin(time * 8 + index * Math.PI) * 0.42 * (1 - sit)
        const typing = Math.sin(time * 15 + index * 1.7) * 0.07
        arm.rotation.x = action === 'computer' ? -0.9 + typing : action === 'television' ? 0.18 : swing
      })
      remote.userData.mesh.visible = action === 'television'
      legs.forEach(({ thigh, knee }, index) => {
        const stride = Math.sin(time * 8 + index * Math.PI) * 0.38 * (1 - sit)
        thigh.position.y = 0.78 * (1 - sit)
        thigh.rotation.x = -Math.PI / 2 * sit + stride
        knee.rotation.x = Math.PI / 2 * sit + Math.max(0, stride) * 0.45
      })

      const food = Math.round(foodLevel)
      const happy = Math.round((food + entertainment) / 2)
      onMoodUpdate({ happy, food, entertainment: Math.round(entertainment), foodCount: kitchen.getFoodCount() })
    }

    function feed() {
      foodLevel = Math.min(100, foodLevel + 28)
    }

    return { root, update, feed }
  }

  createRoomShell()
  createRug()
  const setWindowNight = createWindow()
  const kitchen = createKitchen()
  createDiningTable()
  createDeskArea()
  createTVArea()
  createSectionalSofa()
  createPouf()
  createCoffeeTable()
  createLowBookcase()
  createFloatingShelves()
  createRightWallShelves()
  createCeilingLamp()
  const man = createAnimatedMan()
  const ceilingBulb = createCeilingLamp()

  scene.add(room)
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

  const render = () => renderer.render(scene, camera)
  controls.addEventListener('change', render)
  const characterRaycaster = new THREE.Raycaster()
  const characterPointer = new THREE.Vector2()
  function handleCharacterClick(event) {
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
    man.update(timestamp / 1000)
    controls.update()
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
      visible: onScreen,
    })
    render()
    animationFrame = window.requestAnimationFrame(animate)
  }
  animationFrame = window.requestAnimationFrame(animate)
  function resize() {
    const { width, height } = container.getBoundingClientRect()
    const viewHeight = 15
    const aspect = width / height
    camera.left = -viewHeight * aspect / 2
    camera.right = viewHeight * aspect / 2
    camera.top = viewHeight / 2
    camera.bottom = -viewHeight / 2
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    render()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(container)

  function resetView() {
    controls.enableDamping = false
    camera.position.set(-12, 11, 12)
    camera.zoom = 1
    camera.updateProjectionMatrix()
    controls.target.set(0.2, 1.25, -0.15)
    controls.update()
    controls.enableDamping = true
    render()
  }

  function setTheme(item, style) {
    const group = themeGroups.get(item)
    if (!group || (style !== 'original' && !THEME_PALETTES[style])) return
    group.traverse(object => {
      if (!object.isMesh || !object.userData.paletteKey) return
      if (!object.userData.themeBaseColor) {
        object.material = object.material.clone()
        object.userData.themeBaseColor = object.material.color.clone()
        themedMaterials.add(object.material)
      }
      const palette = style === 'original' ? PALETTE : THEME_PALETTES[style]
      object.material.color.set(palette[object.userData.paletteKey] ?? PALETTE[object.userData.paletteKey])
    })
    if (item === 'lighting') {
      const glow = style === 'original' ? PALETTE.lampGlow : THEME_PALETTES[style].lampGlow
      lampLight.color.set(glow)
      sideLampLight.color.set(glow)
    }
    render()
  }

  function setNightMode(isNight) {
    setWindowNight(isNight)
    container.classList.toggle('is-night', isNight)
    ambientLight.intensity = isNight ? 0.52 : 1.7
    sunset.intensity = isNight ? 0.38 : 2.3
    lampLight.intensity = isNight ? 0 : 14
    sideLampLight.intensity = isNight ? 0 : 4
    accentLights.forEach(light => {
      light.intensity = isNight ? 6 : 1.5
      light.distance = isNight ? 5 : 3
    })
    ceilingBulb.material.color.set(isNight ? '#514640' : PALETTE.lampGlow)
    render()
  }

  resetView()
  resize()

  return {
    resetView,
    setTheme,
    setNightMode,
    storeFoodItem(product) {
      const stored = kitchen.storeFoodItem(product)
      if (stored) man.update(performance.now() / 1000)
      return stored
    },
    feedCharacter(foodId) {
      const eatenFood = kitchen.takeFoodItem(foodId)
      if (!eatenFood) return null
      man.feed()
      man.update(performance.now() / 1000)
      return eatenFood
    },
    getFoodItems: kitchen.getFoodItems,
    dispose() {
      window.cancelAnimationFrame(animationFrame)
      observer.disconnect()
      controls.removeEventListener('change', render)
      renderer.domElement.removeEventListener('click', handleCharacterClick)
      controls.dispose()
      const geometries = new Set()
      scene.traverse(object => { if (object.geometry) geometries.add(object.geometry) })
      geometries.forEach(geometry => geometry.dispose())
      Object.values(materials).forEach(material => material.dispose())
      themedMaterials.forEach(material => material.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
