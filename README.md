# Dota 2 Model Viewer

![Node Version](https://badgen.net/badge/node/14+/green)

A web-based model viewer for Dota 2 with additional support for rendering
portrait images, normally shown in the bottom part of the HUD on selection.

<img alt="Dota 2 Model Viewer" src="https://user-images.githubusercontent.com/378235/107156847-f873c880-6980-11eb-9ada-69e8860022df.png" width="49%" /> <img alt="Dota 2 Portraits" src="https://user-images.githubusercontent.com/378235/107994878-d102a880-6fdd-11eb-9182-ead19c3585de.jpg" width="49%" />

# Overview

This project is split into two parts:

- Model viewer web client ([`src/web`](./src/web))
- Pipeline server ([`src/pipeline`](./src/pipeline))

The pipeline server delivers Dota 2 assets to the web client on-demand, after these
assets have been extracted, decompiled and converted into web-compatible formats
using the excellent [ValveResourceFormat] library:

- Textures are delivered as PNGs.
- Models/meshes as [glTF binary files](https://www.khronos.org/gltf/).
- Valve's [KeyValues files](https://developer.valvesoftware.com/wiki/KeyValues) as JSON.

For simplicity's sake the pipeline server also serves up the web client from the
`public`-folder.

# Setup

1. Clone the repository:

   ```shell
   git clone git://github.com/timkurvers/dota2-model-viewer.git
   ```

2. Download and install [Node.js] 14+ for your platform.

3. Install dependencies:

   ```shell
   npm install
   ```

4. Download the latest version of [ValveResourceFormat]'s decompiler.

5. Copy `.envrc-sample` to `.envrc` and configure its contents.

   Make sure that `DOTA2_DIR_VPK_PATH` points to Dota's `pak01_dir.vpk`-file and
   `VRF_DECOMPILER_PATH` to VRF's decompiler from step 4 above.

6. Source the `.envrc`-file loading the configuration into the environment:

   ```shell
   source .envrc
   ```

   Alternatively, have [direnv] do this automatically 👍

7. Build the web client:

   ```shell
   npm run build
   ```

8. Run the pipeline server on `localhost:3000` (default):

   ```shell
   npm start
   ```

   **Disclaimer:** The pipeline serves up resources to the browser over HTTP. Depending
   on your network configuration these may be available to others. Respect laws and
   do not distribute game data you do not own. This also includes content extracted
   or placed into the folder indicated by `VRF_EXTRACT_PATH`.

# Usage

Instruct the viewer which model to load using the `model` query parameter:

http://localhost:3000/?model=models/creeps/roshan/roshan.vmdl

Visit http://localhost:3000/models.json for a list of available models.

Other query parameters:

- `animate`: set to `false` to disable animations.
- `background`: sets scene background color; must be one of:
  - `transparent`
  - a named color, e.g. `red`.
  - a URL-encoded hex triplet, e.g. `%23FF0000`.
- `debug`: enables a debug panel to allow fine-grained control of the scene.
- `helpers`: enables axes, grid and lighting visual helpers.
- `material`: overrides primary material.
- `portrait`: renders the model in portrait mode with a backdrop; supports two modes:
  - present but without a value, defaults to matching the model rendered.
  - with an explicit value, e.g. `default_courier`.
- `primaryMesh`: name of the mesh to render.

When the model viewer is not in portrait mode, freely rotate the camera using the
left mouse button, and pan using the right mouse button.

## Portrait pages

To quickly find portraits for various units, use the pre-made portrait pages:

- Selection of units: http://localhost:3000/portraits/index.html
- Selection of couriers: http://localhost:3000/portraits/couriers.html
- Lane creeps: http://localhost:3000/portraits/lane-creeps.html
- Neutral creeps: http://localhost:3000/portraits/neutral-creeps.html
- Structures: http://localhost:3000/portraits/structures.html
- Summons: http://localhost:3000/portraits/summons.html
- Wards: http://localhost:3000/portraits/wards.html

## Batch screenshots

To easily screenshot multiple models, create a batch-file:

```
model=models/creeps/roshan/roshan.vmdl: roshan.png
model=models/courier/navi_courier/navi_courier_flying.vmdl&portrait: navi-courier.png
```

Now pass this file as an argument to the bundled screenshot-command:

```shell
npm run screenshot batch.txt screenshots/ -- --width 250 --height 250
```

For a full overview of options, see its help: `npm run screenshot`.

## Known issues

- Heroes and other units lack attachments, such as weapons, armor, and sometimes
  even their heads.

- Models are not correctly shaded nor lit in comparison to [ValveResourceFormat]'s
  rendering. In particular: specular, rim and directional ambient lighting are missing.

- The portrait animation gets chosen based on a pattern matching heuristic, as
  opposed to retrieving the right one directly from the Dota 2 game files.

- Only portraits listed in Dota 2's internal game file `scripts/npc/portraits.txt`
  are currently supported.

# Development

Dota 2 Model Viewer is written in [ES2020+], powered by [MobX], controllable using
[dat.gui], modularized using [ECMAScript modules] and bundled with [webpack].

Run the pipeline server in development mode to automatically monitor source files:

```shell
npm run start:dev
```

Contributions more than welcome!

# Legalese

- Dota 2 is a registered trademark of [Valve Corporation].
- Image resources, lore and other references are property of [Valve Corporation].

[ECMAScript modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[ES2020+]: https://www.strictmode.io/articles/whats-new-es2020/
[MobX]: https://mobx.js.org
[Node.js]: https://nodejs.org/
[Valve Corporation]: https://www.valvesoftware.com/
[ValveResourceFormat]: https://github.com/SteamDatabase/ValveResourceFormat
[dat.gui]: https://github.com/dataarts/dat.gui
[direnv]: https://direnv.net/
[webpack]: https://webpack.js.org/
