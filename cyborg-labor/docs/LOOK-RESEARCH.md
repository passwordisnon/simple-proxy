# Look research: toward a polished, AAA-style cozy look

Research notes for the visual overhaul (task: "AAA cozy look"). Sources are listed at the end.

## 1. Bruno Simon, folio-2025 (MIT, github.com/brunosimon/folio-2025)

Studied the actual source (`sources/Game`). It uses three.js WebGPU/TSL; we are on r147 WebGL, so everything is ported as GLSL `onBeforeCompile` patches.

### Lighting model (`Materials/MeshDefaultMaterial.js`, `Ligthing.js`)
- Lambert base color × light color × intensity.
- **Core shadow**: `smoothstep(edgeHigh, edgeLow, dot(N, L))`. This gives a soft but clearly banded terminator (not a hard toon step).
- **Drop shadows** from the shadow map are caught as a scalar and combined: `max(core, drop, custom)`.
- **Colored shadows**: `shadowColor = baseColor * lighting.shadowColor` (a saturated blue/purple tint), then `mix(lit, shadowColor, shadowMix)`. Shadows never go grey or black. This is the single biggest "cozy" factor.
- **Light bounce**: surfaces facing down, near the ground, get the terrain color mixed in (`dot(N, down)` × height falloff). This gives fake GI: grass-green under trees and cars.
- **Fog**: a custom mix of strength and color at the end.
- **Day cycles** (`Cycles/DayCycles.js`) animate light color, intensity, shadow color and fog color together through presets (dawn, day, dusk, night).

### Grass (`World/Grass.js`)
- One triangle per blade, 280×280 = 78k blades in **one geometry**. The patch loops around the player (mod-wrap in the vertex shader), so the world is always fully covered.
- The blade color **is the terrain color at that spot** (the same color node). Grass and ground blend seamlessly, with no visible "cards".
- Normal is forced to (0,1,0), so grass is lit like the ground. The tip → base gradient is done through the shadow node (bases are in "shadow").
- Blades rotate to face the camera. Wind is a noise texture offset scaled by tipness × height.
- Height = random × perlin variation × a terrain grass mask (paths and sand carve it out).

### Foliage / trees (`World/Foliage.js`)
- A tree crown is **80 alpha-tested quads** placed in a sphere (radius `1 - rand^3`), merged into one geometry and instanced.
- Normals are bent toward the sphere normal (lerp 0.85), so the crown shades like a soft ball, not like flat cards.
- Color = `mix(colorA, colorB, smoothstep(0, 1, dot(N, L)))`: two-tone crowns.
- Alpha comes from a leaf-cluster texture whose UV rotates with the wind: the edges rustle without moving vertices.
- Crowns go see-through around the player (screen-space circle), so the camera is never blocked.
- Shadows use the same alpha mask → dappled shadows.

### Post (`Rendering.js`, `Passes/cheapDOF.js`)
- Bloom: threshold 1, strength 0.25, only 2–5 mips (subtle).
- A cheap DOF (tilt-shift style blur toward the screen edges) on high quality.

### Other world systems worth porting
Wind.js (global wind field used by grass, leaves and foliage), Leaves.js (falling leaves), WindLines.js (stylized wind streaks), RainLines, Snow, Lightnings, WaterSurface (467 lines: shoreline foam, ripples), PoleLights and Lanterns (emissive + bloom at night), Whispers, Confetti.

## 2. Codrops, "How to Make the Fluffiest Grass With Three.js" (2025)
(The page returned 403 to the fetcher; the summary comes from search results.)
Instanced blade geometry, chunked, wind via vertex shader; the fluffiness comes from dense short blades, ground-matched color and soft AO at the base.

## 3. Other references
- Animal Crossing NH camera plus tilt shift (CodePen by mjurczyk): the curved-world feel with blurred top and bottom bands.
- Maya Ndljk, custom toon shader in three.js: stepped N·L plus rim and specular (the Roystan approach).
- James Smyth, BotW-style grass in WebGL.

## 4. Asset sources (CC0 unless noted)
- **Kenney**: city kits (commercial, suburban, roads), car kit, and many more. Already used.
- **Quaternius**: Ultimate Nature, Modular Ruins, Animated Dinosaurs (OBJ), Cute Monsters, Ultimate Animated Animals (glTF, *animated*), Stylized Nature MegaKit (higher quality; needs a manual download).
- **KayKit** (Kay Lousberg): Forest Nature Pack, Medieval Hexagon, Adventurers (rigged, animated). Higher-fidelity stylized models with a shared gradient texture atlas.
- **Poly Haven**: HDRIs and PBR textures (CC0), for image-based lighting and sky references.

## 5. Gap analysis: what currently makes us look like a student project
1. **Lighting**: plain toon ramp with grey shadows. We need colored shadows, a smooth terminator, light bounce, and time-of-day grading of light, shadow and fog colors together.
2. **Foliage**: trees are solid primitives (spheres and cones). We need Bruno-style alpha-quad crowns with bent normals, two-tone color and rustle.
3. **Grass**: the fluffy grass color does not come from the ground everywhere. We need terrain-matched blades, a looping patch around the player and wind.
4. **Post**: bloom only on HIGH. We need subtle bloom, tilt-shift DOF, gentle vignette, color grading and maybe SSAO.
5. **Outlines**: the inverted-hull outline everywhere reads as "cartoon demo". Thin it or tint it by the base color (darker hue instead of fixed ink), fade it with distance, or drop it on terrain props.
6. **Characters**: procedural primitive bodies; consider animated rigged kits (KayKit Adventurers, Quaternius animated animals) for fauna.
7. **Water**: needs shore foam, depth color and soft ripples (folio WaterSurface).
8. **Scale and density**: more props per area (clutter, flowers, pebbles) with instancing.

## Sources
- https://github.com/brunosimon/folio-2025
- https://deepwiki.com/brunosimon/folio-2025
- https://www.awwwards.com/brunos-portfolio-case-study.html
- https://tympanus.net/codrops/2025/02/04/how-to-make-the-fluffiest-grass-with-three-js/
- https://codepen.io/mjurczyk/pen/LYNqzxa
- https://www.maya-ndljk.com/blog/threejs-basic-toon-shader
- https://smythdesign.com/blog/stylized-grass-webgl/
- https://aleksandargjoreski.dev/blog/growing-my-grass-shader/
- https://app.cinevva.com/guides/game-assets-guide
- https://assethoard.com/free-game-assets
