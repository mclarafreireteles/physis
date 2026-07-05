import { Player } from '../entities/Player.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        graphics.fillStyle(0xd95a2b, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('luna', 32, 32);
        
        graphics.fillStyle(0x555555, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('block', 32, 32);

        graphics.clear();
        graphics.fillStyle(0xa83232, 1);
        graphics.fillTriangle(16, 0, 0, 32, 32, 32);
        graphics.generateTexture('spike', 32, 32);

        graphics.clear();
        graphics.fillStyle(0x4a0e4e, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('enemy', 32, 32);

        graphics.clear();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('seed', 16, 16);

        graphics.clear();
        graphics.fillStyle(0x32a852, 0.6);
        graphics.fillRect(0, 0, 40, 240);
        graphics.generateTexture('fog', 40, 240);

        graphics.clear();
        graphics.fillStyle(0x2ecc71, 1);
        graphics.fillEllipse(16, 16, 12, 28);
        graphics.generateTexture('ui_leaf', 32, 32);

        // --- Pixel-art assets ---
        const SWAMP = 'assets/free-swamp-game-tileset-pixel-art/';

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

        // --- Sunny Land: player (Foxy) + enemies + FX ---
        const SUNNY = 'assets/sunnyland/';
        this.load.spritesheet('foxy_idle', SUNNY + 'foxy-idle.png', { frameWidth: 33, frameHeight: 32 });
        this.load.spritesheet('foxy_run',  SUNNY + 'foxy-run.png',  { frameWidth: 33, frameHeight: 32 });
        this.load.spritesheet('foxy_jump', SUNNY + 'foxy-jump.png', { frameWidth: 33, frameHeight: 32 });
        this.load.spritesheet('foxy_hurt', SUNNY + 'foxy-hurt.png', { frameWidth: 33, frameHeight: 32 });
        this.load.spritesheet('opossum',   SUNNY + 'opossum.png',   { frameWidth: 36, frameHeight: 28 });
        this.load.spritesheet('frog_idle', SUNNY + 'frog-idle.png', { frameWidth: 35, frameHeight: 32 });
        this.load.spritesheet('frog_jump', SUNNY + 'frog-jump.png', { frameWidth: 35, frameHeight: 32 });
        this.load.spritesheet('enemy_death', SUNNY + 'enemy-death.png', { frameWidth: 40, frameHeight: 41 });
        this.load.image('spikes', SUNNY + 'spikes.png');
    }

    create() {
        if (!this.anims.exists('foxy_idle')) {
            this.anims.create({
                key: 'foxy_idle',
                frames: this.anims.generateFrameNumbers('foxy_idle', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1
            });
            this.anims.create({
                key: 'foxy_run',
                frames: this.anims.generateFrameNumbers('foxy_run', { start: 0, end: 5 }),
                frameRate: 12,
                repeat: -1
            });
            this.anims.create({
                key: 'foxy_rise',
                frames: this.anims.generateFrameNumbers('foxy_jump', { start: 0, end: 0 }),
                frameRate: 1,
                repeat: -1
            });
            this.anims.create({
                key: 'foxy_fall',
                frames: this.anims.generateFrameNumbers('foxy_jump', { start: 1, end: 1 }),
                frameRate: 1,
                repeat: -1
            });
            this.anims.create({
                key: 'foxy_hurt',
                frames: this.anims.generateFrameNumbers('foxy_hurt', { start: 0, end: 1 }),
                frameRate: 8,
                repeat: 0
            });
            this.anims.create({
                key: 'opossum_walk',
                frames: this.anims.generateFrameNumbers('opossum', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'frog_idle',
                frames: this.anims.generateFrameNumbers('frog_idle', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1
            });
            this.anims.create({
                key: 'frog_jump',
                frames: this.anims.generateFrameNumbers('frog_jump', { start: 0, end: 2 }),
                frameRate: 8,
                repeat: 0
            });
            this.anims.create({
                key: 'enemy_death',
                frames: this.anims.generateFrameNumbers('enemy_death', { start: 0, end: 5 }),
                frameRate: 12,
                repeat: 0
            });
            this.anims.create({
                key: 'rune_spin',
                frames: this.anims.generateFrameNumbers('rune', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }

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

        const worldWidth = 3200;
        const worldHeight = 600;
        
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        // Corruption: the forest starts "ashen" (a grey veil drains its colour)
        // and regains vibrancy as the player purifies. A screen-space overlay
        // keeps this robust across renderers — no post-processing pipeline.
        this.corruptionLevel = 1;
        this._corruption = 1;
        this.corruptionVeil = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x8b9199)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(40);
        this.applyCorruption(1);

        this.platforms = this.physics.add.staticGroup();
        this.hazards = this.physics.add.staticGroup();
        this.enemies = this.physics.add.group();
        this.seeds = this.physics.add.group();
        this.barriers = this.physics.add.staticGroup();
        this.enemyWalls = this.physics.add.staticGroup();

        this.createLevelLayout();

        this.player = new Player(this, 100, 400);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.seeds, this.platforms);
        this.physics.add.collider(this.enemies, this.enemyWalls);

        this.physics.add.collider(this.player, this.enemies, this.handleEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.hazards, this.handleHazardOverlap, null, this);
        this.physics.add.overlap(this.player, this.seeds, this.handleSeedCollection, null, this);
        this.physics.add.overlap(this.player, this.barriers, this.handleBarrierInteraction, null, this);
    }

    update() {
        this.player.update();

        if (this.bgLayers) {
            const scrollX = this.cameras.main.scrollX;
            this.bgLayers.forEach((layer, i) => {
                // Farther layers (lower i) scroll slower for depth.
                layer.tilePositionX = scrollX * (0.15 + i * 0.15);
            });
        }

        this.enemies.getChildren().forEach(enemy => {
            if (enemy.enemyType === 'opossum') {
                // Opossum faces left by default; mirror it when moving right.
                enemy.setFlipX(enemy.body.velocity.x > 0);
            } else if (enemy.enemyType === 'frog') {
                this.updateFrog(enemy);
            }
        });
    }

    updateFrog(frog) {
        const onGround = frog.body.touching.down || frog.body.blocked.down;
        if (!onGround) return;

        if (frog.anims.currentAnim && frog.anims.currentAnim.key === 'frog_jump') {
            frog.play('frog_idle', true);
        }
        if (this.time.now > frog.nextHop) {
            frog.setVelocityY(-280); // hops straight up so it never falls off a ledge
            frog.play('frog_jump', true);
            frog.nextHop = this.time.now + Phaser.Math.Between(1200, 2200);
        }
    }

    createLevelLayout() {
        const platformData = [
            { x: 0, y: 568, width: 900 },
            { x: 1050, y: 568, width: 1000 },
            { x: 2200, y: 568, width: 1000 },
            { x: 400, y: 450, width: 150 },
            { x: 700, y: 350, width: 120 },
            { x: 1100, y: 450, width: 200 },
            { x: 1400, y: 350, width: 160 },
            { x: 1700, y: 450, width: 150 },
            { x: 2350, y: 450, width: 200 },
            { x: 2600, y: 320, width: 300 }
        ];

        platformData.forEach(data => {
            const platform = this.add.tileSprite(data.x, data.y, data.width, 32, 'ground_tile');
            platform.setOrigin(0, 0);
            platform.setDepth(0);
            this.physics.add.existing(platform, true); // true = static body
            this.platforms.add(platform);
        });

        // Delimitadores Virtuais: Criados nas bordas dos buracos para conter os inimigos
        const wallData = [
            { x: 890, y: 536 },  // Borda direita da 1ª plataforma base
            { x: 1060, y: 536 }, // Borda esquerda da 2ª plataforma base
            { x: 2040, y: 536 }, // Borda direita da 2ª plataforma base
            { x: 2210, y: 536 }  // Borda esquerda da 3ª plataforma base
        ];

        wallData.forEach(data => {
            const wall = this.enemyWalls.create(data.x, data.y, 'block');
            wall.setVisible(false); // Oculto para o jogador
            wall.refreshBody();
        });

        const hazardData = [
            { x: 500, y: 536 },
            { x: 1300, y: 536 },
            { x: 1332, y: 536 },
            { x: 1800, y: 418 },
            { x: 2500, y: 536 }
        ];

        hazardData.forEach(data => {
            // Spikes sit on the surface: base at data.y + 32 (where the old
            // placeholder's base was), centred on the old tile.
            const spike = this.hazards.create(data.x + 16, data.y + 32, 'spikes');
            spike.setOrigin(0.5, 1);
            spike.setScale(2); // 15x10 art -> ~30x20 on screen
            spike.setDepth(1);
            spike.refreshBody();
        });

        this.spawnOpossum(600, 500, 80);
        this.spawnFrog(820, 500);        // saltador estacionário na 1ª plataforma
        this.spawnOpossum(1200, 500, -60);
        this.spawnOpossum(1500, 300, 50);
        this.spawnOpossum(2400, 500, 70);
        this.spawnFrog(2650, 500);       // saltador na plataforma base final

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

        // Correção de Ancoragem (Origin Pivot)
        // Posicionamento exato no eixo Y da superfície (568)
        const barrier1 = this.barriers.create(1950, 568, 'fog');
        barrier1.setOrigin(0.5, 1);
        barrier1.refreshBody();
        barrier1.cost = 2;
        this.barrierText1 = this.add.text(1900, 280, '[E] Purificar (2)', { fontSize: '14px', fill: '#aaa' }).setDepth(60);

        const finalMatriz = this.barriers.create(3100, 568, 'fog');
        finalMatriz.setOrigin(0.5, 1);
        finalMatriz.refreshBody();
        finalMatriz.cost = 4;
        this.barrierText2 = this.add.text(3020, 280, 'Árvore Matriz [E] (4)', { fontSize: '14px', fill: '#ffff00' }).setDepth(60);
    
    }

    spawnOpossum(x, y, velocityX) {
        const enemy = this.enemies.create(x, y, 'opossum');
        enemy.enemyType = 'opossum';
        enemy.setVelocityX(velocityX);
        enemy.setBounceX(1);
        enemy.setCollideWorldBounds(true);
        enemy.setPushable(false);
        enemy.body.setSize(30, 20);
        enemy.body.setOffset(3, 8);
        enemy.play('opossum_walk');
    }

    spawnFrog(x, y) {
        const frog = this.enemies.create(x, y, 'frog_idle');
        frog.enemyType = 'frog';
        frog.setCollideWorldBounds(true);
        frog.setPushable(false);
        // Frog art's feet sit at y~27 within the 32px frame (5px of empty
        // padding below), so end the collider there or it floats above ground.
        frog.body.setSize(26, 20);
        frog.body.setOffset(5, 7);
        frog.play('frog_idle');
        frog.nextHop = this.time.now + Phaser.Math.Between(800, 1800);
    }

    spawnDeathFX(x, y) {
        const fx = this.add.sprite(x, y, 'enemy_death').setDepth(4);
        fx.play('enemy_death');
        fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => fx.destroy());
    }

    // Apply the corruption veil now: 1 = fully ashen/grey, 0 = full colour.
    applyCorruption(amount) {
        this._corruption = amount;
        if (this.corruptionVeil) this.corruptionVeil.setAlpha(amount * 0.55);
    }

    // Settle the world's corruption to `target` (1 = ashen, 0 = full colour).
    setCorruption(target, duration = 1200) {
        this.corruptionLevel = target;
        if (!this.corruptionVeil) return;
        if (this.corruptionTween) this.corruptionTween.stop();
        this.corruptionTween = this.tweens.addCounter({
            from: this._corruption,
            to: target,
            duration,
            ease: 'Sine.easeInOut',
            onUpdate: t => this.applyCorruption(t.getValue())
        });
    }

    // A brief flash of colour (used on each cure), returning to the current level.
    pulseColor() {
        if (!this.corruptionVeil) return;
        this.tweens.addCounter({
            from: this.corruptionLevel,
            to: Math.max(0, this.corruptionLevel - 0.35),
            duration: 140,
            yoyo: true,
            ease: 'Quad.easeOut',
            onUpdate: t => this.applyCorruption(t.getValue()),
            onComplete: () => this.applyCorruption(this.corruptionLevel)
        });
    }

    handleEnemyCollision(player, enemy) {
        if (player.body.touching.down && enemy.body.touching.up) {
            // Stomp = "cure": bounce the player, drop a seed, poof the enemy.
            player.setVelocityY(-350);
            this.spawnSeed(enemy.x, enemy.y);
            this.spawnDeathFX(enemy.x, enemy.y);
            this.pulseColor(); // a burst of colour on each cure
            enemy.destroy();
        } else {
            this.executePlayerDamage(player, enemy);
        }
    }

    handleHazardOverlap(player, hazard) {
        this.executePlayerDamage(player, hazard);
    }

    executePlayerDamage(player, source) {
        // Se o jogador estiver invulnerável, não aplica física de repulsão
        if (player.isInvulnerable) return;
        
        player.takeDamage();
        player.setVelocityX(player.x < source.x ? -250 : 250);
        player.setVelocityY(-200);
    }

    spawnSeed(x, y) {
        const seed = this.seeds.create(x, y, 'rune');
        seed.play('rune_spin');
        seed.setBounceY(0.3);
        seed.setDepth(1);
    }

    handleSeedCollection(player, seed) {
        seed.destroy();
        player.collectSeed();
    }

    handleBarrierInteraction(player, barrier) {
        if (Phaser.Input.Keyboard.JustDown(this.player.keys.E)) {
            if (player.seeds >= barrier.cost) {
                player.seeds -= barrier.cost;
                player.updateUI();
                
                if (barrier.x < 2000) {
                    this.barrierText1.destroy();
                    this.setCorruption(0.45); // partial colour returns
                } else {
                    this.barrierText2.destroy();
                    this.setCorruption(0); // full colour: the forest is revived
                    this.add.text(230, 250, 'Floresta Revitalizada!', { fontSize: '32px', fill: '#00ff00' }).setScrollFactor(0);
                }
                barrier.destroy();
            }
        }
    }

    resetArea() {
        this.enemies.clear(true, true);
        this.seeds.clear(true, true);
        this.barriers.clear(true, true);
        this.hazards.clear(true, true);
        this.platforms.clear(true, true);
        this.enemyWalls.clear(true, true);
        if (this.decorations) {
            this.decorations.forEach(d => d.destroy());
            this.decorations = [];
        }

        if (this.barrierText1 && this.barrierText1.active) this.barrierText1.destroy();
        if (this.barrierText2 && this.barrierText2.active) this.barrierText2.destroy();

        // Area re-corrupts: snap back to fully grey.
        this.corruptionLevel = 1;
        if (this.corruptionTween) this.corruptionTween.stop();
        this.applyCorruption(1);

        this.createLevelLayout();
    }
}