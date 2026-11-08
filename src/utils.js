// Kleine hulpfuncties zonder DOM of WebGL, zodat ze los te testen zijn.

/** Maakt een hexkleur donkerder (amount 0–1). Ongeldige invoer geeft de kleur ongewijzigd terug. */
export function darkenHex(hex, amount = 0.25) {
  if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) return hex
  const value = parseInt(hex.slice(1), 16)
  const factor = 1 - Math.min(1, Math.max(0, amount))
  const channel = shift => Math.round(((value >> shift) & 255) * factor)
  return `#${[16, 8, 0].map(shift => channel(shift).toString(16).padStart(2, '0')).join('')}`
}

/** Leest JSON uit localStorage; bij een fout, lege waarde of geen object komt `fallback` terug. */
export function readStoredJSON(storage, key, fallback = {}) {
  try {
    const value = JSON.parse(storage?.getItem(key) ?? 'null')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback
  } catch {
    return fallback
  }
}

/** Houdt alleen keuzes over die in de lijst met geldige waarden staan (bv. opgeslagen modellen). */
export function keepValidChoices(choices, validByKey) {
  return Object.fromEntries(Object.entries(choices || {})
    .filter(([key, value]) => validByKey[key]?.includes(value)))
}

/** Begrenst een getal tussen min en max (bv. de stap in de tutorial). */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
