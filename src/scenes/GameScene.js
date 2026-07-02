import { Player } from '../entities/Player.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Geração procedimental de texturas para o protótipo (dispensa imagens externas)
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Textura Luna (Raposa - Laranja)
        graphics.fillStyle(0xd95a2b, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('luna', 32, 32);
        
        // Textura Chão (Terra morta - Cinza escuro)
        graphics.clear();
        graphics.fillStyle(0x555555, 1);
        graphics.fillRect(0, 0, 800, 40);
        graphics.generateTexture('ground', 800, 40);

        // Textura Inimigo (Corrompido - Roxo escuro)
        graphics.clear();
        graphics.fillStyle(0x4a0e4e, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('enemy', 32, 32);

        // Textura Semente (Amarelo brilhante)
        graphics.clear();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('seed', 16, 16);

        // Textura Névoa/Barreira (Verde tóxico translúcido)
        graphics.clear();
        graphics.fillStyle(0x32a852, 0.6);
        graphics.fillRect(0, 0, 40, 200);
        graphics.generateTexture('fog', 40, 200);
    }

    create() {
        // Ambiente físico
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 580, 'ground');
        this.platforms.create(600, 450, 'ground').setScale(0.3, 1).refreshBody();
        this.platforms.create(200, 350, 'ground').setScale(0.3, 1).refreshBody();

        // Inicialização do Jogador
        this.player = new Player(this, 100, 500);

        // Grupos físicos
        this.enemies = this.physics.add.group();
        this.seeds = this.physics.add.group();
        this.barriers = this.physics.add.staticGroup();

        // Criação de Barreira (Custa 2 sementes)
        const barrier = this.barriers.create(500, 480, 'fog');
        barrier.cost = 2; // Custo estabelecido no GDD
        this.barrierText = this.add.text(460, 360, '[E] Purificar (2)', { fontSize: '14px', fill: '#aaa' });

        this.spawnInitialEnemies();

        // Colisões básicas
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.seeds, this.platforms);

        // Interação de Combate/Dano
        this.physics.add.collider(this.player, this.enemies, this.handleEnemyCollision, null, this);

        // Coleta de Sementes
        this.physics.add.overlap(this.player, this.seeds, this.handleSeedCollection, null, this);

        // Interação com Barreira
        this.physics.add.overlap(this.player, this.barriers, this.handleBarrierInteraction, null, this);
    }

    update() {
        this.player.update();
    }

    spawnInitialEnemies() {
        const enemy1 = this.enemies.create(300, 500, 'enemy');
        enemy1.setVelocityX(50);
        enemy1.setBounceX(1);
        enemy1.setCollideWorldBounds(true);

        const enemy2 = this.enemies.create(650, 400, 'enemy');
        enemy2.setVelocityX(-50);
        enemy2.setBounceX(1);
    }

    handleEnemyCollision(player, enemy) {
        // Verifica se a colisão foi por cima (estilo Mario)
        if (player.body.touching.down && enemy.body.touching.up) {
            player.setVelocityY(-300); // Quique
            this.spawnSeed(enemy.x, enemy.y);
            enemy.destroy();
        } else {
            // Dano recebido e empurrão
            player.takeDamage();
            player.setVelocityX(player.x < enemy.x ? -200 : 200);
            player.setVelocityY(-200);
        }
    }

    spawnSeed(x, y) {
        const seed = this.seeds.create(x, y, 'seed');
        seed.setBounceY(0.4);
    }

    handleSeedCollection(player, seed) {
        seed.destroy();
        player.collectSeed();
    }

    handleBarrierInteraction(player, barrier) {
        // Lê input 'E' (JustDown previne múltiplas ativações contínuas)
        if (Phaser.Input.Keyboard.JustDown(this.player.keys.E)) {
            if (player.seeds >= barrier.cost) {
                player.seeds -= barrier.cost;
                player.updateUI();
                barrier.destroy();
                this.barrierText.destroy();
                
                // Feedback visual: O mundo ganha cor
                this.cameras.main.setBackgroundColor('#2e5c3a'); // Verde musgo orgânico
                
                // Em um jogo completo, isto chamaria a Árvore Matriz
                const winText = this.add.text(400, 100, 'Caminho Purificado!', { fontSize: '24px', fill: '#00ff00' });
                winText.setOrigin(0.5);
            }
        }
    }

    resetArea() {
        // Implementação da punição estrita do GDD
        this.enemies.clear(true, true);
        this.seeds.clear(true, true);
        this.barriers.clear(true, true);
        
        // Reseta cores
        this.cameras.main.setBackgroundColor('#3a3a3a');
        
        // Recria cenário
        this.spawnInitialEnemies();
        const barrier = this.barriers.create(500, 480, 'fog');
        barrier.cost = 2;
        if (!this.barrierText.active) {
            this.barrierText = this.add.text(460, 360, '[E] Purificar (2)', { fontSize: '14px', fill: '#aaa' });
        }
    }
}