export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'luna');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        this.body.setSize(32, 32);
        
        this.health = 3;
        this.seeds = 0;
        this.spawnPoint = { x, y };
        
        // Controle de Estado: Previne dano contínuo instantâneo
        this.isInvulnerable = false;
        
        this.keys = scene.input.keyboard.addKeys('W,A,D,E');
        this.uiText = scene.add.text(16, 16, '', { fontSize: '18px', fill: '#ffffff' });
        this.uiText.setScrollFactor(0);
        this.updateUI();
    }

    update() {
        if (this.keys.A.isDown) {
            this.setVelocityX(-200);
        } else if (this.keys.D.isDown) {
            this.setVelocityX(200);
        } else {
            this.setVelocityX(0);
        }

        if (this.keys.W.isDown && this.body.touching.down) {
            this.setVelocityY(-450);
        }

        // Gatilho de Plano de Morte (Kill Plane)
        if (this.y > 570) {
            this.die();
        }
    }

    takeDamage() {
        // Ignora a chamada de dano se o jogador estiver no período de invulnerabilidade
        if (this.isInvulnerable) return;

        this.health -= 1;
        this.isInvulnerable = true; // Bloqueia novos danos
        this.setTint(0xff0000);
        
        // Define o tempo de invulnerabilidade (1000 milissegundos)
        this.scene.time.delayedCall(1000, () => {
            this.clearTint();
            this.isInvulnerable = false;
        });
        
        if (this.health <= 0) {
            this.die();
        }
        this.updateUI();
    }

    die() {
        this.health = 3;
        this.seeds = 0;
        this.isInvulnerable = false;
        this.clearTint();
        this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.setVelocity(0, 0);
        this.scene.resetArea();
        this.updateUI();
    }

    collectSeed() {
        this.seeds += 1;
        this.updateUI();
    }

    updateUI() {
        this.uiText.setText(`Folhas (Vida): ${this.health} | Sementes de Luz: ${this.seeds}`);
    }
}