import { describe, expect, it } from 'vitest'
import { furnitureCustomizers, sofaModels, furnitureStyles, shopItems } from '../../src/furniture-config.js'
import { PALETTE } from '../../src/palette.js'

describe('aanpasbare meubels', () => {
  it('heeft bureau, keuken, bed, douche en make-uptafel (de muur is bewust niet aanpasbaar)', () => {
    expect(Object.keys(furnitureCustomizers)).toEqual(['desk', 'kitchen', 'bed', 'shower', 'dresser'])
  })

  it.each(['desk', 'kitchen', 'bed', 'shower', 'dresser'])('%s heeft drie verschillende modellen met icoon en kleurkiezers', item => {
    const { models } = furnitureCustomizers[item]
    expect(models).toHaveLength(3)
    expect(new Set(models.map(model => model.key)).size).toBe(3)
    for (const model of models) {
      expect(model.label).toBeTruthy()
      expect(model.icon).toMatch(/<(rect|path)/)
      expect(model.parts.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('elke kleurkiezer verwijst naar een bestaande paletsleutel', () => {
    for (const [item, config] of Object.entries(furnitureCustomizers)) {
      const parts = config.models ? config.models.flatMap(model => model.parts) : config.parts
      for (const [key, label] of parts) {
        expect(PALETTE, `${item}: ${key}`).toHaveProperty(key)
        expect(label).toMatch(/^Kleur /)
      }
    }
  })

  it('bij het bureau horen bureau en stoel samen (één set)', () => {
    for (const model of furnitureCustomizers.desk.models) {
      expect(model.parts[0][1]).toBe('Kleur bureau en stoel')
    }
  })
})

describe('sofa', () => {
  it('heeft drie modellen: modern, chesterfield en retro', () => {
    expect(sofaModels.map(([key]) => key)).toEqual(['modern', 'chesterfield', 'retro'])
    for (const [, label, icon] of sofaModels) {
      expect(label).toBeTruthy()
      expect(icon).toContain('<rect')
    }
  })
})

describe('winkel', () => {
  it('heeft drie stijlen', () => {
    expect(furnitureStyles.map(([key]) => key)).toEqual(['original', 'girly', 'colorful'])
  })

  it('elk meubel in de winkel heeft een naam, prijs, kleur en themagroep', () => {
    for (const [name, price, color, group] of shopItems.furniture) {
      expect(name).toBeTruthy()
      expect(price).toMatch(/^€ \d+,\d{2}$/)
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      expect(group).toBeTruthy()
    }
  })
})
