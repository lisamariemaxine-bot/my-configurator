import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// Furniture is local to the upper floor so its visibility follows the floor controls.
export function createBedroom(parent, materials) {
  const bedroom = new THREE.Group()
  bedroom.name = 'bedroom'
  bedroom.position.y = 5.2
  parent.add(bedroom)

  const group = (name, x = 0, y = 0, z = 0) => {
    const result = new THREE.Group()
    result.name = name
    result.position.set(x, y, z)
    bedroom.add(result)
    return result
  }
  function mesh(geometry, color, x, y, z, target = bedroom) {
    const result = new THREE.Mesh(geometry, materials[color])
    result.position.set(x, y, z)
    result.userData.paletteKey = color
    result.castShadow = true
    result.receiveShadow = true
    target.add(result)
    return result
  }
  function block(w, h, d, x, y, z, color, target = bedroom, radius = 0.025) {
    return mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, w / 3, h / 3, d / 3)), color, x, y, z, target)
  }
  function cylinder(rt, rb, h, x, y, z, color, target = bedroom) {
    return mesh(new THREE.CylinderGeometry(rt, rb, h, 16), color, x, y, z, target)
  }
  function oval(w, h, d, x, y, z, color, target = bedroom) {
    const result = mesh(new THREE.SphereGeometry(1, 12, 8), color, x, y, z, target)
    result.scale.set(w, h, d)
    return result
  }
  function ring(radius, x, y, z, color, target = bedroom) {
    const result = mesh(new THREE.TorusGeometry(radius, 0.012, 6, 24), color, x, y, z, target)
    result.rotation.x = Math.PI / 2
    return result
  }
  function plant(x, y, z, scale, target = bedroom, style = 'cactus') {
    const pot = new THREE.Group()
    pot.name = `plant-${style}`
    pot.position.set(x, y, z)
    pot.scale.setScalar(scale)
    target.add(pot)
    const potColor = { cactus: 'bedroomLilac', succulent: 'bedroomCoral', monstera: 'bedroomTeal', trailing: 'cushionYellow' }[style]
    cylinder(0.17, 0.12, 0.28, 0, 0.14, 0, potColor, pot)
    ring(0.17, 0, 0.28, 0, 'cream', pot)
    cylinder(0.145, 0.145, 0.018, 0, 0.28, 0, 'darkWood', pot)
    if (style === 'cactus') {
      oval(0.1, 0.28, 0.1, 0, 0.55, 0, 'olive', pot)
      for (const side of [-1, 1]) {
        oval(0.1, 0.05, 0.055, side * 0.1, 0.48, 0, 'olive', pot)
        oval(0.055, 0.14, 0.055, side * 0.18, 0.57, 0, 'olive', pot)
      }
      for (let dot = 0; dot < 6; dot++) oval(0.009, 0.014, 0.009, dot % 2 ? 0.04 : -0.04, 0.35 + dot * 0.07, 0.095, 'cream', pot)
      for (let petal = 0; petal < 5; petal++) oval(0.035, 0.025, 0.03, Math.cos(petal * 1.257) * 0.04, 0.83, Math.sin(petal * 1.257) * 0.04, 'blouse', pot)
    } else if (style === 'succulent') {
      for (let layer = 0; layer < 2; layer++) for (let leaf = 0; leaf < 8; leaf++) {
        const angle = leaf * Math.PI / 4 + layer * 0.35
        const blade = oval(0.065, 0.15 - layer * 0.035, 0.035, Math.cos(angle) * (0.1 - layer * 0.04), 0.35 + layer * 0.09, Math.sin(angle) * (0.1 - layer * 0.04), layer ? 'bedroomTeal' : 'olive', pot)
        blade.rotation.set(Math.sin(angle) * 0.95, 0, -Math.cos(angle) * 0.95)
      }
    } else if (style === 'monstera') {
      for (let leaf = 0; leaf < 5; leaf++) {
        const angle = leaf * 2.4
        const height = 0.7 + leaf * 0.13
        const end = new THREE.Vector3(Math.cos(angle) * 0.24, height, Math.sin(angle) * 0.24)
        const start = new THREE.Vector3(0, 0.28, 0)
        const direction = end.clone().sub(start)
        const stem = cylinder(0.012, 0.018, direction.length(), end.x / 2, (height + 0.28) / 2, end.z / 2, 'plantGreen', pot)
        stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
        const foliage = new THREE.Group()
        foliage.position.copy(end)
        foliage.rotation.set(-0.25, angle, 0.3)
        pot.add(foliage)
        oval(0.1, 0.24, 0.035, 0, 0, 0, 'plantGreen', foliage)
        for (const side of [-1, 1]) for (let lobe = 0; lobe < 3; lobe++) {
          oval(0.085, 0.06, 0.032, side * (0.08 + lobe * 0.018), -0.13 + lobe * 0.11, 0, leaf % 2 ? 'olive' : 'plantGreen', foliage).rotation.z = side * 0.4
        }
        block(0.012, 0.36, 0.01, 0, 0, 0.038, 'olive', foliage)
      }
    } else {
      for (let strand = 0; strand < 3; strand++) {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0.32, 0), new THREE.Vector3((strand - 1) * 0.13, 0.4, 0.12),
          new THREE.Vector3((strand - 1) * 0.18, 0.1, 0.26), new THREE.Vector3((strand - 1) * 0.15, -0.55 - strand * 0.13, 0.3),
        ])
        mesh(new THREE.TubeGeometry(curve, 16, 0.012, 5), 'plantGreen', 0, 0, 0, pot)
        for (let leaf = 1; leaf < 9; leaf++) {
          const point = curve.getPoint(leaf / 9)
          const blade = oval(0.065, 0.085, 0.025, point.x + (leaf % 2 ? 0.045 : -0.045), point.y, point.z, leaf % 2 ? 'olive' : 'plantGreen', pot)
          blade.rotation.z = leaf % 2 ? 0.55 : -0.55
        }
      }
    }
  }
  function book(x, y, z, color, target, width = 0.36) {
    block(width, 0.025, 0.27, x, y, z, color, target)
    block(width - 0.025, 0.06, 0.245, x, y + 0.042, z, 'cream', target)
    block(width, 0.025, 0.27, x, y + 0.085, z, color, target)
  }
  function lamp(x, y, z, target) {
    cylinder(0.14, 0.16, 0.055, x, y + 0.03, z, 'darkWood', target)
    cylinder(0.022, 0.025, 0.35, x, y + 0.21, z, 'mustard', target)
    mesh(new THREE.CylinderGeometry(0.13, 0.23, 0.29, 16, 1, true), 'rugIvory', x, y + 0.49, z, target)
    ring(0.23, x, y + 0.345, z, 'mustard', target)
    oval(0.08, 0.08, 0.08, x, y + 0.4, z, 'lampGlow', target)
  }

  const floorDetails = group('bedroom-floor-details')
  for (let row = 0; row < 17; row++) {
    const z = -4.22 + row * 0.44
    block(9.75, 0.004, 0.012, -0.08, 0.003, z, 'parquet', floorDetails, 0)
    for (let seam = 0; seam < 6; seam++) {
      block(0.012, 0.004, 0.42, -4.4 + seam * 1.6 + (row % 2) * 0.6, 0.003, z + 0.21, 'parquet', floorDetails, 0)
    }
  }

  const rug = group('bedroom-rug', -0.85, 0, -0.25)
  block(4.1, 0.045, 4.35, 0, 0.025, 0, 'bedroomPinkStripe', rug, 0.02)
  for (const side of [-1, 1]) for (let fringe = 0; fringe < 23; fringe++) {
    block(0.025, 0.012, 0.16, -1.9 + fringe * 0.17, 0.025, side * 2.23, 'bedroomPinkStripe', rug)
  }

  const bed = group('bed', -0.9, 0, -2.45)
  for (const x of [-1.12, 1.12]) for (const z of [-1.65, 1.65]) block(0.13, 0.38, 0.13, x, 0.22, z, 'darkWood', bed)
  block(2.55, 0.24, 3.7, 0, 0.38, 0, 'darkWood', bed)
  block(2.43, 0.29, 3.55, 0, 0.64, 0, 'white', bed, 0.12)
  block(2.62, 0.12, 0.16, 0, 1.49, -1.78, 'darkWood', bed)
  for (let slat = 0; slat < 12; slat++) block(0.065, 0.96, 0.08, -1.18 + slat * 0.215, 0.96, -1.78, 'darkWood', bed)
  for (const x of [-1.25, 1.25]) block(0.12, 1.23, 0.13, x, 0.94, -1.78, 'darkWood', bed)
  block(2.47, 0.17, 2.6, 0, 0.82, 0.46, 'bedroomTeal', bed, 0.08)
  block(2.47, 0.11, 0.36, 0, 0.94, -0.68, 'cream', bed, 0.05)
  for (const side of [-1, 1]) block(0.09, 0.4, 2.5, side * 1.23, 0.65, 0.5, 'bedroomTeal', bed)
  for (let stitch = 0; stitch < 14; stitch++) {
    for (const z of [-0.38, 0.7, 1.4]) block(0.09, 0.008, 0.022, -1.1 + stitch * 0.17, 0.912, z, 'cream', bed)
  }
  for (const x of [-0.62, 0.62]) {
    const pillow = block(0.99, 0.27, 0.64, x, 0.93, -1.12, x < 0 ? 'bedroomLilac' : 'bedroomCoral', bed, 0.13)
    pillow.rotation.x = -0.12
    block(0.84, 0.016, 0.022, x, 1.057, -0.86, 'bedroomTeal', bed)
  }
  const accent = block(0.5, 0.38, 0.2, -0.12, 1.04, -0.88, 'rugCoral', bed, 0.09)
  accent.rotation.z = -0.16
  // Crescent cushion, built as a single curved silhouette.
  const moonShape = new THREE.Shape()
  moonShape.absarc(0, 0, 0.25, Math.PI * 0.2, Math.PI * 1.8, false)
  moonShape.quadraticCurveTo(-0.08, 0, 0.25 * Math.cos(Math.PI * 0.2), 0.25 * Math.sin(Math.PI * 0.2))
  const moon = mesh(new THREE.ExtrudeGeometry(moonShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 2, steps: 1 }), 'cushionYellow', 0.48, 1.1, -0.76, bed)
  moon.rotation.z = -0.25
  // Folded blanket on the foot of the bed.
  for (let fold = 0; fold < 3; fold++) block(0.9, 0.06, 0.56, 0.6, 0.96 + fold * 0.065, 1.2, fold % 2 ? 'cream' : 'bedroomLilac', bed, 0.025)

  for (const side of [-1, 1]) {
    const stand = group(`nightstand-${side}`, -0.9 + side * 1.9, 0, -3.85)
    block(0.73, 0.57, 0.65, 0, 0.36, 0, 'bedroomTeal', stand)
    block(0.79, 0.08, 0.71, 0, 0.69, 0, 'darkWood', stand)
    block(0.62, 0.23, 0.035, 0, 0.49, 0.34, 'cream', stand)
    oval(0.035, 0.035, 0.025, 0, 0.49, 0.37, 'mustard', stand)
    book(0, 0.15, 0.15, 'olive', stand)
    if (side === -1) lamp(-0.12, 0.73, 0, stand)
    else {
      plant(0.13, 0.73, -0.08, 0.65, stand)
      cylinder(0.08, 0.08, 0.13, -0.19, 0.795, 0.15, 'cream', stand)
      cylinder(0.065, 0.065, 0.008, -0.19, 0.865, 0.15, 'brown', stand)
    }
  }

  const wardrobe = group('wardrobe', -3.9, 0, -3.77)
  block(1.52, 2.48, 0.9, 0, 1.28, 0, 'tan', wardrobe)
  block(1.64, 0.12, 1.01, 0, 2.55, 0, 'darkWood', wardrobe)
  for (const side of [-1, 1]) {
    block(0.69, 2.23, 0.065, side * 0.37, 1.31, 0.48, 'cream', wardrobe)
    block(0.55, 1.87, 0.025, side * 0.37, 1.34, 0.525, 'bedroomLilac', wardrobe)
    block(0.04, 0.23, 0.04, side * 0.09, 1.28, 0.56, 'darkWood', wardrobe)
  }
  block(0.6, 0.24, 0.5, -0.3, 2.73, 0, 'olive', wardrobe)
  block(0.63, 0.04, 0.53, -0.3, 2.87, 0, 'wallpaperStripe', wardrobe)
  block(0.18, 0.06, 0.018, -0.3, 2.75, 0.26, 'cream', wardrobe)

  const bench = group('bed-bench', -0.9, 0, 1.5)
  for (const x of [-1, 1]) for (const z of [-0.25, 0.25]) block(0.09, 0.48, 0.09, x, 0.25, z, 'darkWood', bench)
  block(2.25, 0.12, 0.68, 0, 0.52, 0, 'darkWood', bench)
  block(2.12, 0.16, 0.6, 0, 0.65, 0, 'bedroomLilac', bench, 0.07)
  for (const x of [-1.08, 1.08]) block(0.065, 0.3, 0.6, x, 0.73, 0, 'darkWood', bench)
  book(-0.6, 0.74, 0, 'blue', bench)
  book(-0.55, 0.85, 0.02, 'rugCoral', bench)
  block(0.42, 0.26, 0.33, 0.61, 0.85, 0, 'brown', bench, 0.08)
  const bagHandle = mesh(new THREE.TorusGeometry(0.12, 0.023, 6, 16, Math.PI), 'darkWood', 0.61, 0.99, 0, bench)
  bagHandle.rotation.z = 0

  const dresser = group('dresser', 4.2, 0, -0.35)
  block(0.92, 1.02, 2.5, 0, 0.62, 0, 'darkWood', dresser)
  block(1.03, 0.1, 2.62, 0, 1.18, 0, 'cream', dresser)
  for (const y of [0.33, 0.65, 0.97]) {
    block(0.06, 0.26, 2.28, -0.49, y, 0, 'darkWood', dresser)
    for (const z of [-0.65, 0.65]) block(0.06, 0.04, 0.25, -0.54, y, z, 'mustard', dresser)
  }
  for (const z of [-1.02, 1.02]) block(0.65, 0.15, 0.12, 0, 0.12, z, 'darkWood', dresser)
  // Standing mirror faces into the room.
  block(0.09, 1.04, 0.75, 0.14, 1.88, -0.45, 'darkWood', dresser, 0.04)
  block(0.012, 0.9, 0.62, 0.087, 1.88, -0.45, 'blue', dresser)
  block(0.014, 0.68, 0.04, 0.076, 1.93, -0.6, 'white', dresser).rotation.x = -0.24
  block(0.5, 0.08, 0.83, 0.02, 1.28, -0.45, 'darkWood', dresser)
  for (const [z, color, height] of [[0.25, 'blouse', 0.24], [0.48, 'blue', 0.31], [0.69, 'olive', 0.2]]) {
    cylinder(0.07, 0.09, height, -0.08, 1.23 + height / 2, z, color, dresser)
    cylinder(0.035, 0.035, 0.055, -0.08, 1.26 + height, z, 'mustard', dresser)
  }
  oval(0.22, 0.25, 0.22, -0.06, 1.46, 1.03, 'lampGlow', dresser)
  cylinder(0.18, 0.2, 0.045, -0.06, 1.25, 1.03, 'darkWood', dresser)
  plant(0.08, 1.23, -1.05, 0.7, dresser, 'succulent')

  const hangingLamp = group('bedroom-hanging-lamp', 0, 0, 0.2)
  cylinder(0.16, 0.16, 0.08, 0, 5.16, 0, 'darkWood', hangingLamp)
  cylinder(0.025, 0.025, 1, 0, 4.65, 0, 'darkWood', hangingLamp)
  cylinder(0.11, 0.13, 0.22, 0, 4.05, 0, 'bedroomCoral', hangingLamp)
  const shade = mesh(
    new THREE.SphereGeometry(0.46, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    'bedroomCoral', 0, 3.91, 0, hangingLamp,
  )
  ring(0.46, 0, 3.91, 0, 'bedroomCoral', hangingLamp)
  const bulb = mesh(new THREE.SphereGeometry(0.11, 8, 6), 'lampGlow', 0, 3.82, 0, hangingLamp)
  shade.castShadow = false
  bulb.castShadow = false

  const floorLamp = group('floor-lamp', 4.16, 0, 1.72)
  cylinder(0.23, 0.28, 0.08, 0, 0.04, 0, 'darkWood', floorLamp)
  cylinder(0.025, 0.035, 1.63, 0, 0.88, 0, 'darkWood', floorLamp)
  mesh(new THREE.CylinderGeometry(0.2, 0.36, 0.4, 20, 1, true), 'white', 0, 1.78, 0, floorLamp)
  ring(0.36, 0, 1.58, 0, 'mustard', floorLamp)
  oval(0.13, 0.13, 0.13, 0, 1.67, 0, 'lampGlow', floorLamp)
  book(3.5, 0.04, 1.82, 'blue', bedroom, 0.48)
  book(3.54, 0.15, 1.8, 'rugCoral', bedroom, 0.46)

  const chest = group('storage-chest', -3.55, 0, 3.35)
  block(1.45, 0.55, 0.72, 0, 0.32, 0, 'tan', chest)
  block(1.5, 0.09, 0.77, 0, 0.64, 0, 'darkWood', chest)
  for (const x of [-0.48, 0.48]) block(0.06, 0.5, 0.02, x, 0.33, 0.37, 'brown', chest)
  block(0.15, 0.13, 0.03, 0, 0.51, 0.39, 'mustard', chest)
  block(0.75, 0.08, 0.5, -0.17, 0.73, 0, 'wallpaperStripe', chest)
  block(0.72, 0.07, 0.48, -0.15, 0.81, 0, 'cream', chest)
  plant(0.45, 0.685, 0, 1.35, chest, 'monstera')
  // Soft slippers beside the bed.
  for (const x of [0.75, 1.03]) {
    oval(0.11, 0.045, 0.23, x, 0.09, 0.75, 'cream')
    oval(0.115, 0.075, 0.12, x, 0.13, 0.67, 'rugCoral')
  }

  const gallery = group('bed-gallery')
  function picture(x, y, w, h, background) {
    block(w, h, 0.065, x, y, -4.3, 'darkWood', gallery)
    block(w - 0.09, h - 0.09, 0.012, x, y, -4.26, 'cream', gallery)
    block(w - 0.16, h - 0.16, 0.008, x, y, -4.248, background, gallery)
  }
  picture(-0.9, 2.42, 1.65, 0.72, 'plantGreen')
  for (let flower = 0; flower < 7; flower++) {
    const x = -1.55 + flower * 0.21
    block(0.018, 0.2 + (flower % 3) * 0.05, 0.012, x, 2.34, -4.23, 'olive', gallery)
    oval(0.047, 0.047, 0.018, x, 2.47 + (flower % 3) * 0.025, -4.21, flower % 2 ? 'rugIvory' : 'cushionYellow', gallery)
  }
  picture(-2.05, 2.1, 0.46, 0.64, 'rugCoral')
  picture(0.3, 2.09, 0.48, 0.55, 'blue')
  for (let note = 0; note < 5; note++) {
    block(0.16, 0.2, 0.012, -1.9 + note * 0.47, 1.78 + (note % 2) * 0.1, -4.26, ['rugGold', 'cream', 'blouse'][note % 3], gallery).rotation.z = (note % 2 ? 1 : -1) * 0.1
  }
  const wire = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.4, 2.94, -4.17), new THREE.Vector3(-0.9, 2.78, -4.15), new THREE.Vector3(0.6, 2.94, -4.17)])
  mesh(new THREE.TubeGeometry(wire, 24, 0.009, 4), 'darkWood', 0, 0, 0, gallery)
  for (let bulb = 0; bulb < 11; bulb++) {
    const point = wire.getPoint(bulb / 10)
    oval(0.035, 0.048, 0.035, point.x, point.y - 0.035, point.z, 'lampGlow', gallery)
  }
  gallery.traverse(object => { if (object.isMesh) object.userData.upperWall = 'back' })

  const window = group('bedroom-window')
  block(0.08, 1.65, 1.58, 4.78, 2.13, -0.4, 'cream', window)
  block(0.018, 1.45, 1.38, 4.728, 2.13, -0.4, 'sky', window)
  block(0.035, 0.055, 1.38, 4.71, 2.13, -0.4, 'white', window)
  block(0.035, 1.45, 0.055, 4.71, 2.13, -0.4, 'white', window)
  block(0.3, 0.08, 1.78, 4.65, 1.29, -0.4, 'cream', window)
  for (const side of [-1, 1]) for (let fold = 0; fold < 3; fold++) {
    cylinder(0.055, 0.06, 1.78, 4.62, 2.1, -0.4 + side * 0.8 + (fold - 1) * 0.07, 'bedroomCoral', window)
  }
  window.traverse(object => { if (object.isMesh) object.userData.upperWall = 'right' })

  const shelf = group('bedroom-shelf', 1.45, 0, -4.08)
  block(1.2, 0.09, 0.4, 0, 1.65, 0, 'darkWood', shelf)
  for (let index = 0; index < 4; index++) {
    const height = 0.28 + index % 2 * 0.08
    block(0.12, height, 0.23, -0.45 + index * 0.15, 1.7 + height / 2, 0, ['rugCoral', 'blue', 'olive', 'cream'][index], shelf)
    block(0.08, 0.022, 0.01, -0.45 + index * 0.15, 1.79, 0.12, 'rugIvory', shelf)
  }
  plant(0.35, 1.7, 0, 0.65, shelf, 'trailing')
  shelf.traverse(object => { if (object.isMesh) object.userData.upperWall = 'back' })
  const shower = group('shower', 4.04, 0, -3.55)
  block(1.42, 0.12, 1.4, 0, 0.07, 0, 'white', shower)
  block(1.22, 0.018, 1.2, 0, 0.139, 0, 'white', shower)
  cylinder(0.055, 0.055, 0.008, 0.25, 0.154, -0.27, 'darkGray', shower)
  for (let row = 0; row < 7; row++) for (let column = 0; column < 4; column++) {
    const tile = block(0.34, 0.3, 0.035, -0.525 + column * 0.35, 0.3 + row * 0.31, -0.72,
      'white', shower, 0.006)
    tile.userData.upperWall = 'back'
  }
  for (const x of [-0.7, 0.7]) {
    block(0.035, 2.22, 0.035, x, 1.24, 0.68, 'white', shower)
    block(0.035, 0.035, 1.4, x, 2.34, 0, 'white', shower)
  }
  const sideGlass = block(0.016, 2.13, 1.32, -0.69, 1.24, 0, 'white', shower, 0)
  const frontGlass = block(0.5, 2.13, 0.016, 0.43, 1.24, 0.67, 'white', shower, 0)
  for (const glass of [sideGlass, frontGlass]) {
    glass.userData.surfaceOpacity = 0.2
    glass.castShadow = false
    glass.receiveShadow = false
  }
  block(0.035, 0.25, 0.035, 0.19, 1.3, 0.7, 'darkGray', shower)
  cylinder(0.022, 0.022, 1.25, 0.22, 1.48, -0.64, 'white', shower)
  block(0.045, 0.045, 0.33, 0.22, 2.1, -0.49, 'white', shower)
  cylinder(0.16, 0.16, 0.045, 0.22, 2.075, -0.32, 'darkGray', shower)
  for (const x of [0.1, 0.34]) oval(0.04, 0.04, 0.035, x, 1.07, -0.61, 'mustard', shower)
  block(0.4, 0.045, 0.2, -0.32, 1.03, -0.58, 'white', shower)
  for (const [x, color, h] of [[-0.41, 'bedroomCoral', 0.22], [-0.24, 'bedroomLilac', 0.18]]) {
    cylinder(0.047, 0.05, h, x, 1.06 + h / 2, -0.57, color, shower)
    cylinder(0.025, 0.025, 0.035, x, 1.08 + h, -0.57, 'white', shower)
  }

  const washbasin = group('washbasin', 2.65, 0, -3.86)
  block(0.94, 0.74, 0.6, 0, 0.53, 0, 'bedroomTeal', washbasin)
  for (const x of [-0.35, 0.35]) block(0.065, 0.18, 0.45, x, 0.1, 0, 'darkWood', washbasin)
  for (const y of [0.37, 0.71]) {
    block(0.85, 0.29, 0.03, 0, y, 0.32, 'bedroomTeal', washbasin)
    block(0.24, 0.025, 0.035, 0, y + 0.04, 0.35, 'mustard', washbasin)
  }
  block(1.02, 0.08, 0.73, 0, 0.95, 0, 'white', washbasin)
  oval(0.32, 0.035, 0.23, 0, 1.003, 0.04, 'blue', washbasin)
  const sinkRim = mesh(new THREE.TorusGeometry(0.25, 0.035, 8, 24), 'white', 0, 1.04, 0.04, washbasin)
  sinkRim.rotation.x = Math.PI / 2
  sinkRim.scale.set(1.3, 0.88, 1)
  cylinder(0.025, 0.025, 0.008, 0, 1.04, 0.04, 'darkGray', washbasin)
  cylinder(0.025, 0.03, 0.23, 0, 1.105, -0.22, 'mustard', washbasin)
  block(0.045, 0.04, 0.18, 0, 1.22, -0.15, 'mustard', washbasin)
  block(0.78, 0.88, 0.055, 0, 1.84, -0.44, 'bedroomLilac', washbasin, 0.025).userData.upperWall = 'back'
  block(0.65, 0.75, 0.012, 0, 1.84, -0.405, 'blue', washbasin).userData.upperWall = 'back'
  block(0.035, 0.55, 0.008, -0.19, 1.89, -0.394, 'white', washbasin).rotation.z = -0.25
  block(0.025, 0.04, 0.37, -0.5, 0.8, 0, 'mustard', washbasin)
  block(0.035, 0.35, 0.28, -0.53, 0.65, 0, 'bedroomPinkStripe', washbasin)
  cylinder(0.05, 0.055, 0.14, 0.39, 1.06, -0.1, 'bedroomCoral', washbasin)
  block(0.07, 0.025, 0.025, 0.4, 1.15, -0.1, 'mustard', washbasin)
  return bedroom
}
