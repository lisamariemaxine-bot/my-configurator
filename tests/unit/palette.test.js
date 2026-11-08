import { describe, expect, it } from 'vitest'
import { PALETTE, THEME_PALETTES, resolveColor } from '../../src/palette.js'

const HEX = /^#[0-9a-f]{6}$/i

describe('PALETTE', () => {
  it('bevat alleen geldige hexkleuren', () => {
    for (const [key, color] of Object.entries(PALETTE)) expect(color, key).toMatch(HEX)
  })

  it('heeft de kleursleutels voor elk sofa-, bureau- en keukenmodel', () => {
    for (const key of ['blue', 'sky', 'sofaSeatCushion', 'sofaBackCushion', 'cushionYellow', 'olive',
      'deskBody', 'deskChair', 'deskGaming', 'deskGamingChair', 'deskAccent', 'deskVintage', 'deskVintageChair',
      'kitchenFront', 'kitchenTop', 'kitchenHandle', 'kitchenSleek', 'kitchenSleekTop', 'kitchenSleekHandle',
      'kitchenRetro', 'kitchenRetroTop', 'kitchenRetroAccent', 'wallpaperBase', 'wallpaperStripe']) {
      expect(PALETTE, key).toHaveProperty(key)
    }
  })
})

describe('THEME_PALETTES (winkelstijlen)', () => {
  it('kent de stijlen Roze en Kleurrijk', () => {
    expect(Object.keys(THEME_PALETTES)).toEqual(['girly', 'colorful'])
  })

  it('gebruikt alleen sleutels die ook in PALETTE bestaan', () => {
    for (const [style, palette] of Object.entries(THEME_PALETTES)) {
      for (const key of Object.keys(palette)) expect(PALETTE, `${style}.${key}`).toHaveProperty(key)
    }
  })

  it('leidt de meubeldeel-sleutels af van hun basiskleur', () => {
    for (const palette of Object.values(THEME_PALETTES)) {
      expect(palette.deskBody).toBe(palette.cream)
      expect(palette.kitchenTop).toBe(palette.darkWood)
    }
  })
})

describe('resolveColor', () => {
  it('geeft de originele kleur zonder stijl of eigen kleur', () => {
    expect(resolveColor('sky')).toBe(PALETTE.sky)
  })

  it('gebruikt de stijlkleur als die bestaat', () => {
    expect(resolveColor('sky', 'girly')).toBe(THEME_PALETTES.girly.sky)
  })

  it('valt terug op PALETTE als een stijl de sleutel niet kent', () => {
    expect(resolveColor('wallpaperStripe', 'colorful')).toBe(PALETTE.wallpaperStripe)
  })

  it('geeft een eigen kleur altijd voorrang', () => {
    expect(resolveColor('sky', 'girly', { sky: '#123456' })).toBe('#123456')
  })

  it('crasht niet op een onbekende stijl of sleutel', () => {
    expect(resolveColor('sky', 'bestaat-niet')).toBe(PALETTE.sky)
    expect(resolveColor('bestaat-niet')).toBeUndefined()
  })
})
