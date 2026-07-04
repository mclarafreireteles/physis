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
    }

    create() {
        const worldWidth = 3200;
        const worldHeight = 600;
        
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        this.platforms = this.physics.add.staticGroup();
        this.hazards = this.physics.add.staticGroup();
        this.enemies = this.physics.add.group();
        this.seeds = this.physics.add.group();
        this.barriers = this.physics.add.staticGroup();
        this.curedAnimals = this.physics.add.group();
        this.enemyWalls = this.physics.add.staticGroup();

        this.createLevelLayout();

        this.player = new Player(this, 100, 400);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.seeds, this.platforms);
        this.physics.add.collider(this.curedAnimals, this.platforms)    
        this.physics.add.collider(this.enemies, this.enemyWalls);

        this.physics.add.collider(this.player, this.enemies, this.handleEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.hazards, this.handleHazardOverlap, null, this);
        this.physics.add.overlap(this.player, this.seeds, this.handleSeedCollection, null, this);
        this.physics.add.overlap(this.player, this.barriers, this.handleBarrierInteraction, null, this);
    }

    update() {
        this.player.update();
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
            const platform = this.platforms.create(data.x, data.y, 'block');
            platform.setOrigin(0, 0);
            platform.setDisplaySize(data.width, 32);
            platform.refreshBody();
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
            const spike = this.hazards.create(data.x, data.y, 'spike');
            spike.setOrigin(0, 0);
            // Ajusta o volume delimitador (Bounding Box) do espinho para ser mais perdoável
            spike.body.setSize(24, 24);
            spike.body.setOffset(4, 8);
            spike.refreshBody();
        });

        this.spawnEnemy(600, 500, 80);
        this.spawnEnemy(900, 500, -50);  // Novo inimigo inserido para balanceamento
        this.spawnEnemy(1200, 500, -60);
        this.spawnEnemy(1500, 300, 50);
        this.spawnEnemy(2400, 500, 70);  // Novo inimigo após a primeira barreira
        this.spawnEnemy(2650, 500, 100);

        // Correção de Ancoragem (Origin Pivot)
        // Posicionamento exato no eixo Y da superfície (568)
        const barrier1 = this.barriers.create(1950, 568, 'fog');
        barrier1.setOrigin(0.5, 1);
        barrier1.refreshBody();
        barrier1.cost = 2;
        this.barrierText1 = this.add.text(1900, 280, '[E] Purificar (2)', { fontSize: '14px', fill: '#aaa' });

        const finalMatriz = this.barriers.create(3100, 568, 'fog');
        finalMatriz.setOrigin(0.5, 1);
        finalMatriz.refreshBody();
        finalMatriz.cost = 4;
        this.barrierText2 = this.add.text(3020, 280, 'Árvore Matriz [E] (4)', { fontSize: '14px', fill: '#ffff00' });
    
    }

    spawnEnemy(x, y, velocityX) {
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocityX(velocityX);
        enemy.setBounceX(1);
        enemy.setCollideWorldBounds(true);
        
        enemy.setPushable(false);
    }

    handleEnemyCollision(player, enemy) {
        if (enemy.texture.key === 'animal_cured') return;

        if (player.body.touching.down && enemy.body.touching.up) {
            
            player.setVelocityY(-350); 
            this.spawnSeed(enemy.x, enemy.y);
            
            enemy.setTexture('animal_cured');
            enemy.setVelocity(0, -150); 
            enemy.setImmovable(true);
            
            this.time.delayedCall(0, () => {
                this.enemies.remove(enemy);
                this.curedAnimals.add(enemy);
                
                enemy.setCollideWorldBounds(true); 
            });

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
        const seed = this.seeds.create(x, y, 'seed');
        seed.setBounceY(0.3);
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
                    this.cameras.main.setBackgroundColor('#2e5c3a');
                } else {
                    this.barrierText2.destroy();
                    this.cameras.main.setBackgroundColor('#1d4a2b');
                    this.add.text(this.cameras.main.scrollX + 250, 250, 'Floresta Revitalizada!', { fontSize: '32px', fill: '#00ff00' });
                }
                barrier.destroy();
            }
        }
    }

    resetArea() {
        this.enemies.clear(true, true);
        this.curedAnimals.clear(true, true);
        this.seeds.clear(true, true);
        this.barriers.clear(true, true);
        this.hazards.clear(true, true);
        this.platforms.clear(true, true);
        this.enemyWalls.clear(true, true);
        
        if (this.barrierText1 && this.barrierText1.active) this.barrierText1.destroy();
        if (this.barrierText2 && this.barrierText2.active) this.barrierText2.destroy();

        this.cameras.main.setBackgroundColor('#3a3a3a');
        this.createLevelLayout();
    }
}