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
  // Een model van een aanpasbaar meubel: living-room.js toont er telkens één (via userData.modelOf/modelName)
  function model(target, item, name) {
    const result = new THREE.Group()
    result.name = `${item}-${name}`
    result.userData.modelOf = item
    result.userData.modelName = name
    target.add(result)
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

  // Bed: drie modellen. Het mannetje slaapt op bed-lokaal (0, 0.8, 0.6) met zijn hoofd naar het hoofdeinde,
  // dus elk model houdt de matras bovenaan op ±0.78 en het dekbed op ±0.9.
  const bed = group('bed', -0.9, 0, -2.45)

  // Model 1: gezellig (houten spijlenbed, teal dekbed)
  const cozy = model(bed, 'bed', 'cozy')
  for (const x of [-1.12, 1.12]) for (const z of [-1.65, 1.65]) block(0.13, 0.38, 0.13, x, 0.22, z, 'bedFrame', cozy)
  block(2.55, 0.24, 3.7, 0, 0.38, 0, 'bedFrame', cozy)
  block(2.43, 0.29, 3.55, 0, 0.64, 0, 'white', cozy, 0.12)
  block(2.62, 0.12, 0.16, 0, 1.49, -1.78, 'bedFrame', cozy)
  for (let slat = 0; slat < 12; slat++) block(0.065, 0.96, 0.08, -1.18 + slat * 0.215, 0.96, -1.78, 'bedFrame', cozy)
  for (const x of [-1.25, 1.25]) block(0.12, 1.23, 0.13, x, 0.94, -1.78, 'bedFrame', cozy)
  block(2.47, 0.17, 2.6, 0, 0.82, 0.46, 'bedCover', cozy, 0.08)
  block(2.47, 0.11, 0.36, 0, 0.94, -0.68, 'cream', cozy, 0.05)
  for (const side of [-1, 1]) block(0.09, 0.4, 2.5, side * 1.23, 0.65, 0.5, 'bedCover', cozy)
  for (let stitch = 0; stitch < 14; stitch++) {
    for (const z of [-0.38, 0.7, 1.4]) block(0.09, 0.008, 0.022, -1.1 + stitch * 0.17, 0.912, z, 'cream', cozy)
  }
  for (const x of [-0.62, 0.62]) {
    const pillow = block(0.99, 0.27, 0.64, x, 0.93, -1.12, 'bedPillow', cozy, 0.13)
    pillow.rotation.x = -0.12
    block(0.84, 0.016, 0.022, x, 1.057, -0.86, 'bedCover', cozy)
  }
  const accent = block(0.5, 0.38, 0.2, -0.12, 1.04, -0.88, 'rugCoral', cozy, 0.09)
  accent.rotation.z = -0.16
  // Crescent cushion, built as a single curved silhouette.
  const moonShape = new THREE.Shape()
  moonShape.absarc(0, 0, 0.25, Math.PI * 0.2, Math.PI * 1.8, false)
  moonShape.quadraticCurveTo(-0.08, 0, 0.25 * Math.cos(Math.PI * 0.2), 0.25 * Math.sin(Math.PI * 0.2))
  const moon = mesh(new THREE.ExtrudeGeometry(moonShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 2, steps: 1 }), 'cushionYellow', 0.48, 1.1, -0.76, cozy)
  moon.rotation.z = -0.25
  // Folded blanket on the foot of the bed.
  for (let fold = 0; fold < 3; fold++) block(0.9, 0.06, 0.56, 0.6, 0.96 + fold * 0.065, 1.2, fold % 2 ? 'cream' : 'bedroomLilac', cozy, 0.025)

  // Model 2: hemelbed (vier palen met lijst, voile, ruche aan het voeteneinde)
  const canopy = model(bed, 'bed', 'canopy')
  for (const x of [-1.22, 1.22]) for (const z of [-1.72, 1.72]) {
    cylinder(0.05, 0.05, 2.0, x, 1.0, z, 'bedCanopyFrame', canopy)
    oval(0.065, 0.065, 0.065, x, 2.04, z, 'bedCanopyFrame', canopy)
  }
  for (const z of [-1.72, 1.72]) block(2.5, 0.06, 0.06, 0, 1.97, z, 'bedCanopyFrame', canopy)
  for (const x of [-1.22, 1.22]) block(0.06, 0.06, 3.5, x, 1.97, 0, 'bedCanopyFrame', canopy)
  block(2.4, 0.3, 3.46, 0, 0.35, 0, 'bedCanopyFrame', canopy)
  block(2.32, 0.28, 3.38, 0, 0.64, 0, 'white', canopy, 0.1)
  block(2.36, 0.15, 2.5, 0, 0.84, 0.45, 'bedCanopyCover', canopy, 0.07)
  for (const side of [-1, 1]) block(0.06, 0.42, 2.42, side * 1.19, 0.66, 0.5, 'bedCanopyCover', canopy)
  // Ruche aan het voeteneinde: een dicht stuk stof met de plooien ervóór, zodat het frame er niet tussendoor piept
  block(2.38, 0.42, 0.04, 0, 0.63, 1.75, 'bedCanopyCover', canopy, 0)
  for (let frill = 0; frill < 12; frill++) cylinder(0.05, 0.065, 0.42, -1.1 + frill * 0.2, 0.63, 1.8, 'bedCanopyCover', canopy)
  for (const x of [-0.55, 0.55]) block(0.9, 0.24, 0.55, x, 0.9, -1.15, 'white', canopy, 0.12).rotation.x = -0.12
  block(0.62, 0.2, 0.18, 0, 0.98, -0.84, 'bedCanopyCover', canopy, 0.08)
  // Voile langs de palen, bovenaan een strook stof
  for (const x of [-1.22, 1.22]) for (const z of [-1.72, 1.72]) {
    cylinder(0.09, 0.15, 1.7, x * 0.97, 1.05, z * 0.98, 'bedCanopyCurtain', canopy)
    // Bindring ruim om het gordijn heen (anders steekt hij half door de stof en flikkert de kleur)
    const tie = mesh(new THREE.TorusGeometry(0.15, 0.022, 6, 24), 'bedCanopyFrame', x * 0.97, 1.0, z * 0.98, canopy)
    tie.rotation.x = Math.PI / 2
  }
  // Strook voile ónder de lijst (niet erin), een tikje naar binnen
  for (const z of [-1.69, 1.69]) block(2.36, 0.13, 0.03, 0, 1.84, z, 'bedCanopyCurtain', canopy, 0)
  for (const x of [-1.19, 1.19]) block(0.03, 0.13, 3.34, x, 1.84, 0, 'bedCanopyCurtain', canopy, 0)

  // Model 3: scandi (gestoffeerd hoofdbord, linnen dekbed, plaid)
  const scandi = model(bed, 'bed', 'scandi')
  block(2.6, 1.3, 0.24, 0, 1.05, -1.76, 'bedScandiFrame', scandi, 0.11)
  const headRoll = cylinder(0.12, 0.12, 2.6, 0, 1.7, -1.76, 'bedScandiFrame', scandi)
  headRoll.rotation.z = Math.PI / 2
  for (let seam = 0; seam < 5; seam++) block(0.025, 1.05, 0.012, -1.0 + seam * 0.5, 1.05, -1.637, 'bedScandiSeam', scandi, 0)
  block(2.55, 0.36, 3.5, 0, 0.36, 0.05, 'bedScandiFrame', scandi, 0.08)
  for (const x of [-1.15, 1.15]) for (const z of [-1.6, 1.7]) cylinder(0.04, 0.03, 0.18, x, 0.09, z, 'darkWood', scandi)
  block(2.43, 0.26, 3.35, 0, 0.65, 0.05, 'white', scandi, 0.1)
  block(2.47, 0.15, 2.55, 0, 0.83, 0.45, 'bedScandiCover', scandi, 0.07)
  for (const side of [-1, 1]) block(0.07, 0.38, 2.45, side * 1.23, 0.66, 0.5, 'bedScandiCover', scandi)
  block(2.52, 0.05, 0.72, 0, 0.93, 1.25, 'bedScandiThrow', scandi, 0.02)
  for (const side of [-1, 1]) block(0.05, 0.32, 0.72, side * 1.26, 0.78, 1.25, 'bedScandiThrow', scandi, 0.02)
  for (const x of [-0.6, 0.6]) block(0.95, 0.26, 0.6, x, 0.92, -1.15, 'white', scandi, 0.12).rotation.x = -0.12
  block(0.7, 0.22, 0.18, 0, 0.99, -0.86, 'bedScandiThrow', scandi, 0.08)

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

  // Make-uptafel: drie modellen. Het mannetje staat ervoor op dresser-lokaal x -0.85 en kijkt naar
  // de spiegel op z -0.45; de voorkant blijft dus achter x -0.52.
  const dresser = group('dresser', 4.2, 0, -0.35)

  // Model 1: klassiek (ladekast met staande spiegel)
  const classicDresser = model(dresser, 'dresser', 'classic')
  block(0.92, 1.02, 2.5, 0, 0.62, 0, 'dresserBody', classicDresser)
  block(1.03, 0.1, 2.62, 0, 1.18, 0, 'dresserTop', classicDresser)
  for (const y of [0.33, 0.65, 0.97]) {
    block(0.06, 0.26, 2.28, -0.49, y, 0, 'dresserBody', classicDresser)
    for (const z of [-0.65, 0.65]) block(0.06, 0.04, 0.25, -0.54, y, z, 'dresserHandle', classicDresser)
  }
  for (const z of [-1.02, 1.02]) block(0.65, 0.15, 0.12, 0, 0.12, z, 'dresserBody', classicDresser)
  // Standing mirror faces into the room.
  block(0.09, 1.04, 0.75, 0.14, 1.88, -0.45, 'dresserBody', classicDresser, 0.04)
  block(0.012, 0.9, 0.62, 0.087, 1.88, -0.45, 'blue', classicDresser)
  block(0.014, 0.68, 0.04, 0.076, 1.93, -0.6, 'white', classicDresser).rotation.x = -0.24
  block(0.5, 0.08, 0.83, 0.02, 1.28, -0.45, 'dresserBody', classicDresser)
  for (const [z, color, height] of [[0.25, 'blouse', 0.24], [0.48, 'blue', 0.31], [0.69, 'olive', 0.2]]) {
    cylinder(0.07, 0.09, height, -0.08, 1.23 + height / 2, z, color, classicDresser)
    cylinder(0.035, 0.035, 0.055, -0.08, 1.26 + height, z, 'dresserHandle', classicDresser)
  }
  oval(0.22, 0.25, 0.22, -0.06, 1.46, 1.03, 'lampGlow', classicDresser)
  cylinder(0.18, 0.2, 0.045, -0.06, 1.25, 1.03, 'dresserBody', classicDresser)
  plant(0.08, 1.23, -1.05, 0.7, classicDresser, 'succulent')

  // Model 2: Hollywood (slanke tafel op gouden pootjes, spiegel met lampjes rondom)
  const hollywood = model(dresser, 'dresser', 'hollywood')
  block(0.78, 0.08, 2.2, 0.05, 1.05, 0, 'dresserHollywoodTop', hollywood)
  block(0.72, 0.17, 2.06, 0.05, 0.93, 0, 'dresserHollywood', hollywood)
  for (const z of [-0.6, 0.6]) {
    block(0.02, 0.12, 0.8, -0.32, 0.93, z, 'dresserHollywoodTop', hollywood)
    oval(0.03, 0.03, 0.03, -0.34, 0.93, z, 'dresserHollywoodFrame', hollywood)
  }
  for (const x of [-0.28, 0.38]) for (const z of [-0.98, 0.98]) cylinder(0.035, 0.02, 0.86, x, 0.43, z, 'dresserHollywoodFrame', hollywood)
  block(0.07, 1.14, 1.26, 0.32, 1.72, -0.45, 'dresserHollywood', hollywood, 0.04)
  block(0.012, 0.94, 1.04, 0.28, 1.72, -0.45, 'blue', hollywood)
  block(0.014, 0.7, 0.05, 0.27, 1.78, -0.7, 'white', hollywood).rotation.x = -0.24
  for (let bulb = 0; bulb < 6; bulb++) oval(0.045, 0.045, 0.045, 0.27, 2.24, -0.95 + bulb * 0.2, 'lampGlow', hollywood)
  for (const z of [-1.03, 0.13]) for (let bulb = 0; bulb < 5; bulb++) oval(0.045, 0.045, 0.045, 0.27, 1.3 + bulb * 0.19, z, 'lampGlow', hollywood)
  for (const [z, color, height] of [[0.35, 'blouse', 0.2], [0.55, 'dresserHollywoodFrame', 0.26], [0.75, 'bedroomCoral', 0.16]]) {
    cylinder(0.06, 0.07, height, -0.05, 1.09 + height / 2, z, color, hollywood)
  }
  cylinder(0.08, 0.07, 0.18, -0.05, 1.18, 0.98, 'dresserHollywoodTop', hollywood)
  // Fluwelen krukje op gouden pootjes, naast de tafel (vóór de spiegel staat het mannetje)
  const stool = new THREE.Group()
  stool.position.set(-0.62, 0, 0.62)
  hollywood.add(stool)
  oval(0.26, 0.1, 0.26, 0, 0.62, 0, 'dresserHollywood', stool)
  cylinder(0.25, 0.22, 0.1, 0, 0.55, 0, 'dresserHollywood', stool)
  ring(0.24, 0, 0.5, 0, 'dresserHollywoodFrame', stool)
  for (let leg = 0; leg < 4; leg++) {
    const angle = leg * Math.PI / 2 + Math.PI / 4
    const foot = cylinder(0.022, 0.014, 0.5, Math.cos(angle) * 0.16, 0.25, Math.sin(angle) * 0.16, 'dresserHollywoodFrame', stool)
    foot.rotation.set(Math.sin(angle) * 0.14, 0, -Math.cos(angle) * 0.14)
  }
  oval(0.06, 0.04, 0.06, 0, 0.71, 0, 'dresserHollywoodFrame', stool)
  for (const tilt of [-0.2, 0, 0.2]) cylinder(0.012, 0.012, 0.22, -0.05 + tilt * 0.1, 1.33, 0.98 + tilt * 0.1, 'dresserHollywoodFrame', hollywood).rotation.x = tilt

  // Model 3: boho (kast met rotan deurtjes, boogspiegel, plantje)
  const boho = model(dresser, 'dresser', 'boho')
  block(0.86, 0.86, 2.34, 0, 0.6, 0, 'dresserBoho', boho)
  block(0.94, 0.06, 2.44, 0, 1.06, 0, 'dresserBoho', boho)
  for (const z of [-0.78, 0, 0.78]) {
    block(0.03, 0.7, 0.68, -0.44, 0.6, z, 'dresserBohoTop', boho)
    for (let cane = 0; cane < 6; cane++) block(0.012, 0.66, 0.012, -0.458, 0.6, z - 0.28 + cane * 0.112, 'dresserBohoMirror', boho, 0)
    for (let cane = 0; cane < 6; cane++) block(0.012, 0.012, 0.64, -0.458, 0.32 + cane * 0.11, z, 'dresserBohoMirror', boho, 0)
    oval(0.03, 0.03, 0.03, -0.47, 0.8, z + 0.25, 'dresserBohoMirror', boho)
  }
  for (const x of [-0.32, 0.32]) for (const z of [-1.05, 1.05]) cylinder(0.035, 0.025, 0.18, x, 0.09, z, 'dresserBohoMirror', boho)
  block(0.05, 0.85, 0.72, 0.22, 1.52, -0.45, 'dresserBohoMirror', boho)
  block(0.012, 0.78, 0.6, 0.19, 1.52, -0.45, 'blue', boho)
  const arch = mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.05, 24, 1, false, 0, Math.PI), 'dresserBohoMirror', 0.22, 1.94, -0.45, boho)
  arch.rotation.z = Math.PI / 2
  const archGlass = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.012, 24, 1, false, 0, Math.PI), 'blue', 0.19, 1.94, -0.45, boho)
  archGlass.rotation.z = Math.PI / 2
  plant(0.05, 1.09, 0.75, 0.85, boho, 'monstera')
  for (const [z, height] of [[0.15, 0.18], [0.3, 0.12]]) {
    cylinder(0.045, 0.045, height, -0.1, 1.09 + height / 2, z, 'cream', boho)
    oval(0.02, 0.035, 0.02, -0.1, 1.12 + height, z, 'lampGlow', boho)
  }

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
  // De hanglamp en de staande lamp werpen zelf geen schaduw (die zag eruit als vlekken op vloer en muur)
  // (userData.noShadow: de vervaagcode van de bovenverdieping zet castShadow anders elke frame terug aan)
  for (const lamp of [hangingLamp, floorLamp]) lamp.traverse(object => {
    object.castShadow = false
    object.userData.noShadow = true
  })
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
  // Douche: drie modellen. Het mannetje staat op douche-lokaal (-0.14, 0.14, 0.2) op de douchevloer (±0.14).
  const shower = group('shower', 4.04, 0, -3.55)
  const backTile = (target, x, y, color) => {
    const tile = block(0.34, 0.3, 0.035, x, y, -0.72, color, target, 0.006)
    tile.userData.upperWall = 'back'
    return tile
  }
  const markGlass = glass => {
    glass.userData.surfaceOpacity = 0.2
    glass.castShadow = false
    glass.receiveShadow = false
  }

  // Model 1: glas (witte tegels, glazen wand)
  const glassShower = model(shower, 'shower', 'glass')
  block(1.42, 0.12, 1.4, 0, 0.07, 0, 'white', glassShower)
  block(1.22, 0.018, 1.2, 0, 0.139, 0, 'white', glassShower)
  cylinder(0.055, 0.055, 0.008, 0.25, 0.154, -0.27, 'showerFixture', glassShower)
  for (let row = 0; row < 7; row++) for (let column = 0; column < 4; column++) backTile(glassShower, -0.525 + column * 0.35, 0.3 + row * 0.31, 'showerTile')
  for (const x of [-0.7, 0.7]) {
    block(0.035, 2.22, 0.035, x, 1.24, 0.68, 'showerFrame', glassShower)
    block(0.035, 0.035, 1.4, x, 2.34, 0, 'showerFrame', glassShower)
  }
  markGlass(block(0.016, 2.13, 1.32, -0.69, 1.24, 0, 'white', glassShower, 0))
  markGlass(block(0.5, 2.13, 0.016, 0.43, 1.24, 0.67, 'white', glassShower, 0))
  block(0.035, 0.25, 0.035, 0.19, 1.3, 0.7, 'showerFixture', glassShower)
  cylinder(0.022, 0.022, 1.25, 0.22, 1.48, -0.64, 'showerFrame', glassShower)
  block(0.045, 0.045, 0.33, 0.22, 2.1, -0.49, 'showerFrame', glassShower)
  cylinder(0.16, 0.16, 0.045, 0.22, 2.075, -0.32, 'showerFixture', glassShower)
  for (const x of [0.1, 0.34]) oval(0.04, 0.04, 0.035, x, 1.07, -0.61, 'mustard', glassShower)
  block(0.4, 0.045, 0.2, -0.32, 1.03, -0.58, 'white', glassShower)
  for (const [x, color, h] of [[-0.41, 'bedroomCoral', 0.22], [-0.24, 'bedroomLilac', 0.18]]) {
    cylinder(0.047, 0.05, h, x, 1.06 + h / 2, -0.57, color, glassShower)
    cylinder(0.025, 0.025, 0.035, x, 1.08 + h, -0.57, 'white', glassShower)
  }

  // Model 2: bad op pootjes met douchegordijn
  const tub = model(shower, 'shower', 'tub')
  for (let row = 0; row < 7; row++) for (let column = 0; column < 4; column++) backTile(tub, -0.525 + column * 0.35, 0.3 + row * 0.31, 'white')
  mesh(new RoundedBoxGeometry(0.98, 0.6, 1.36, 4, 0.2), 'showerTub', 0, 0.46, 0, tub)
  block(0.8, 0.04, 1.18, 0, 0.75, 0, 'white', tub, 0.015)
  block(0.72, 0.02, 1.1, 0, 0.73, 0, 'sky', tub, 0)
  for (const x of [-0.36, 0.36]) for (const z of [-0.5, 0.5]) oval(0.06, 0.09, 0.06, x, 0.09, z, 'showerFixture', tub)
  cylinder(0.02, 0.02, 1.62, 0, 1.43, -0.66, 'showerFixture', tub)
  block(0.04, 0.04, 0.24, 0, 2.22, -0.55, 'showerFixture', tub)
  cylinder(0.12, 0.12, 0.04, 0, 2.2, -0.43, 'showerFixture', tub)
  for (const side of [-1, 1]) oval(0.035, 0.035, 0.035, side * 0.1, 0.92, -0.64, 'showerFixture', tub)
  block(1.02, 0.03, 0.03, 0, 2.32, 0.68, 'showerFixture', tub)
  for (const x of [-0.5, 0.5]) block(0.03, 0.03, 1.4, x, 2.32, 0, 'showerFixture', tub)
  for (let fold = 0; fold < 6; fold++) cylinder(0.05, 0.065, 1.5, -0.45 + fold * 0.085, 1.55, 0.68, 'showerCurtain', tub)
  for (let fold = 0; fold < 8; fold++) cylinder(0.05, 0.065, 1.5, -0.5, 1.55, -0.6 + fold * 0.165, 'showerCurtain', tub)
  // Dicht doek achter de plooien: vanuit geen enkele hoek kijk je tussen de plooien door
  const curtainSheet = (w, d, x, z) => {
    const sheet = block(w, 1.5, d, x, 1.55, z, 'showerCurtain', tub, 0)
    sheet.material = sheet.material.clone()
    sheet.material.side = THREE.DoubleSide
    return sheet
  }
  curtainSheet(0.5, 0.02, -0.23, 0.68)
  curtainSheet(0.02, 1.36, -0.5, 0.06)
  block(0.5, 0.02, 0.34, 0, 0.012, 1.0, 'bedroomPinkStripe', tub, 0.01)

  // Model 3: inloopdouche (zwart frame, groene tegels, houten vlonder)
  const rain = model(shower, 'shower', 'rain')
  block(1.42, 0.09, 1.4, 0, 0.045, 0, 'showerRainTile', rain)
  for (let slat = 0; slat < 7; slat++) block(1.32, 0.05, 0.16, 0, 0.115, -0.6 + slat * 0.2, 'showerWood', rain, 0.01)
  for (let row = 0; row < 7; row++) for (let column = 0; column < 4; column++) backTile(rain, -0.525 + column * 0.35, 0.3 + row * 0.31, 'showerRainTile')
  for (const x of [-0.7, 0.7]) {
    block(0.04, 2.24, 0.04, x, 1.24, 0.68, 'showerRainFrame', rain)
    block(0.04, 0.04, 1.4, x, 2.34, 0, 'showerRainFrame', rain)
  }
  markGlass(block(0.016, 2.13, 1.32, -0.69, 1.24, 0, 'white', rain, 0))
  markGlass(block(0.6, 2.13, 0.016, 0.38, 1.24, 0.67, 'white', rain, 0))
  for (const y of [0.7, 1.3, 1.9]) {
    block(0.03, 0.03, 1.36, -0.69, y, 0, 'showerRainFrame', rain)
    block(0.62, 0.03, 0.03, 0.38, y, 0.67, 'showerRainFrame', rain)
  }
  block(0.5, 0.035, 0.5, -0.05, 2.28, -0.25, 'showerRainFrame', rain)
  block(0.04, 0.04, 0.45, -0.05, 2.3, -0.5, 'showerRainFrame', rain)
  block(0.42, 0.05, 0.2, -0.32, 1.03, -0.6, 'showerWood', rain)
  plant(-0.3, 1.055, -0.6, 0.55, rain, 'trailing')

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
  return { bedroom, groups: { bed, shower, dresser } }
}
