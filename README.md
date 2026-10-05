# Pixel Home — The Living Room

A cozy isometric pixel-art living room built with Vite, JavaScript, and Three.js. Its brighter palette uses darkest background `#1D0A0A`, deep brown `#432A24`, dark wood `#694334`, brown `#906044`, warm coral `#D46B4D`, terracotta `#F08B5E`, sunny wood `#F0BD62`, warm light `#FFE59A`, mint `#A8D8C5`, dark gray `#56625A`, and beige walls `#D8C7A5`. The foliage uses forest green `#3E7950` and olive green `#8DAA4F`.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. For a production build, run `npm run build`; use `npm run preview` to serve that build locally.

## Controls

- Drag to orbit the room; scroll or pinch to zoom.
- WebGL is required. Google Fonts are optional.

## Where to practice

- `src/main.js`: page markup and camera controls.
- `src/living-room.js`: voxel furniture, plants, palette, lighting, and camera.
- `src/room-view.css`: full-screen white canvas styling.

## Verification

Run `npm run build` to verify the production bundle. Check the room at desktop and mobile sizes, and confirm orbit and zoom work.
