import { describe, expect, it } from 'vitest'
import { clamp, darkenHex, keepValidChoices, readStoredJSON } from '../../src/utils.js'

const memoryStorage = values => ({ getItem: key => (key in values ? values[key] : null) })

describe('darkenHex', () => {
  it('maakt een kleur donkerder', () => {
    expect(darkenHex('#ffffff', 0.5)).toBe('#808080')
    expect(darkenHex('#d94f70')).toBe('#a33b54')
  })

  it('laat zwart zwart en houdt 0 % ongewijzigd', () => {
    expect(darkenHex('#000000')).toBe('#000000')
    expect(darkenHex('#abcdef', 0)).toBe('#abcdef')
  })

  it('begrenst de hoeveelheid tussen 0 en 1', () => {
    expect(darkenHex('#abcdef', 5)).toBe('#000000')
    expect(darkenHex('#abcdef', -1)).toBe('#abcdef')
  })

  it('geeft ongeldige invoer ongewijzigd terug', () => {
    expect(darkenHex('rood')).toBe('rood')
    expect(darkenHex('#fff')).toBe('#fff')
    expect(darkenHex(undefined)).toBeUndefined()
  })
})

describe('readStoredJSON', () => {
  it('leest een opgeslagen object', () => {
    expect(readStoredJSON(memoryStorage({ k: '{"desk":"gaming"}' }), 'k')).toEqual({ desk: 'gaming' })
  })

  it('geeft de fallback bij ontbrekende, kapotte of verkeerde waarden', () => {
    expect(readStoredJSON(memoryStorage({}), 'k')).toEqual({})
    expect(readStoredJSON(memoryStorage({ k: '{kapot' }), 'k', { a: 1 })).toEqual({ a: 1 })
    expect(readStoredJSON(memoryStorage({ k: '[1,2]' }), 'k')).toEqual({})
    expect(readStoredJSON(memoryStorage({ k: '"tekst"' }), 'k')).toEqual({})
    expect(readStoredJSON(memoryStorage({ k: 'null' }), 'k')).toEqual({})
  })

  it('werkt ook zonder storage (bv. geblokkeerde cookies)', () => {
    expect(readStoredJSON(undefined, 'k')).toEqual({})
    const throwing = { getItem: () => { throw new Error('SecurityError') } }
    expect(readStoredJSON(throwing, 'k', { ok: true })).toEqual({ ok: true })
  })
})

describe('keepValidChoices', () => {
  const valid = { desk: ['modern', 'gaming', 'vintage'], kitchen: ['classic', 'sleek', 'retro'] }

  it('houdt geldige keuzes', () => {
    expect(keepValidChoices({ desk: 'gaming', kitchen: 'retro' }, valid)).toEqual({ desk: 'gaming', kitchen: 'retro' })
  })

  it('gooit onbekende modellen en meubels weg', () => {
    expect(keepValidChoices({ desk: 'ruimteschip', bed: 'modern', kitchen: 'sleek' }, valid)).toEqual({ kitchen: 'sleek' })
  })

  it('werkt met lege of ontbrekende invoer', () => {
    expect(keepValidChoices(undefined, valid)).toEqual({})
    expect(keepValidChoices({}, valid)).toEqual({})
  })
})

describe('clamp', () => {
  it('begrenst de tutorialstap', () => {
    expect(clamp(-1, 0, 6)).toBe(0)
    expect(clamp(3, 0, 6)).toBe(3)
    expect(clamp(99, 0, 6)).toBe(6)
  })
})
