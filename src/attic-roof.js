import * as THREE from 'three'

export function createAtticRoof(parent, materials) {
  const roof = new THREE.Group()
  roof.name = 'attic-roof'
  parent.add(roof)
  const eave = 8.4
  const ridge = 10.5
  const slope = (ridge - eave) / 5
  const angle = Math.atan(slope)
  const stretch = Math.hypot(1, slope)
  const rear = -4.45
  const cutaway = -1.65
  const opening = { start: 1.45, end: 3.45, back: -3.85, front: -2.2 }

  function add(geometry, color, position, wall = 'back') {
    const object = new THREE.Mesh(geometry, materials[color])
    object.position.set(...position)
    object.userData.paletteKey = color
    object.userData.upperWall = wall
    object.castShadow = true
    object.receiveShadow = true
    roof.add(object)
    return object
  }
  function panel(side, start, end, back, front, color, thickness = 0.08, lift = 0) {
    const middle = (start + end) / 2
    const object = add(new THREE.BoxGeometry((end - start) * stretch, thickness, front - back), color,
      [side * middle, ridge - middle * slope + lift, (back + front) / 2])
    object.rotation.z = -side * angle
    return object
  }
  function beam(from, to, thickness = 0.14) {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    const direction = end.clone().sub(start)
    const middle = start.clone().add(end).multiplyScalar(0.5)
    const object = add(new THREE.BoxGeometry(thickness, direction.length(), thickness), 'darkWood', middle.toArray())
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
    return object
  }

  // The roof is cut open at the front; actual openings surround the roof windows.
  for (const side of [-1, 1]) {
    const patches = [
      [0, opening.start, rear, cutaway],
      [opening.end, 5.12, rear, cutaway],
      [opening.start, opening.end, rear, opening.back],
      [opening.start, opening.end, opening.front, cutaway],
    ]
    for (const patch of patches) {
      panel(side, ...patch, 'cream')
      panel(side, ...patch, 'terracotta', 0.065, 0.085)
    }
    const glass = panel(side, opening.start, opening.end, opening.back, opening.front, 'blue', 0.018, 0.025)
    glass.name = `skylight-${side}`
    glass.castShadow = false
    glass.receiveShadow = false
    for (const edge of [opening.start, opening.end]) {
      panel(side, edge - 0.055, edge + 0.055, opening.back - 0.06, opening.front + 0.06, 'white', 0.09, 0.08)
    }
    for (const edge of [opening.back, opening.front]) {
      panel(side, opening.start, opening.end, edge - 0.055, edge + 0.055, 'white', 0.09, 0.08)
    }
    const middle = (opening.start + opening.end) / 2
    panel(side, middle - 0.025, middle + 0.025, opening.back, opening.front, 'cream', 0.06, 0.085)
    panel(side, opening.start + 0.18, opening.start + 0.26, opening.back + 0.13, opening.front - 0.13, 'white', 0.012, 0.042).castShadow = false
    for (const z of [rear + 0.06, cutaway]) {
      beam([0, ridge - 0.04, z], [side * 5.12, eave - 0.08, z], 0.2)
    }
    for (const distance of [0.8, 4.15]) {
      beam([side * distance, ridge - distance * slope - 0.07, rear],
        [side * distance, ridge - distance * slope - 0.07, cutaway], 0.12)
    }
    beam([side * 4.84, eave, rear], [side * 4.84, eave, 4.45], 0.16)
    // Short tile joints keep the outer roof edge in the room's pixel style.
    for (let tile = 0; tile < 12; tile++) {
      panel(side, tile * 0.43, tile * 0.43 + 0.4, cutaway - 0.07, cutaway + 0.07, 'rugCoral', 0.08, 0.16)
    }
  }
  beam([0, ridge, rear - 0.1], [0, ridge, cutaway + 0.1], 0.22)

  const gable = new THREE.Shape()
  gable.moveTo(-5, 0)
  gable.lineTo(5, 0)
  gable.lineTo(0, ridge - eave)
  gable.closePath()
  const roundWindowY = 1.12
  const hole = new THREE.Path()
  hole.absarc(0, roundWindowY, 0.29, 0, Math.PI * 2, true)
  gable.holes.push(hole)
  add(new THREE.ExtrudeGeometry(gable, { depth: 0.1, bevelEnabled: false }), 'cream', [0, eave, rear - 0.05])
  const roundGlass = add(new THREE.CircleGeometry(0.29, 24), 'blue', [0, eave + roundWindowY, rear + 0.06])
  roundGlass.castShadow = false
  const frame = add(new THREE.TorusGeometry(0.31, 0.045, 6, 24), 'white', [0, eave + roundWindowY, rear + 0.08])
  frame.name = 'round-attic-window'
  beam([-4.85, eave + 0.02, rear + 0.13], [4.85, eave + 0.02, rear + 0.13], 0.12)
  beam([0, 5.2, rear + 0.15], [0, eave + 0.5, rear + 0.15], 0.11)
  return roof
}
