// Kleurpaletten van Pixel Home.
// PALETTE = de oorspronkelijke kleuren (sleutel = 'paletteKey' van een mesh).
// THEME_PALETTES = de winkelstijlen 'Roze' (girly) en 'Kleurrijk' (colorful); ontbrekende sleutels vallen terug op PALETTE.
export const PALETTE = {
  cream: '#E4D2BA',
  wallpaperBase: '#E7EFDD',
  wallpaperStripe: '#B9CFA4',
  bedroomPeach: '#F8DCCB',
  bedroomPinkBase: '#FCEEF3',
  bedroomPinkStripe: '#E8AEC5',
  bedroomLilac: '#B7A1D9',
  bedroomCoral: '#E99186',
  bedroomTeal: '#72BDB5',
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
  white: '#FFFFFF',
  blouse: '#D77C9E',
  shirt: '#426B83',
  pants: '#4A3B39',
  trousers: '#44637B',
  shoes: '#F2D6AA',
  eye: '#281A0A',
  tee: '#EFE6D6',
  shirtDark: '#2F4F63',
  denim: '#3E5873',
  denimLight: '#5E7B96',
  belt: '#3A2620',
  buckle: '#D6A84A',
  lace: '#8A6A50',
  hairLight: '#5A3D33',
  mouth: '#8E3B3B',
  cheek: '#E39A86',
  skinShade: '#B06E55',
  nightSky: '#18243A',
  parquet: '#B88D66',
  parquetLight: '#C79F77',
  parquetDark: '#AA805C',
  cushionYellow: '#F2C84B',
  sofaSeatCushion: '#94CAE2',
  sofaBackCushion: '#B0D4D2',
  pendantOrange: '#F0781C',
  catOrange: '#E9953D',
  catStripe: '#AE541F',
  catCream: '#FFE0AE',
  rugRed: '#8F3835',
  rugCoral: '#B9574C',
  rugGold: '#D6A477',
  rugIvory: '#E4CFAB',
  crtGreen: '#788A73',
  // Eigen sleutels per meubeldeel, zodat je ze apart kunt aanpassen
  deskBody: '#E4D2BA',
  deskChair: '#778856',
  kitchenFront: '#E4D2BA',
  kitchenTop: '#502E1C',
  kitchenHandle: '#502E1C',
  // Bureausets (bureau + stoel horen samen) en keukenmodellen
  deskGaming: '#2B2B36',
  deskGamingChair: '#C8354B',
  deskAccent: '#5FE1F2',
  deskVintage: '#8A5A3B',
  deskVintageChair: '#7E9C6A',
  kitchenSleek: '#3E4A52',
  kitchenSleekTop: '#EDEDE8',
  kitchenSleekHandle: '#C9A86A',
  kitchenRetro: '#9FD3C7',
  kitchenRetroTop: '#F4EBDD',
  kitchenRetroAccent: '#D94F4F',
  chrome: '#C9CED3',
  // Slaapkamer: bed, douche en make-uptafel (elk drie modellen)
  bedFrame: '#502E1C',
  bedCover: '#72BDB5',
  bedPillow: '#B7A1D9',
  bedCanopyFrame: '#F4EBDD',
  bedCanopyCover: '#E9A8B8',
  bedCanopyCurtain: '#FFFFFF',
  bedScandiFrame: '#C9B79C',
  bedScandiCover: '#F2EDE4',
  bedScandiThrow: '#D9894F',
  bedScandiSeam: '#B5A285',
  showerTile: '#FFFFFF',
  showerFrame: '#FFFFFF',
  showerFixture: '#414242',
  showerTub: '#F4EBDD',
  showerCurtain: '#9FD3C7',
  showerRainTile: '#6E9C84',
  showerRainFrame: '#2B2B36',
  showerWood: '#A0714F',
  dresserBody: '#502E1C',
  dresserTop: '#E4D2BA',
  dresserHandle: '#A69060',
  dresserHollywood: '#F6E1E6',
  dresserHollywoodTop: '#FFFFFF',
  dresserHollywoodFrame: '#D6A84A',
  dresserBoho: '#C8A27A',
  dresserBohoTop: '#E9D8B4',
  dresserBohoMirror: '#8A5A3B',
}

export const THEME_PALETTES = {
  girly: {
    cream: '#F6C8DA', tan: '#F2AFCB', mustard: '#E8B45C', olive: '#A7B879',
    plantGreen: '#54794D', terracotta: '#D77C9E', darkWood: '#89536D', blue: '#A9D7EC',
    sky: '#A9DDF4', sofaSeatCushion: '#A9DDF4', sofaBackCushion: '#A9D7EC',
    darkGray: '#51404F', brown: '#B67991', lampGlow: '#FFE8A3',
  },
  colorful: {
    cream: '#FFD166', tan: '#06D6A0', mustard: '#FF9F1C', olive: '#8AC926',
    plantGreen: '#198754', terracotta: '#EF476F', darkWood: '#3A3151', blue: '#118AB2',
    sky: '#90E0EF', sofaSeatCushion: '#90E0EF', sofaBackCushion: '#118AB2',
    darkGray: '#25233A', brown: '#D1495B', lampGlow: '#FFF3A0',
  },
}
// De meubeldeel-sleutels volgen in elke stijl de kleur waar ze van afgeleid zijn
for (const palette of Object.values(THEME_PALETTES)) {
  palette.deskBody ??= palette.cream
  palette.deskChair ??= palette.olive
  palette.kitchenFront ??= palette.cream
  palette.kitchenTop ??= palette.darkWood
  palette.kitchenHandle ??= palette.darkWood
  palette.deskGamingChair ??= palette.terracotta
  palette.deskVintage ??= palette.darkWood
  palette.deskVintageChair ??= palette.olive
  palette.kitchenRetro ??= palette.blue
}

/** Kleur van een paletsleutel in een stijl, met eigen kleuren (custom) als voorrang. */
export function resolveColor(key, style = 'original', custom = {}) {
  const palette = style === 'original' ? PALETTE : THEME_PALETTES[style]
  return custom?.[key] ?? palette?.[key] ?? PALETTE[key]
}
