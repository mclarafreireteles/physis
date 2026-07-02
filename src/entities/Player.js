export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'luna');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        this.body.setSize(32, 32);
        
        // Atributos do GDD
        this.health = 3;
        this.seeds = 0;
        this.spawnPoint = { x, y };
        
        // Controles W, A, D, E
        this.keys = scene.input.keyboard.addKeys('W,A,D,E');
        
        // UI do jogador vinculada à cena
        this.uiText = scene.add.text(16, 16, '', { fontSize: '18px', fill: '#ffffff' });
        this.uiText.setScrollFactor(0); // Fixo na tela
        this.updateUI();
    }

    update() {
        // Movimentação A/D
        if (this.keys.A.isDown) {
            this.setVelocityX(-200);
        } else if (this.keys.D.isDown) {
            this.setVelocityX(200);
        } else {
            this.setVelocityX(0);
        }

        // Pulo W
        if (this.keys.W.isDown && this.body.touching.down) {
            this.setVelocityY(-450);
        }
    }

    takeDamage() {
        this.health -= 1;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => this.clearTint());
        
        if (this.health <= 0) {
            this.die();
        }
        this.updateUI();
    }

    die() {
        // Reseta atributos e posição para o último canteiro (checkpoint)
        this.health = 3;
        this.seeds = 0;
        this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.scene.resetArea(); // Chama método da cena para resetar inimigos/névoa
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