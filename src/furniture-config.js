// Instellingen van de meubels: winkelitems, pixelicoontjes, stijlen en de aanpasbare modellen.
// Wil je een meubel of model toevoegen? Begin hier (zie AGENTS.md).

export const shopItems = {
  food: [
    ['Appel', '€ 0,50', '#D97A50'],
    ['Brood', '€ 2,20', '#C7955D'],
    ['Melk', '€ 1,35', '#D8E5E0'],
    ['Kaas', '€ 3,40', '#E4BE52'],
    ['Tomaat', '€ 0,60', '#C85E4E'],
    ['Koekjes', '€ 2,10', '#A87958'],
    ['Banaan', '€ 0,45', '#E9C84A'],
    ['Sinaasappel', '€ 0,70', '#E78A32'],
    ['Aardbei', '€ 0,80', '#C94350'],
    ['Druiven', '€ 1,50', '#76558E'],
    ['Peer', '€ 0,65', '#A2B36B'],
    ['Watermeloen', '€ 2,40', '#D75B64'],
    ['Wortel', '€ 0,55', '#E8873D'],
    ['Komkommer', '€ 0,75', '#6B9C61'],
    ['Paprika', '€ 0,90', '#D95745'],
    ['Broccoli', '€ 1,20', '#56815A'],
    ['Mais', '€ 1,10', '#E2B842'],
    ['Champignons', '€ 1,65', '#B9A18A'],
    ['Ei', '€ 0,35', '#E8DDC4'],
    ['Yoghurt', '€ 1,15', '#D7B3D3'],
    ['Sap', '€ 1,80', '#D98B42'],
    ['Pizza', '€ 3,95', '#D37B46'],
    ['Taart', '€ 2,75', '#C97583'],
    ['Chocolade', '€ 1,95', '#79503E'],
  ],
  furniture: [
    ['Poef', '€ 49,00', '#778856', 'pouf'],
    ['Lamp', '€ 32,50', '#F0781C', 'sideTable'],
    ['Stoel', '€ 65,00', '#946851', 'dining'],
    ['Plant', '€ 12,00', '#54794D', 'plants'],
    ['Sofa', '€ 399,00', '#B0D4D2', 'sofa'],
    ['Salontafel', '€ 89,00', '#502E1C', 'coffeeTable'],
    ['Bureau', '€ 149,00', '#E8E3D8', 'desk'],
    ['Boekenkast', '€ 179,00', '#946851', 'bookshelf'],
    ['TV-meubel', '€ 199,00', '#502E1C', 'tv'],
    ['Vloerkleed', '€ 59,00', '#B95D4F', 'rug'],
    ['Hanglamp', '€ 45,00', '#F0781C', 'lighting'],
    ['Wanddecoratie', '€ 29,00', '#C7955D', 'wallDecor'],
    ['Eettafel', '€ 129,00', '#502E1C', 'diningTable'],
    ['Wandrek', '€ 39,00', '#946851', 'wallShelves'],
    ['Keukenblok', '€ 249,00', '#C7955D', 'kitchen'],
  ],
}

export const furnitureIcons = {
  Eettafel: '<path d="M2 4h12v1h1v3H1V5h1z" fill="#946851"/><path d="M1 7h14v1H1zM7 8h2v5H7zM4 13h8v2H4z" fill="#502E1C"/><path d="M3 5h10v1H3z" fill="#C7955D"/>',
  Wandrek: '<path d="M1 7h14v2H1zM1 13h14v2H1zM3 9h1v2H3zM12 9h1v2h-1z" fill="#946851"/><path d="M2 2h2v5H2zM9 10h2v3H9z" fill="#8DB9B6"/><path d="M5 3h2v4H5zM3 10h2v3H3z" fill="#B95D4F"/><path d="M8 4h2v3H8zM6 10h2v3H6z" fill="#E4BE52"/><path d="M11 5h3v2h-3z" fill="#54794D"/>',
  Keukenblok: '<path d="M1 6h14v2H1z" fill="#E8DDC4"/><path d="M2 8h12v6H2z" fill="#946851"/><path d="M3 9h4v4H3z" fill="#C7955D"/><path d="M8 9h5v4H8z" fill="#8DB9B6"/><path d="M5 10h1v1H5zM9 10h1v1H9zM3 14h2v1H3zM11 14h2v1h-2zM10 5h3v1h-3z" fill="#502E1C"/><path d="M4 3h3v1H5v2H4z" fill="#777267"/>',
  Bureau: '<path d="M1 8h14v2H1zM2 10h2v5H2zM10 10h4v5h-4z" fill="#CFC8B8"/><path d="M4 2h7v5H4z" fill="#502E1C"/><path d="M5 3h5v3H5z" fill="#8DB9B6"/><path d="M7 7h1v1H7zM11 11h2v1h-2zM11 13h2v1h-2z" fill="#946851"/>',
  Boekenkast: '<path d="M2 1h12v14H2z" fill="#502E1C"/><path d="M3 2h10v3H3zM3 6h10v3H3zM3 10h10v3H3z" fill="#C7955D"/><path d="M4 2h2v3H4zM8 6h2v3H8zM11 10h1v3h-1z" fill="#8DB9B6"/><path d="M7 3h2v2H7zM4 6h2v3H4zM7 10h2v3H7z" fill="#B95D4F"/><path d="M10 2h2v3h-2zM11 7h1v2h-1zM4 11h2v2H4z" fill="#E4BE52"/>',
  'TV-meubel': '<path d="M3 2h10v7H3z" fill="#502E1C"/><path d="M4 3h7v5H4z" fill="#8DB9B6"/><path d="M12 4h1v1h-1zM12 6h1v1h-1z" fill="#E4BE52"/><path d="M7 9h2v1H7zM1 10h14v3H1zM2 13h2v2H2zM12 13h2v2h-2z" fill="#946851"/><path d="M3 11h4v1H3zM9 11h4v1H9z" fill="#502E1C"/>',
  Vloerkleed: '<path d="M2 3h12v10H2z" fill="#B95D4F"/><path d="M3 4h10v8H3z" fill="#E4BE52"/><path d="M4 5h8v6H4z" fill="#E8DDC4"/><path d="M7 6h2v1h1v2H9v1H7V9H6V7h1z" fill="#B95D4F"/><path d="M1 3h1v2H1zM1 7h1v2H1zM1 11h1v2H1zM14 3h1v2h-1zM14 7h1v2h-1zM14 11h1v2h-1z" fill="#C7955D"/>',
  Hanglamp: '<path d="M6 1h4v1H6zM7 2h2v5H7z" fill="#502E1C"/><path d="M6 7h4v1h2v2h2v3H2v-3h2V8h2z" fill="#F0781C"/><path d="M5 8h2v2H5zM3 10h2v2H3z" fill="#F7A04A"/><path d="M2 13h12v1H2z" fill="#C45A0F"/><path d="M6 14h4v1H6z" fill="#E4BE52"/>',
  Wanddecoratie: '<path d="M2 2h12v12H2z" fill="#946851"/><path d="M3 3h10v10H3z" fill="#E8DDC4"/><path d="M4 4h8v7H4z" fill="#B0D4D2"/><path d="M9 5h2v2H9z" fill="#E4BE52"/><path d="M4 9h1V8h2v1h2v2H4z" fill="#54794D"/><path d="M8 10h1V9h2v1h1v2H8z" fill="#778856"/>',
  Poef: '<rect x="3" y="5" width="10" height="2" fill="#9BAE72"/><rect x="2" y="7" width="12" height="5" fill="#778856"/><rect x="3" y="12" width="10" height="1" fill="#55643C"/><rect x="2" y="7" width="2" height="5" fill="#667748"/>',
  Lamp: '<rect x="5" y="2" width="6" height="1" fill="#F7A04A"/><rect x="4" y="3" width="8" height="4" fill="#F0781C"/><rect x="3" y="7" width="10" height="1" fill="#C45A0F"/><rect x="7" y="8" width="2" height="4" fill="#5C3A24"/><rect x="5" y="12" width="6" height="2" fill="#5C3A24"/>',
  Stoel: '<rect x="3" y="1" width="2" height="8" fill="#6F4A38"/><rect x="5" y="2" width="1" height="6" fill="#946851"/><rect x="3" y="8" width="9" height="2" fill="#946851"/><rect x="3" y="10" width="2" height="5" fill="#6F4A38"/><rect x="10" y="10" width="2" height="5" fill="#6F4A38"/>',
  Plant: '<rect x="7" y="2" width="2" height="8" fill="#3D6038"/><rect x="4" y="4" width="3" height="2" fill="#54794D"/><rect x="9" y="3" width="3" height="2" fill="#54794D"/><rect x="3" y="7" width="4" height="2" fill="#54794D"/><rect x="9" y="7" width="4" height="2" fill="#54794D"/><rect x="4" y="10" width="8" height="1" fill="#D58A5A"/><rect x="5" y="11" width="6" height="4" fill="#B96B3F"/>',
  Sofa: '<rect x="3" y="3" width="10" height="5" fill="#B0D4D2"/><rect x="1" y="6" width="3" height="6" fill="#8DB9B6"/><rect x="12" y="6" width="3" height="6" fill="#8DB9B6"/><rect x="4" y="8" width="8" height="4" fill="#C7E3E1"/><rect x="3" y="12" width="2" height="2" fill="#502E1C"/><rect x="11" y="12" width="2" height="2" fill="#502E1C"/>',
  Salontafel: '<rect x="2" y="5" width="12" height="2" fill="#7A4A2C"/><rect x="2" y="7" width="12" height="1" fill="#502E1C"/><rect x="3" y="8" width="2" height="6" fill="#502E1C"/><rect x="11" y="8" width="2" height="6" fill="#502E1C"/><rect x="5" y="11" width="6" height="1" fill="#6B4026"/>',
}

export const foodIcons = {
  Appel: '<rect x="7" y="2" width="1" height="2" fill="#5C3A24"/><rect x="8" y="2" width="3" height="1" fill="#54794D"/><rect x="4" y="4" width="8" height="1" fill="#C0392B"/><rect x="3" y="5" width="10" height="6" fill="#D9473A"/><rect x="4" y="11" width="8" height="2" fill="#B03228"/><rect x="5" y="13" width="6" height="1" fill="#B03228"/><rect x="4" y="6" width="2" height="2" fill="#F08070"/>',
  Brood: '<rect x="3" y="4" width="10" height="1" fill="#E2B26E"/><rect x="2" y="5" width="12" height="6" fill="#C7955D"/><rect x="3" y="11" width="10" height="2" fill="#A87440"/><rect x="4" y="6" width="2" height="1" fill="#E8C58A"/><rect x="7" y="7" width="2" height="1" fill="#E8C58A"/><rect x="10" y="6" width="2" height="1" fill="#E8C58A"/>',
  Melk: '<rect x="5" y="1" width="6" height="1" fill="#B8C4C0"/><rect x="4" y="2" width="8" height="3" fill="#E8EEF0"/><rect x="4" y="5" width="8" height="9" fill="#FFFFFF"/><rect x="4" y="5" width="1" height="9" fill="#D8E5E0"/><rect x="5" y="7" width="6" height="4" fill="#4A8FD0"/><rect x="6" y="8" width="4" height="2" fill="#FFFFFF"/>',
  Kaas: '<rect x="2" y="7" width="12" height="1" fill="#F5D76E"/><rect x="3" y="6" width="10" height="1" fill="#F5D76E"/><rect x="4" y="5" width="8" height="1" fill="#F5D76E"/><rect x="2" y="8" width="12" height="5" fill="#E4BE52"/><rect x="2" y="12" width="12" height="1" fill="#C99A2E"/><rect x="5" y="9" width="2" height="2" fill="#C99A2E"/><rect x="10" y="10" width="2" height="2" fill="#C99A2E"/>',
  Tomaat: '<rect x="6" y="2" width="4" height="1" fill="#3D6038"/><rect x="7" y="1" width="2" height="2" fill="#54794D"/><rect x="3" y="4" width="10" height="1" fill="#D2473A"/><rect x="2" y="5" width="12" height="6" fill="#C85E4E"/><rect x="3" y="11" width="10" height="2" fill="#A8402F"/><rect x="4" y="6" width="2" height="2" fill="#EE9080"/>',
  Koekjes: '<rect x="4" y="3" width="8" height="1" fill="#8A5C3A"/><rect x="3" y="4" width="10" height="8" fill="#A87958"/><rect x="4" y="12" width="8" height="1" fill="#8A5C3A"/><rect x="5" y="5" width="2" height="2" fill="#4A2A18"/><rect x="9" y="6" width="2" height="2" fill="#4A2A18"/><rect x="6" y="9" width="2" height="2" fill="#4A2A18"/><rect x="10" y="10" width="1" height="1" fill="#4A2A18"/>',
  Banaan: '<path d="M2 3h3v2h2v2h3v2h3v3h-2v2H8v-2H5v-2H3V8H1V5h1z" fill="#E9C84A"/><path d="M4 6h2v2h3v2h3v2h-3v-2H6V8H4z" fill="#FFE779"/><rect x="1" y="3" width="2" height="2" fill="#79503E"/><rect x="11" y="12" width="3" height="2" fill="#79503E"/>',
  Sinaasappel: '<path d="M7 2h2v1h3v2h2v3h1v4h-2v2h-3v1H6v-1H3v-2H2V8h1V5h2V3h2z" fill="#E78A32"/><path d="M7 4h3v2H7v2H5v3H4V7h2V5h1z" fill="#FFC05A"/><rect x="8" y="1" width="2" height="2" fill="#54794D"/><rect x="10" y="2" width="3" height="1" fill="#6B9C61"/>',
  Aardbei: '<path d="M2 5h3V4h6v1h3v3h-1v3h-1v2h-2v2H7v-1H5v-2H4v-2H3V8H2z" fill="#C94350"/><path d="M6 6h2v2H6v2H5V7h1z" fill="#F08080"/><path d="M4 5h3V3h2v2h3V3h2v3h-2V5h-2v1H7V5H5v2H3z" fill="#56815A"/><g fill="#FFE39A"><rect x="5" y="8" width="1" height="1"/><rect x="10" y="7" width="1" height="1"/><rect x="8" y="11" width="1" height="1"/><rect x="11" y="10" width="1" height="1"/></g>',
  Druiven: '<g fill="#76558E"><rect x="6" y="2" width="3" height="3"/><rect x="3" y="5" width="4" height="4"/><rect x="7" y="5" width="4" height="4"/><rect x="11" y="6" width="3" height="3"/><rect x="4" y="9" width="4" height="4"/><rect x="8" y="9" width="4" height="4"/><rect x="6" y="13" width="4" height="2"/></g><g fill="#A887BE"><rect x="4" y="6" width="2" height="2"/><rect x="8" y="6" width="2" height="2"/><rect x="5" y="10" width="2" height="2"/><rect x="9" y="10" width="2" height="2"/></g><path d="M8 2V1h3v2h-2v2H8z" fill="#54794D"/>',
  Peer: '<path d="M7 2h3v2h2v2h2v4h-1v3h-2v2H5v-1H3v-3H2V8h2V5h2V3h1z" fill="#A2B36B"/><path d="M7 4h2v2H7v2H5v3H4V8h2V5h1z" fill="#D4DC8C"/><path d="M8 1h2v3H8z" fill="#79503E"/>',
  Watermeloen: '<path d="M2 4h12v2h-1v3h-1v2h-2v2H8v1H5v-2H3v-2H2V8H1V6h1z" fill="#D75B64"/><path d="M2 4h12v2h-1v3h-1v2h-2v2H8v1H5v-2H3v-2H2V8H1V6h1z" fill="none" stroke="#56815A" stroke-width="2"/><g fill="#493A35"><rect x="5" y="7" width="1" height="2"/><rect x="9" y="8" width="1" height="2"/><rect x="7" y="11" width="1" height="2"/></g>',
  Wortel: '<path d="M2 4h3V3h2V2h2v2H8v2h2v2H9v2H8v2H7v2H5v-2H4v-2H3V8H2z" fill="#E8873D"/><path d="M3 5h2v2h2v2H6v2H5V8H3z" fill="#FFB25D"/><path d="M5 4V2h2V1h2v2h2v2H9V4H8v2H6V4z" fill="#56815A"/>',
  Komkommer: '<path d="M3 3h9v1h2v2h1v4h-1v2h-2v1H4v-1H2v-2H1V6h1V4h1z" fill="#6B9C61"/><path d="M4 4h7v1h2v2h-1v2h-1v2H5v-1H3V7h1z" fill="#91B879"/><g fill="#426B48"><rect x="4" y="6" width="1" height="1"/><rect x="9" y="5" width="1" height="1"/><rect x="7" y="10" width="1" height="1"/></g>',
  Paprika: '<path d="M7 3h3v1h2v2h2v5h-1v2h-2v2H6v-1H4v-2H2V7h2V5h2V4h1z" fill="#D95745"/><path d="M7 5h2v2h2v4H9v3H6v-2H4V8h2V6h1z" fill="#EF7861"/><path d="M7 4V2h2V1h2v3h2v2h-2V5h-2v1H7V5H5V4z" fill="#56815A"/>',
  Broccoli: '<path d="M6 5V3h2V1h3v2h2v2h2v4h-2v2H5v-1H3V8h1V6h2z" fill="#56815A"/><path d="M7 4h2v2H7v2H5V6h2z" fill="#7FAE68"/><path d="M7 9h4v2h-1v4H7v-4H6v-1h1z" fill="#91B879"/>',
  Mais: '<path d="M6 2h5v2h2v3h1v5h-2v2h-2v1H6v-2H4v-3H3V6h2V3h1z" fill="#E2B842"/><path d="M6 4h4v2h2v4h-2v2H7v-2H5V7h1z" fill="#FFE076"/><path d="M5 6H3v6h2v2h2v1h2v-2H8v-2H7V9H6V7zM11 5h2v3h2v3h-2v2h-2v-2h1V8h-1z" fill="#56815A"/><g fill="#C89B32"><rect x="7" y="5" width="1" height="1"/><rect x="10" y="7" width="1" height="1"/><rect x="7" y="9" width="1" height="1"/></g>',
  Champignons: '<path d="M3 7V5h2V3h2V2h4v1h2v2h1v3h-2v1H4V8H2V7z" fill="#B9A18A"/><path d="M7 8h4v2h1v4h-2v1H6v-1H5v-3h1V9h1z" fill="#E8DDC4"/><path d="M5 6h2V5h2v2H7v1H4z" fill="#D8C4AC"/>',
  Ei: '<path d="M7 1h3v2h2v2h1v3h1v4h-2v2h-2v1H6v-1H4v-2H3V8h1V5h1V3h2z" fill="#E8DDC4"/><path d="M7 3h2v2h2v3h1v3h-2v2H7v-1H5v-3h1V6h1z" fill="#FFF8E9"/>',
  Yoghurt: '<path d="M4 4h8v2h1v7h-1v2H4v-2H3V6h1z" fill="#D7B3D3"/><path d="M3 3h10v2H3z" fill="#A887BE"/><path d="M5 7h6v4H5z" fill="#FFF4F8"/><path d="M6 8h4v2H6z" fill="#D7B3D3"/>',
  Sap: '<path d="M5 3h6v2h2v9h-2v1H5v-1H3V5h2z" fill="#D98B42"/><path d="M8 1h2v4H8z" fill="#F2D6AA"/><path d="M5 6h6v5H5z" fill="#FFE9B5"/><path d="M7 7h2v3H7z" fill="#E8873D"/>',
  Pizza: '<path d="M2 4h12v2h-1v2h-1v2h-1v2h-1v2H8v-2H6v-2H4V8H2z" fill="#D37B46"/><path d="M3 4h10v2h-1v2h-1v2h-1v2H9v-2H7v-2H5V8H3z" fill="#F2C85B"/><g fill="#C94350"><rect x="6" y="6" width="2" height="2"/><rect x="10" y="8" width="2" height="2"/><rect x="7" y="10" width="2" height="2"/></g><path d="M2 3h12v2H2z" fill="#E5AA63"/>',
  Taart: '<path d="M2 6h12v2h-1v5h-2v2H4v-2H3V8H2z" fill="#C97583"/><path d="M2 5h12v2H2z" fill="#FFF0D4"/><path d="M4 8h8v2H4z" fill="#E8AFC0"/><path d="M6 3h4v2H6z" fill="#D95745"/><path d="M7 2h2v2H7z" fill="#56815A"/>',
  Chocolade: '<path d="M3 2h10v2h1v9h-2v2H3v-2H2V4h1z" fill="#79503E"/><path d="M4 4h3v3H4zM8 4h4v3H8zM4 8h3v3H4zM8 8h4v3H8z" fill="#A87958"/><path d="M5 5h1v1H5zM9 5h1v1H9zM5 9h1v1H5zM9 9h1v1H9z" fill="#D2A47C"/>',
}

export const furnitureStyles = [
  ['original', 'Klassiek'],
  ['girly', 'Roze'],
  ['colorful', 'Kleurrijk'],
]

// Drie sofamodellen met een pixelicoontje (16×16) voor in het keuzekader
export const sofaModels = [
  ['modern', 'Modern', '<rect x="3" y="3" width="10" height="5" fill="#B0D4D2"/><rect x="1" y="6" width="3" height="6" fill="#8DB9B6"/><rect x="12" y="6" width="3" height="6" fill="#8DB9B6"/><rect x="4" y="8" width="8" height="4" fill="#C7E3E1"/><rect x="3" y="12" width="2" height="2" fill="#502E1C"/><rect x="11" y="12" width="2" height="2" fill="#502E1C"/>'],
  ['chesterfield', 'Chesterfield', '<rect x="2" y="3" width="12" height="6" fill="#8DB9B6"/><rect x="2" y="2" width="12" height="1" fill="#B0D4D2"/><rect x="0" y="5" width="4" height="8" fill="#B0D4D2"/><rect x="12" y="5" width="4" height="8" fill="#B0D4D2"/><rect x="0" y="5" width="4" height="2" fill="#C7E3E1"/><rect x="12" y="5" width="4" height="2" fill="#C7E3E1"/><rect x="4" y="9" width="8" height="3" fill="#C7E3E1"/><rect x="1" y="12" width="14" height="2" fill="#8DB9B6"/><rect x="5" y="4" width="1" height="1" fill="#502E1C"/><rect x="8" y="4" width="1" height="1" fill="#502E1C"/><rect x="11" y="4" width="1" height="1" fill="#502E1C"/><rect x="6" y="6" width="1" height="1" fill="#502E1C"/><rect x="9" y="6" width="1" height="1" fill="#502E1C"/><rect x="2" y="14" width="2" height="1" fill="#502E1C"/><rect x="12" y="14" width="2" height="1" fill="#502E1C"/>'],
  ['retro', 'Retro', '<rect x="3" y="3" width="4" height="5" fill="#8DB9B6"/><rect x="9" y="3" width="4" height="5" fill="#8DB9B6"/><rect x="2" y="8" width="12" height="3" fill="#B0D4D2"/><rect x="1" y="7" width="3" height="1" fill="#946851"/><rect x="12" y="7" width="3" height="1" fill="#946851"/><rect x="1" y="8" width="1" height="3" fill="#946851"/><rect x="14" y="8" width="1" height="3" fill="#946851"/><rect x="1" y="11" width="14" height="1" fill="#946851"/><rect x="2" y="12" width="1" height="2" fill="#502E1C"/><rect x="1" y="14" width="1" height="1" fill="#502E1C"/><rect x="13" y="12" width="1" height="2" fill="#502E1C"/><rect x="14" y="14" width="1" height="1" fill="#502E1C"/>'],
]

// Aanpasbare meubels buiten de sofa. Bureau en keuken hebben drie modellen (met een pixelicoontje);
// de kleurkiezers horen bij het gekozen model. Bij het bureau zijn bureau en stoel één set.
export const furnitureCustomizers = {
  desk: {
    title: 'Bureau aanpassen',
    models: [
      { key: 'modern', label: 'Modern', icon: furnitureIcons.Bureau,
        parts: [['deskBody', 'Kleur bureau en stoel'], ['deskChair', 'Kleur zitkussen'], ['tan', 'Kleur lampenkap']] },
      { key: 'gaming', label: 'Gaming',
        icon: '<rect x="1" y="7" width="14" height="2" fill="#2B2B36"/><rect x="1" y="9" width="14" height="1" fill="#5FE1F2"/><rect x="2" y="10" width="1" height="5" fill="#2B2B36"/><rect x="13" y="10" width="1" height="5" fill="#2B2B36"/><rect x="5" y="2" width="6" height="4" fill="#2B2B36"/><rect x="6" y="3" width="4" height="2" fill="#5FE1F2"/><rect x="7" y="6" width="2" height="1" fill="#2B2B36"/><rect x="5" y="10" width="5" height="2" fill="#C8354B"/><rect x="4" y="9" width="1" height="3" fill="#2B2B36"/><rect x="10" y="9" width="1" height="3" fill="#2B2B36"/><rect x="7" y="12" width="1" height="2" fill="#2B2B36"/><rect x="5" y="14" width="5" height="1" fill="#2B2B36"/>',
        parts: [['deskGaming', 'Kleur bureau en stoel'], ['deskGamingChair', 'Kleur stoelbekleding'], ['deskAccent', 'Kleur ledstrip']] },
      { key: 'vintage', label: 'Vintage',
        icon: '<rect x="1" y="7" width="14" height="2" fill="#8A5A3B"/><rect x="2" y="9" width="4" height="2" fill="#6B4430"/><rect x="10" y="9" width="4" height="2" fill="#6B4430"/><rect x="4" y="10" width="1" height="1" fill="#D6A84A"/><rect x="11" y="10" width="1" height="1" fill="#D6A84A"/><rect x="2" y="11" width="1" height="4" fill="#8A5A3B"/><rect x="13" y="11" width="1" height="4" fill="#8A5A3B"/><rect x="1" y="12" width="1" height="1" fill="#8A5A3B"/><rect x="14" y="12" width="1" height="1" fill="#8A5A3B"/><rect x="10" y="4" width="4" height="3" fill="#8A5A3B"/><rect x="11" y="4" width="1" height="2" fill="#6B4430"/><rect x="13" y="4" width="1" height="2" fill="#6B4430"/><rect x="3" y="3" width="3" height="4" fill="#E4D2BA"/><rect x="4" y="2" width="1" height="1" fill="#E4D2BA"/>',
        parts: [['deskVintage', 'Kleur bureau en stoel'], ['deskVintageChair', 'Kleur zitkussen'], ['tan', 'Kleur lampenkap']] },
    ],
  },
  kitchen: {
    title: 'Keuken aanpassen',
    models: [
      { key: 'classic', label: 'Klassiek', icon: furnitureIcons.Keukenblok,
        parts: [['kitchenFront', 'Kleur kastjes'], ['kitchenTop', 'Kleur werkblad'], ['kitchenHandle', 'Kleur grepen']] },
      { key: 'sleek', label: 'Strak',
        icon: '<rect x="1" y="6" width="14" height="1" fill="#EDEDE8"/><rect x="1" y="7" width="14" height="7" fill="#3E4A52"/><rect x="5" y="7" width="1" height="7" fill="#2A333A"/><rect x="10" y="7" width="1" height="7" fill="#2A333A"/><rect x="2" y="8" width="2" height="1" fill="#C9A86A"/><rect x="7" y="8" width="2" height="1" fill="#C9A86A"/><rect x="12" y="8" width="2" height="1" fill="#C9A86A"/><rect x="1" y="14" width="14" height="1" fill="#25292D"/><rect x="7" y="2" width="1" height="4" fill="#C9A86A"/><rect x="7" y="2" width="3" height="1" fill="#C9A86A"/><rect x="11" y="5" width="3" height="1" fill="#25292D"/>',
        parts: [['kitchenSleek', 'Kleur kastjes'], ['kitchenSleekTop', 'Kleur werkblad'], ['kitchenSleekHandle', 'Kleur grepen']] },
      { key: 'retro', label: 'Retro',
        icon: '<rect x="1" y="2" width="5" height="12" fill="#9FD3C7"/><rect x="5" y="5" width="1" height="2" fill="#C9CED3"/><rect x="1" y="7" width="5" height="1" fill="#C9CED3"/><rect x="7" y="4" width="2" height="2" fill="#D94F4F"/><rect x="9" y="4" width="2" height="2" fill="#F4EBDD"/><rect x="11" y="4" width="2" height="2" fill="#D94F4F"/><rect x="13" y="4" width="2" height="2" fill="#F4EBDD"/><rect x="7" y="6" width="8" height="1" fill="#F4EBDD"/><rect x="7" y="7" width="8" height="1" fill="#D94F4F"/><rect x="7" y="8" width="8" height="6" fill="#9FD3C7"/><rect x="8" y="9" width="2" height="4" fill="#F4EBDD"/><rect x="12" y="9" width="2" height="4" fill="#F4EBDD"/>',
        parts: [['kitchenRetro', 'Kleur kastjes en koelkast'], ['kitchenRetroTop', 'Kleur werkblad en deurtjes'], ['kitchenRetroAccent', 'Kleur accenten']] },
    ],
  },
  bed: {
    title: 'Bed aanpassen',
    models: [
      { key: 'cozy', label: 'Gezellig',
        icon: '<rect x="1" y="3" width="2" height="10" fill="#502E1C"/><rect x="3" y="4" width="1" height="5" fill="#502E1C"/><rect x="5" y="4" width="1" height="5" fill="#502E1C"/><rect x="3" y="6" width="5" height="2" fill="#B7A1D9"/><rect x="3" y="8" width="12" height="3" fill="#FFFFFF"/><rect x="7" y="7" width="8" height="3" fill="#72BDB5"/><rect x="3" y="11" width="12" height="2" fill="#502E1C"/><rect x="14" y="11" width="1" height="3" fill="#502E1C"/><rect x="1" y="13" width="1" height="1" fill="#502E1C"/>',
        parts: [['bedFrame', 'Kleur bedframe'], ['bedCover', 'Kleur dekbed'], ['bedPillow', 'Kleur kussens']] },
      { key: 'canopy', label: 'Hemelbed',
        icon: '<rect x="1" y="1" width="1" height="13" fill="#D9C7AE"/><rect x="14" y="1" width="1" height="13" fill="#D9C7AE"/><rect x="1" y="1" width="14" height="1" fill="#D9C7AE"/><rect x="2" y="2" width="12" height="2" fill="#FFFFFF"/><rect x="2" y="2" width="2" height="9" fill="#FFFFFF"/><rect x="12" y="2" width="2" height="9" fill="#FFFFFF"/><rect x="4" y="7" width="3" height="2" fill="#FFFFFF"/><rect x="2" y="9" width="12" height="2" fill="#F4EBDD"/><rect x="6" y="8" width="8" height="3" fill="#E9A8B8"/><rect x="2" y="11" width="12" height="2" fill="#E9A8B8"/>',
        parts: [['bedCanopyFrame', 'Kleur palen en frame'], ['bedCanopyCover', 'Kleur dekbed'], ['bedCanopyCurtain', 'Kleur voile']] },
      { key: 'scandi', label: 'Scandi',
        icon: '<rect x="1" y="3" width="4" height="9" fill="#C9B79C"/><rect x="2" y="2" width="2" height="1" fill="#C9B79C"/><rect x="2" y="4" width="1" height="7" fill="#D9894F"/><rect x="5" y="7" width="3" height="2" fill="#FFFFFF"/><rect x="5" y="9" width="10" height="2" fill="#F2EDE4"/><rect x="11" y="8" width="3" height="3" fill="#D9894F"/><rect x="1" y="11" width="14" height="2" fill="#C9B79C"/><rect x="2" y="13" width="1" height="1" fill="#502E1C"/><rect x="13" y="13" width="1" height="1" fill="#502E1C"/>',
        parts: [['bedScandiFrame', 'Kleur hoofdbord en frame'], ['bedScandiCover', 'Kleur dekbed'], ['bedScandiThrow', 'Kleur plaid']] },
    ],
  },
  shower: {
    title: 'Douche aanpassen',
    models: [
      { key: 'glass', label: 'Glas',
        icon: '<rect x="2" y="1" width="12" height="13" fill="#EEF4F6"/><rect x="2" y="1" width="12" height="1" fill="#C9CED3"/><rect x="3" y="2" width="3" height="3" fill="#FFFFFF"/><rect x="7" y="2" width="3" height="3" fill="#FFFFFF"/><rect x="3" y="6" width="3" height="3" fill="#FFFFFF"/><rect x="11" y="2" width="1" height="5" fill="#414242"/><rect x="9" y="3" width="3" height="1" fill="#414242"/><rect x="2" y="1" width="1" height="13" fill="#C9CED3"/><rect x="13" y="1" width="1" height="13" fill="#C9CED3"/><rect x="1" y="13" width="14" height="2" fill="#FFFFFF"/>',
        parts: [['showerTile', 'Kleur tegels'], ['showerFrame', 'Kleur frame'], ['showerFixture', 'Kleur kraan']] },
      { key: 'tub', label: 'Bad',
        icon: '<rect x="2" y="1" width="12" height="1" fill="#414242"/><rect x="2" y="2" width="5" height="7" fill="#9FD3C7"/><rect x="3" y="2" width="1" height="7" fill="#7FBFB5"/><rect x="5" y="2" width="1" height="7" fill="#7FBFB5"/><rect x="11" y="2" width="1" height="5" fill="#414242"/><rect x="1" y="8" width="14" height="4" fill="#F4EBDD"/><rect x="2" y="9" width="12" height="1" fill="#FFFFFF"/><rect x="2" y="12" width="2" height="2" fill="#414242"/><rect x="12" y="12" width="2" height="2" fill="#414242"/>',
        parts: [['showerTub', 'Kleur bad'], ['showerCurtain', 'Kleur gordijn'], ['showerFixture', 'Kleur kranen en pootjes']] },
      { key: 'rain', label: 'Inloop',
        icon: '<rect x="2" y="1" width="12" height="12" fill="#6E9C84"/><rect x="5" y="2" width="1" height="11" fill="#5A8570"/><rect x="9" y="2" width="1" height="11" fill="#5A8570"/><rect x="2" y="5" width="12" height="1" fill="#5A8570"/><rect x="2" y="9" width="12" height="1" fill="#5A8570"/><rect x="5" y="2" width="5" height="1" fill="#2B2B36"/><rect x="1" y="1" width="1" height="13" fill="#2B2B36"/><rect x="14" y="1" width="1" height="13" fill="#2B2B36"/><rect x="1" y="13" width="14" height="2" fill="#A0714F"/><rect x="4" y="13" width="1" height="2" fill="#7E5639"/><rect x="8" y="13" width="1" height="2" fill="#7E5639"/><rect x="12" y="13" width="1" height="2" fill="#7E5639"/>',
        parts: [['showerRainTile', 'Kleur tegels'], ['showerRainFrame', 'Kleur frame'], ['showerWood', 'Kleur hout']] },
    ],
  },
  dresser: {
    title: 'Make-uptafel aanpassen',
    models: [
      { key: 'classic', label: 'Klassiek',
        icon: '<rect x="9" y="1" width="4" height="6" fill="#502E1C"/><rect x="10" y="2" width="2" height="4" fill="#94CAE2"/><rect x="1" y="7" width="14" height="1" fill="#E4D2BA"/><rect x="2" y="8" width="12" height="6" fill="#502E1C"/><rect x="3" y="9" width="10" height="1" fill="#6B4430"/><rect x="3" y="11" width="10" height="1" fill="#6B4430"/><rect x="5" y="9" width="1" height="1" fill="#A69060"/><rect x="10" y="9" width="1" height="1" fill="#A69060"/><rect x="5" y="11" width="1" height="1" fill="#A69060"/><rect x="10" y="11" width="1" height="1" fill="#A69060"/><rect x="3" y="5" width="1" height="2" fill="#D77C9E"/><rect x="5" y="4" width="1" height="3" fill="#94CAE2"/>',
        parts: [['dresserBody', 'Kleur kast'], ['dresserTop', 'Kleur blad'], ['dresserHandle', 'Kleur knopjes']] },
      { key: 'hollywood', label: 'Hollywood',
        icon: '<rect x="3" y="1" width="10" height="7" fill="#F6E1E6"/><rect x="5" y="2" width="6" height="5" fill="#94CAE2"/><rect x="3" y="1" width="1" height="1" fill="#FFE0A3"/><rect x="6" y="1" width="1" height="1" fill="#FFE0A3"/><rect x="9" y="1" width="1" height="1" fill="#FFE0A3"/><rect x="12" y="1" width="1" height="1" fill="#FFE0A3"/><rect x="3" y="4" width="1" height="1" fill="#FFE0A3"/><rect x="12" y="4" width="1" height="1" fill="#FFE0A3"/><rect x="1" y="8" width="14" height="1" fill="#FFFFFF"/><rect x="2" y="9" width="12" height="2" fill="#F6E1E6"/><rect x="3" y="11" width="1" height="4" fill="#D6A84A"/><rect x="12" y="11" width="1" height="4" fill="#D6A84A"/>',
        parts: [['dresserHollywood', 'Kleur tafel en spiegel'], ['dresserHollywoodTop', 'Kleur blad'], ['dresserHollywoodFrame', 'Kleur goud']] },
      { key: 'boho', label: 'Boho',
        icon: '<rect x="5" y="1" width="6" height="1" fill="#8A5A3B"/><rect x="4" y="2" width="8" height="5" fill="#8A5A3B"/><rect x="5" y="2" width="6" height="5" fill="#94CAE2"/><rect x="1" y="7" width="14" height="1" fill="#C8A27A"/><rect x="2" y="8" width="12" height="6" fill="#C8A27A"/><rect x="3" y="9" width="4" height="4" fill="#E9D8B4"/><rect x="9" y="9" width="4" height="4" fill="#E9D8B4"/><rect x="4" y="10" width="2" height="2" fill="#C8A27A"/><rect x="10" y="10" width="2" height="2" fill="#C8A27A"/><rect x="13" y="4" width="2" height="3" fill="#54794D"/>',
        parts: [['dresserBoho', 'Kleur kast'], ['dresserBohoTop', 'Kleur rotan'], ['dresserBohoMirror', 'Kleur spiegelrand']] },
    ],
  },
}

