# Apply Pixel-Art Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the code-generated colored-shape placeholders in `GameScene` with the real pixel-art assets in `assets/` (animated fox player, swamp ground tiles, parallax background, animated rune seeds, and scenery).

**Architecture:** Phaser 3 (loaded via CDN in `index.html`), plain ES modules, no build step and no test framework. The fox character sheet becomes the animated player; swamp tiles become tiled platforms; five background layers become a parallax backdrop; `Rune.png` becomes the collectible seed; trees/bushes/grass/stones are scattered as non-colliding scenery. Enemy, spike, cured-animal, and fog barrier keep their generated placeholders by design.

**Tech Stack:** Phaser 3.60 (Arcade physics), vanilla JavaScript ES modules.

**Verification method:** There is no test harness. Each task is verified **manually in the browser**. Start a local static server once and keep it running:

```bash
cd "C:/Users/david/Workspace/sigaa/games/physis"
python -m http.server 8000
```

Then open `http://localhost:8000/` and use **From Main Menu → Play** (or whatever the menu triggers) to reach `GameScene`. Keep the browser devtools **Console** open — any red error there is a failure. Reload after each change.

---

## File Structure

- **Modify** `src/main.js` — enable `pixelArt` rendering.
- **Modify** `src/scenes/GameScene.js` — load assets, define animations, tile platforms, add parallax + scenery, spawn rune seeds.
- **Modify** `src/entities/Player.js` — swap the `luna` rectangle for the animated `fox` sprite + animation state machine.

No new files. No files deleted.

---

## Task 1: Enable pixel-art rendering

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Add `pixelArt: true` to the Phaser config**

In `src/main.js`, add the `pixelArt` flag to the config object (put it right after `backgroundColor`):

```js
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#111111',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [MainMenuScene, InstructionsScene, GameScene]
};
```

- [ ] **Step 2: Verify (browser)**

Reload `http://localhost:8000/`, reach `GameScene`. Expected: the game still runs with no console errors and the existing placeholder shapes render (nothing visually changed yet — this flag only affects future sprites). Confirm the Console is clean.

- [ ] **Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: enable pixelArt rendering in Phaser config"
```

---

## Task 2: Load assets and define animations in GameScene

**Files:**
- Modify: `src/scenes/GameScene.js` (`preload()` around lines 8-43, and `create()` around lines 45-75)

This task only loads assets and registers animations. It does not yet use them, so visuals won't change — but there must be no load errors (check the Network tab for 404s).

- [ ] **Step 1: Add asset loads to `preload()`**

Keep the existing `this.make.graphics(...)` placeholder generation (enemy, block, spike, seed, fog, ui_leaf, luna are still used by HUD / placeholders). At the **end** of `preload()`, before the closing brace, add:

```js
        // --- Pixel-art assets ---
        const SWAMP = 'assets/free-swamp-game-tileset-pixel-art/';

        this.load.spritesheet('fox', 'assets/fox_charsheet_by_kinetic-kitsune.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.image('ground_tile', SWAMP + '1 Tiles/Tile_02.png');

        this.load.spritesheet('rune', SWAMP + '4 Animated objects/Rune.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        for (let i = 1; i <= 5; i++) {
            this.load.image('bg' + i, SWAMP + '2 Background/Layers/' + i + '.png');
        }

        this.load.image('tree1', SWAMP + '3 Objects/Trees/1.png');
        this.load.image('tree2', SWAMP + '3 Objects/Trees/2.png');
        this.load.image('bush1', SWAMP + '3 Objects/Bushes/1.png');
        this.load.image('grass1', SWAMP + '3 Objects/Grass/1.png');
        this.load.image('stone1', SWAMP + '3 Objects/Stones/1.png');
```

- [ ] **Step 2: Register animations at the start of `create()`**

In `create()`, immediately after the opening line(s) that set `worldWidth`/`worldHeight` is fine, but simplest: add this block as the **very first thing** inside `create()` (before `this.physics.world.setBounds(...)`). Guard it so re-entry (respawn calls `resetArea()`, not `create()`, so this runs once — but the guard is cheap insurance):

```js
        if (!this.anims.exists('fox_idle')) {
            this.anims.create({
                key: 'fox_idle',
                frames: this.anims.generateFrameNumbers('fox', { start: 0, end: 1 }),
                frameRate: 4,
                repeat: -1
            });
            this.anims.create({
                key: 'fox_walk',
                frames: this.anims.generateFrameNumbers('fox', { start: 33, end: 40 }),
                frameRate: 12,
                repeat: -1
            });
            this.anims.create({
                key: 'fox_jump',
                frames: this.anims.generateFrameNumbers('fox', { start: 44, end: 45 }),
                frameRate: 6,
                repeat: -1
            });
            this.anims.create({
                key: 'fox_hit',
                frames: this.anims.generateFrameNumbers('fox', { start: 55, end: 56 }),
                frameRate: 8,
                repeat: 0
            });
            this.anims.create({
                key: 'rune_spin',
                frames: this.anims.generateFrameNumbers('rune', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }
```

- [ ] **Step 3: Verify (browser)**

Reload and reach `GameScene`. Open devtools **Network** tab, filter to Img, and confirm every asset above returns **200** (no 404s). Open the **Console** — no errors. Visuals are unchanged (assets loaded but not yet used). The fox frame numbers (0-1 idle, 33-40 walk, 44-45 jump, 55-56 hit) come from the 11-column × 6-row, 64×64 sheet.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: load pixel-art assets and register fox/rune animations"
```

---

## Task 3: Turn the player into the animated fox

**Files:**
- Modify: `src/entities/Player.js` (constructor line 3-9, `update()` lines 45-61, `takeDamage()` lines 63-80)

- [ ] **Step 1: Use the `fox` texture and set the collider in the constructor**

In `src/entities/Player.js`, change the constructor's `super(...)` and body setup. Replace:

```js
        super(scene, x, y, 'luna');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        this.body.setSize(32, 32);
```

with:

```js
        super(scene, x, y, 'fox', 0);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        this.setDepth(5);
        // The fox art sits inside a mostly-empty 64x64 frame. Keep a compact
        // collider anchored near the fox's feet so gameplay physics stay close
        // to the original 32x32 box. These offsets are a starting point — tune
        // in Step 3 with physics debug if the box is misaligned.
        this.body.setSize(30, 30);
        this.body.setOffset(17, 30);
        this.play('fox_idle');
```

- [ ] **Step 2: Replace the movement/animation logic in `update()`**

Replace the entire body of `update()` (lines 45-61) with:

```js
    update() {
        const onGround = this.body.touching.down || this.body.blocked.down;

        if (this.keys.A.isDown) {
            this.setVelocityX(-200);
            this.setFlipX(false); // fox faces left in the sheet
        } else if (this.keys.D.isDown) {
            this.setVelocityX(200);
            this.setFlipX(true);
        } else {
            this.setVelocityX(0);
        }

        if (this.keys.W.isDown && onGround) {
            this.setVelocityY(-450);
        }

        // Don't override the hit animation while it is still playing.
        const playingHit = this.anims.currentAnim
            && this.anims.currentAnim.key === 'fox_hit'
            && this.anims.isPlaying;

        if (!playingHit) {
            if (!onGround) {
                this.play('fox_jump', true);
            } else if (this.body.velocity.x !== 0) {
                this.play('fox_walk', true);
            } else {
                this.play('fox_idle', true);
            }
        }

        if (this.y > 570) {
            this.die();
        }
    }
```

- [ ] **Step 3: Play the hit animation in `takeDamage()`**

In `takeDamage()`, right after `this.setTint(0xff0000);` (line 68), add:

```js
        this.play('fox_hit', true);
```

- [ ] **Step 4: Verify (browser)**

Reload and reach `GameScene`.
- The player is now the fox, playing an idle animation when standing.
- Press **A**/**D**: fox plays the walk cycle and faces the correct direction (nose points the way it moves).
- Press **W**: fox plays the jump animation in the air.
- Take damage (walk into an enemy from the side or touch a spike): fox flashes red and plays the hit animation.
- The fox lands cleanly on platforms without floating above them or sinking in. **If alignment looks off**, temporarily set `debug: true` in `src/main.js` arcade config, reload, and adjust the `this.body.setOffset(17, 30)` values in Step 1 until the green collider box sits on the fox's body/feet; then set `debug` back to `false`.
- Console is clean.

- [ ] **Step 5: Commit**

```bash
git add src/entities/Player.js
git commit -m "feat: replace player rectangle with animated fox sprite"
```

---

## Task 4: Tile the platforms with the swamp ground tile

**Files:**
- Modify: `src/scenes/GameScene.js` (`createLevelLayout()` platform loop, lines 95-100)

- [ ] **Step 1: Replace the stretched `block` with a tiling ground TileSprite**

In `createLevelLayout()`, replace the `platformData.forEach(...)` block:

```js
        platformData.forEach(data => {
            const platform = this.platforms.create(data.x, data.y, 'block');
            platform.setOrigin(0, 0);
            platform.setDisplaySize(data.width, 32);
            platform.refreshBody();
        });
```

with a TileSprite that repeats `ground_tile` across the width and carries a static body:

```js
        platformData.forEach(data => {
            const platform = this.add.tileSprite(data.x, data.y, data.width, 32, 'ground_tile');
            platform.setOrigin(0, 0);
            platform.setDepth(0);
            this.physics.add.existing(platform, true); // true = static body
            this.platforms.add(platform);
        });
```

`this.physics.add.existing(platform, true)` gives the TileSprite a static Arcade body matching its display size (`data.width × 32`), so the existing colliders registered in `create()` keep working unchanged.

- [ ] **Step 2: Verify (browser)**

Reload and reach `GameScene`. Expected:
- Every platform now shows the mossy swamp ground tile (`Tile_02`) **repeated** horizontally — crisp pixels, no stretching/blur.
- The fox stands and walks on the platforms exactly as before (collision unchanged).
- Enemies still bounce and are contained by the invisible `enemyWalls` (those still use the `block` texture and are hidden — unchanged).
- Console is clean.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: tile platforms with swamp ground tile"
```

---

## Task 5: Add the parallax background

**Files:**
- Modify: `src/scenes/GameScene.js` (`create()` and `update()`)

The background layers are 576×324. The viewport is 800×600, so scale each tile up by `600 / 324 ≈ 1.85` to fill the height, and scroll `tilePositionX` for parallax.

- [ ] **Step 1: Create the parallax layers in `create()`**

In `create()`, **after** the animation-registration block from Task 2 and **before** `this.createLevelLayout();`, add:

```js
        // --- Parallax background (behind everything) ---
        this.bgLayers = [];
        for (let i = 1; i <= 5; i++) {
            const layer = this.add.tileSprite(0, 0, 800, 600, 'bg' + i)
                .setOrigin(0, 0)
                .setScrollFactor(0)      // pinned to the camera; we scroll via tilePositionX
                .setTileScale(1.85, 1.85)
                .setDepth(-20 + i);      // -19..-15, all behind platforms/scenery
            this.bgLayers.push(layer);
        }
```

- [ ] **Step 2: Scroll the layers in `update()`**

In `GameScene.update()` (currently just `this.player.update();`), add parallax scrolling. Replace:

```js
    update() {
        this.player.update();
    }
```

with:

```js
    update() {
        this.player.update();

        if (this.bgLayers) {
            const scrollX = this.cameras.main.scrollX;
            this.bgLayers.forEach((layer, i) => {
                // Farther layers (lower i) scroll slower for depth.
                layer.tilePositionX = scrollX * (0.15 + i * 0.15);
            });
        }
    }
```

- [ ] **Step 3: Verify (browser)**

Reload and reach `GameScene`. Expected:
- A layered swamp forest fills the background instead of the flat `#111` / colored fill.
- Walking left/right makes the nearer layers slide faster than the farther ones (parallax depth).
- The fox, platforms, seeds, and enemies all render **in front of** the background.
- Console is clean.

Note: the existing `setBackgroundColor(...)` calls in `handleBarrierInteraction()` and `resetArea()` still run — they tint the camera behind the (opaque) parallax and are harmless. Leave them for now.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: add parallax swamp background to GameScene"
```

---

## Task 6: Render collectible seeds as animated runes

**Files:**
- Modify: `src/scenes/GameScene.js` (`spawnSeed()`, lines 202-205)

The HUD seed icon in `Player.js` keeps using the generated `seed` texture (unchanged). Only the in-world collectible changes.

- [ ] **Step 1: Spawn the rune sprite with its spin animation**

Replace `spawnSeed()`:

```js
    spawnSeed(x, y) {
        const seed = this.seeds.create(x, y, 'seed');
        seed.setBounceY(0.3);
    }
```

with:

```js
    spawnSeed(x, y) {
        const seed = this.seeds.create(x, y, 'rune');
        seed.play('rune_spin');
        seed.setBounceY(0.3);
        seed.setDepth(1);
    }
```

The rune frame is 16×16 — the same footprint as the old seed circle — so the overlap collider and collection logic in `handleSeedCollection()` work unchanged.

- [ ] **Step 2: Verify (browser)**

Reload and reach `GameScene`. Bounce on an enemy to cure it and drop a seed. Expected:
- The dropped collectible is now an **animated spinning rune** (not a yellow circle).
- Walking into it still collects it and increments the HUD seed counter.
- Console is clean.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: render collectible seeds as animated runes"
```

---

## Task 7: Scatter environmental scenery

**Files:**
- Modify: `src/scenes/GameScene.js` (`createLevelLayout()` — add a scenery block near the end, before the barrier setup)

Non-colliding decoration placed behind the platforms for atmosphere. Trees/stones stand on the ground surface (`y = 568`, drawn with a bottom origin); bushes/grass sit on platform tops.

- [ ] **Step 1: Add a scenery data array and render loop**

In `createLevelLayout()`, add this block right **before** the `// Correção de Ancoragem` barrier section (after the `spawnEnemy(...)` calls):

```js
        // --- Decoração ambiental (sem colisão, atrás das plataformas) ---
        const decoData = [
            { x: 250, y: 568, key: 'tree1',  ox: 0.5, oy: 1 },
            { x: 820, y: 568, key: 'tree2',  ox: 0.5, oy: 1 },
            { x: 2250, y: 568, key: 'tree1', ox: 0.5, oy: 1 },
            { x: 2800, y: 568, key: 'tree2', ox: 0.5, oy: 1 },
            { x: 600, y: 568, key: 'stone1', ox: 0.5, oy: 1 },
            { x: 1600, y: 568, key: 'stone1', ox: 0.5, oy: 1 },
            { x: 470, y: 450, key: 'bush1',  ox: 0.5, oy: 1 },
            { x: 1180, y: 450, key: 'bush1', ox: 0.5, oy: 1 },
            { x: 1450, y: 350, key: 'grass1', ox: 0.5, oy: 1 },
            { x: 760, y: 350, key: 'grass1', ox: 0.5, oy: 1 },
            { x: 2650, y: 320, key: 'bush1', ox: 0.5, oy: 1 }
        ];

        this.decorations = this.decorations || [];
        decoData.forEach(data => {
            const deco = this.add.image(data.x, data.y, data.key)
                .setOrigin(data.ox, data.oy)
                .setDepth(-1); // behind platforms (0) and player (5), in front of bg
            this.decorations.push(deco);
        });
```

- [ ] **Step 2: Clean up scenery on area reset**

`resetArea()` (lines 231-245) tears down and rebuilds the level. Because decorations are plain images (not in a physics group), they must be destroyed explicitly or they will pile up on every death. In `resetArea()`, right after `this.enemyWalls.clear(true, true);`, add:

```js
        if (this.decorations) {
            this.decorations.forEach(d => d.destroy());
            this.decorations = [];
        }
```

- [ ] **Step 3: Verify (browser)**

Reload and reach `GameScene`. Expected:
- Trees, stones, bushes, and grass appear along the level, sitting on the ground/platforms, **behind** the platforms and fox.
- Walk through them — they are purely visual (no collision).
- Die (fall in a pit) to trigger `resetArea()`, then replay: scenery reappears once, not doubled/stacked. Repeat a couple of deaths and confirm no visual pile-up and no console errors.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "feat: scatter environmental scenery in GameScene"
```

---

## Final verification

- [ ] Full playthrough with Console open: reach `GameScene`, walk, jump, take damage, cure an enemy, collect the rune seed, purify a barrier, die and respawn. No console errors at any point.
- [ ] Confirm placeholders that were intentionally kept still work: enemies (colored squares) patrol and are contained; spikes damage; cured animals (squares) remain; fog barriers show and are purifiable with the `[E]` prompt.
